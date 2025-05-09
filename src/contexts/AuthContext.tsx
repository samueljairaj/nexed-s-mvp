import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { debugAuthState } from "@/utils/propertyMapping";

// Export VisaType for reusability
export type VisaType = "F1" | "J1" | "H1B" | "CPT" | "OPT" | "STEM_OPT" | "Other";

export interface DsoProfile {
  id: string;
  title?: string;
  department?: string;
  office_location?: string;
  office_hours?: string;
  contact_email?: string;
  contact_phone?: string;
  university_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: Database["public"]["Tables"]["profiles"]["Row"] | null;
  session: Session | null;
  isDSO: boolean;
  isAdmin?: boolean;
  dsoProfile: DsoProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<any>;
  signup: (data: any) => Promise<any>; // Alias for signUp
  updateProfile: (data: any) => Promise<void>;
  updateDSOProfile: (data: any) => Promise<void>;
  completeOnboarding: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDSO, setIsDSO] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dsoProfile, setDsoProfile] = useState<DsoProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup auth state listeners FIRST before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", !!session);
        setSession(session);

        if (session) {
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsDSO(false);
          setDsoProfile(null);
          // Always make sure loading is false even when session is null
          setIsLoading(false);
        }
      }
    );

    // Then load current session
    const loadSession = async () => {
      setIsLoading(true);
      try {
        console.log("Loading initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(session);

        if (session) {
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          console.log("No active session found");
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsDSO(false);
          setDsoProfile(null);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load session");
      } finally {
        // CRITICAL: Always set loading to false, even on error
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timed out - forcing loading state to false");
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    loadSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const loadUser = async (user: User | undefined) => {
    if (!user) {
      console.log("No user to load");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Loading user profile for:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setCurrentUser(profile);
      setIsAuthenticated(true);

      // Debug the user profile
      debugAuthState(profile);

      // Check if the user has a DSO role
      const isUserDSO = profile?.role === 'dso';
      console.log("User DSO status:", isUserDSO);
      setIsDSO(isUserDSO);

      // If DSO, load DSO profile
      if (isUserDSO) {
        const { data: dsoData, error: dsoError } = await supabase
          .from('dso_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dsoError) {
          console.error("Error fetching DSO profile:", dsoError);
          setDsoProfile(null);
        } else {
          setDsoProfile(dsoData as DsoProfile);
        }
      } else {
        setDsoProfile(null);
      }
      
      // Check if user is admin (optional)
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    } finally {
      // CRITICAL: Always set loading to false when done
      setIsLoading(false);
    }
  };

  // Ensure the login method is properly handling authentication and errors
  const login = async (email: string, password: string) => {
    try {
      // Use email/password authentication instead of OAuth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // If successful, the session change will be caught by the onAuthStateChange listener
      toast.success("Login successful!");
      return;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error(`Login failed: ${error.message}`);
      throw error; // Re-throw so calling code can handle it
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsDSO(false);
      setDsoProfile(null);
      navigate("/");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const signUp = async (data: any) => {
    try {
      // Determine if this is a DSO signup based on role field
      const isDsoSignup = data.role === 'dso';
      
      const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: `${data.firstName} ${data.lastName}`,
            role: isDsoSignup ? 'dso' : 'student',
          }
        }
      });

      if (error) {
        throw error;
      }

      // After successful signup, create a user profile
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              role: isDsoSignup ? 'dso' : 'student',
              // Add DSO-specific fields if the user is signing up as a DSO
              ...(isDsoSignup && {
                university_name: data.universityName,
                university_country: data.universityCountry,
                sevis_id: data.sevisId
              })
            },
          ]);

        if (profileError) {
          throw profileError;
        }

        // If this is a DSO signup, also create a DSO profile entry
        if (isDsoSignup && data.universityName) {
          const { error: dsoProfileError } = await supabase
            .from('dso_profiles')
            .insert([
              {
                id: user.id,
                university_name: data.universityName,
                university_country: data.universityCountry,
                sevis_id: data.sevisId
              },
            ]);

          if (dsoProfileError) {
            console.error("Error creating DSO profile:", dsoProfileError);
            // Don't throw here, allow the signup to continue even if the DSO profile creation fails
          }
        }
      }

      toast.success("Signup successful! Please check your email to verify your account.");
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      toast.error(`Signup failed: ${error.message}`);
      return false;
    }
  };

  const signup = signUp;

  const updateProfile = async (data: any) => {
    try {
      const updates = {
        id: currentUser?.id,
        updated_at: new Date().toISOString(),
        ...data,
      };

      // Remove 'returning' option which is not supported
      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }

      // Refresh user data
      const { data: updatedProfile, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser?.id)
        .single();

      if (refreshError) {
        throw refreshError;
      }

      setCurrentUser(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update failed:", error.message);
      toast.error(`Profile update failed: ${error.message}`);
    }
  };

  const updateDSOProfile = async (data: any) => {
    if (!currentUser?.id) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    try {
      const updates = {
        ...data,
        id: currentUser.id,
        updated_at: new Date().toISOString(),
      };

      // Remove 'returning' option which is not supported
      const { error } = await supabase
        .from('dso_profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }

      // Refresh DSO profile data
      const { data: updatedDSOProfile, error: refreshError } = await supabase
        .from('dso_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (refreshError) {
        console.error("Error refreshing DSO profile:", refreshError);
        toast.error("Failed to refresh DSO profile data.");
      } else {
        setDsoProfile(updatedDSOProfile as DsoProfile);
        toast.success("DSO Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("DSO Profile update failed:", error);
      toast.error(`DSO Profile update failed: ${error.message}`);
    }
  };
  
  // Add the completeOnboarding method
  const completeOnboarding = async (): Promise<boolean> => {
    try {
      if (!currentUser?.id) {
        toast.error("User ID not found. Please log in again.");
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        onboarding_complete: true
      });
      
      return true;
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error(`Failed to complete onboarding: ${error.message}`);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    session,
    isDSO,
    isAdmin,
    dsoProfile,
    login,
    logout,
    signUp,
    signup,
    updateProfile,
    updateDSOProfile,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
