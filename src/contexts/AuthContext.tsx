import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  user_type: "student" | "dso";
  onboardingComplete: boolean;
  universityName?: string;
  universityCountry?: string;
  sevisId?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDSO: boolean;
  signup: (email: string, password: string, userType: "student" | "dso", universityInfo?: { universityName: string; universityCountry: string; sevisId: string; }) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession()
    console.log("Initial session:", session);

    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchUserProfile(user.id);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      let { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile.");
      }

      if (userProfile) {
        const user: User = {
          id: userId,
          email: userProfile.email,
          user_type: userProfile.user_type,
          onboardingComplete: userProfile.onboarding_complete,
          universityName: userProfile.university_name || undefined,
          universityCountry: userProfile.university_country || undefined,
          sevisId: userProfile.sevis_id || undefined,
          firstName: userProfile.first_name || undefined,
          lastName: userProfile.last_name || undefined,
        };
        setCurrentUser(user);
        console.log("User profile fetched:", user);
      } else {
        console.warn("User profile not found, redirecting to onboarding");
        navigate('/onboarding');
      }
    } catch (error) {
      console.error("Error fetching or processing user profile:", error);
      toast.error("Failed to process user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userType: "student" | "dso", universityInfo?: { universityName: string; universityCountry: string; sevisId: string; }) => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            user_type: userType,
            university_name: universityInfo?.universityName,
            university_country: universityInfo?.universityCountry,
            sevis_id: universityInfo?.sevisId,
          },
        },
      });

      if (error) throw error;

      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error: any) {
      console.error("Signin error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      navigate('/');
    } catch (error: any) {
      console.error("Signout error:", error);
      toast.error("Failed to sign out.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    isDSO: currentUser?.user_type === "dso",
    signup,
    signin,
    signout,
    refreshUser: () => currentUser ? fetchUserProfile(currentUser.id) : Promise.resolve(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
