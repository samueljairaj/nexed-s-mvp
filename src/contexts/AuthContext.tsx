
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

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
  isAdmin?: boolean; // Make optional for backward compatibility
  dsoProfile: DsoProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<any>;
  updateProfile: (data: any) => Promise<void>;
  updateDSOProfile: (data: any) => Promise<void>;
  completeOnboarding?: () => Promise<boolean>; // Add this missing method for compatibility 
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
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);

        if (session) {
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsDSO(false);
          setDsoProfile(null);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsDSO(false);
          setDsoProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async (user: User) => {
    if (!user) return;

    try {
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

      // Check if the user has a DSO profile
      if (profile?.role === 'dso') {
        setIsDSO(true);
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
        setIsDSO(false);
        setDsoProfile(null);
      }
      
      // Check if user is admin (optional)
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    }
  };

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error(`Login failed: ${error.message}`);
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
      const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: `${data.firstName} ${data.lastName}`,
            role: 'student',
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
              role: 'student',
            },
          ]);

        if (profileError) {
          throw profileError;
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

  const updateProfile = async (data: any) => {
    try {
      const updates = {
        id: currentUser?.id,
        updated_at: new Date().toISOString(),
        ...data,
      };

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
