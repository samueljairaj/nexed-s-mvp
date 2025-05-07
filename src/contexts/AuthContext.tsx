import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export type VisaType = "F1" | "J1" | "H1B" | "Other" | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  visaType: VisaType;
  university?: string;
  courseStartDate?: Date;
  usEntryDate?: Date;
  employmentStartDate?: Date;
  onboardingComplete: boolean;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  // Set up auth state listener and check current session
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile data from profiles table
          setTimeout(async () => {
            await fetchUserProfile(session.user);
          }, 0);
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        await fetchUserProfile(data.session.user);
      } else {
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUser({
          id: user.id,
          name: data.name || '',
          email: data.email || user.email || '',
          country: data.country || '',
          visaType: data.visa_type as VisaType,
          university: data.university || undefined,
          courseStartDate: data.course_start_date ? new Date(data.course_start_date) : undefined,
          usEntryDate: data.us_entry_date ? new Date(data.us_entry_date) : undefined,
          employmentStartDate: data.employment_start_date ? new Date(data.employment_start_date) : undefined,
          onboardingComplete: data.onboarding_complete || false
        });
      } else {
        // Profile not found, create one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            email: user.email,
            onboarding_complete: false
          }]);

        if (insertError) throw insertError;
        
        setCurrentUser({
          id: user.id,
          name: '',
          email: user.email || '',
          country: '',
          visaType: null,
          onboardingComplete: false
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully! Please check your email for verification.");
      return;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(`Signup failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Successfully signed in
      toast.success("Logged in successfully");
      
      // Navigate based on onboarding status
      // The actual navigation will happen in the useEffect when user profile is loaded
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.info("Logged out");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (currentUser && currentUser.id) {
      try {
        // Convert date objects to strings for the database
        const dbData: any = {
          ...data,
          course_start_date: data.courseStartDate ? data.courseStartDate.toISOString().split('T')[0] : undefined,
          us_entry_date: data.usEntryDate ? data.usEntryDate.toISOString().split('T')[0] : undefined,
          employment_start_date: data.employmentStartDate ? data.employmentStartDate.toISOString().split('T')[0] : undefined,
          // Fix: Map visaType to visa_type for database compatibility
          visa_type: data.visaType, 
          // Remove fields that don't exist in the database table
          courseStartDate: undefined,
          usEntryDate: undefined,
          employmentStartDate: undefined,
          visaType: undefined // Remove visaType as we're using visa_type instead
        };
        
        // Remove undefined fields
        Object.keys(dbData).forEach(key => {
          if (dbData[key] === undefined) {
            delete dbData[key];
          }
        });
        
        const { error } = await supabase
          .from('profiles')
          .update(dbData)
          .eq('id', currentUser.id);

        if (error) throw error;
        
        // Update local state
        setCurrentUser(prev => ({
          ...prev!,
          ...data,
        }));
      } catch (error: any) {
        console.error("Error updating profile:", error);
        toast.error(`Failed to update profile: ${error.message}`);
        throw error; // Propagate the error so the calling function can handle it
      }
    }
  };

  const completeOnboarding = async () => {
    if (currentUser && currentUser.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', currentUser.id);

        if (error) throw error;
        
        // Update local state
        setCurrentUser(prev => ({
          ...prev!,
          onboardingComplete: true,
        }));
        
        // Navigate to dashboard
        navigate("/app/dashboard");
      } catch (error: any) {
        console.error("Error completing onboarding:", error);
        toast.error(`Failed to complete onboarding: ${error.message}`);
      }
    }
  };

  // Check if user should be directed to onboarding
  useEffect(() => {
    if (currentUser && !isLoading) {
      // If user is logged in but hasn't completed onboarding
      if (!currentUser.onboardingComplete && !window.location.pathname.includes("/onboarding")) {
        navigate("/onboarding");
      }
    }
  }, [currentUser, isLoading, navigate]);

  const value = {
    currentUser,
    isAuthenticated: !!session,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
