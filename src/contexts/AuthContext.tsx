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

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: Database["public"]["Tables"]["profiles"]["Row"] | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<any>;
  signup: (data: any) => Promise<any>; // Alias for signUp
  updateProfile: (data: any) => Promise<void>;
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
  const navigate = useNavigate();

  // Keep track of active timeouts to clear them when needed
  const [authTimeoutId, setAuthTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup auth state listeners FIRST before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", !!session);
        
        if (session) {
          setSession(session);
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          setSession(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
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

        if (session) {
          setSession(session);
          setIsAuthenticated(true);
          await loadUser(session?.user);
        } else {
          console.log("No active session found");
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading session:", error);
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

    setAuthTimeoutId(timeout);
    loadSession();

    return () => {
      subscription.unsubscribe();
      if (authTimeoutId) clearTimeout(authTimeoutId);
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
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (profile) {
        setCurrentUser(profile);

        // Debug the user profile
        debugAuthState(profile);
      } else {
        console.log("User profile not found, should have been created by database trigger");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
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
      
      // Provide user-friendly error messages
      let errorMessage = "Login failed";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before logging in";
      } else {
        errorMessage = `Login failed: ${error.message}`;
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw so calling code can handle it
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSession(null);
      navigate("/");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  // Simplified signUp function with better error handling
  const signUp = async (data: any) => {
    try {
      console.log("Starting signUp process with data:", { 
        email: data.email, 
        firstName: data.firstName, 
        lastName: data.lastName 
      });
      
      // Create the auth user in a single operation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: `${data.firstName} ${data.lastName}`,
            role: 'student',
            first_name: data.firstName,
            last_name: data.lastName
          }
        }
      });

      if (authError) {
        // Provide more specific error messages
        if (authError.message.includes("already registered")) {
          toast.error("This email is already registered. Please use a different email or try logging in.");
        } else {
          toast.error(`Signup failed: ${authError.message}`);
        }
        return false;
      }

      console.log("Auth user created successfully:", !!authData.user);
      
      // If we got here, the signup was successful
      toast.success("Account created successfully!");
      return true;
      
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      toast.error(`Signup failed: ${error.message}`);
      return false;
    }
  };

  const signup = signUp; // Alias for compatibility

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
    login,
    logout,
    signUp,
    signup,
    updateProfile,
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
