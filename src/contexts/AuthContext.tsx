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
  degreeLevel?: string;     // Added field
  fieldOfStudy?: string;    // Added field
  isSTEM?: boolean;         // Added field
  courseStartDate?: Date;
  usEntryDate?: Date;
  employmentStartDate?: Date;
  onboardingComplete: boolean;
  dateOfBirth?: Date | string;
  passportExpiryDate?: Date | string;
  phone?: string;
  passportNumber?: string;
  address?: string;
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
          degreeLevel: data.degree_level || undefined,  // Map from DB column
          fieldOfStudy: data.field_of_study || undefined,  // Map from DB column
          isSTEM: data.is_stem || false,  // Map from DB column
          courseStartDate: data.course_start_date ? new Date(data.course_start_date) : undefined,
          usEntryDate: data.us_entry_date ? new Date(data.us_entry_date) : undefined,
          employmentStartDate: data.employment_start_date ? new Date(data.employment_start_date) : undefined,
          onboardingComplete: data.onboarding_complete || false,
          dateOfBirth: data.date_of_birth || undefined,
          passportExpiryDate: data.passport_expiry_date || undefined,
          phone: data.phone || undefined,
          passportNumber: data.passport_number || undefined,
          address: data.address || undefined
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
          onboardingComplete: false,
          dateOfBirth: undefined,
          passportExpiryDate: undefined,
          phone: undefined,
          passportNumber: undefined,
          address: undefined
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
        // Create a new object for database fields
        const dbData: any = { ...data };
        
        // Handle date fields being passed to the database
        // Map properties to database column names
        if (data.courseStartDate) {
          const dateStr = typeof data.courseStartDate === 'string' 
            ? data.courseStartDate 
            : formatDateToString(data.courseStartDate);
          dbData.course_start_date = dateStr;
          delete dbData.courseStartDate;
        }
        
        if (data.usEntryDate) {
          const dateStr = typeof data.usEntryDate === 'string' 
            ? data.usEntryDate 
            : formatDateToString(data.usEntryDate);
          dbData.us_entry_date = dateStr;
          delete dbData.usEntryDate;
        }
        
        if (data.employmentStartDate) {
          const dateStr = typeof data.employmentStartDate === 'string' 
            ? data.employmentStartDate 
            : formatDateToString(data.employmentStartDate);
          dbData.employment_start_date = dateStr;
          delete dbData.employmentStartDate;
        }
        
        // Map visa type
        if (data.visaType !== undefined) {
          dbData.visa_type = data.visaType;
          delete dbData.visaType;
        }
        
        // Handle personal info fields
        if (data.dateOfBirth) {
          dbData.date_of_birth = typeof data.dateOfBirth === 'string' 
            ? data.dateOfBirth 
            : formatDateToString(data.dateOfBirth);
          delete dbData.dateOfBirth;
        }
        
        if (data.passportExpiryDate) {
          dbData.passport_expiry_date = typeof data.passportExpiryDate === 'string' 
            ? data.passportExpiryDate 
            : formatDateToString(data.passportExpiryDate);
          delete dbData.passportExpiryDate;
        }

        if (data.phone !== undefined) {
          dbData.phone = data.phone;
          delete dbData.phone;
        }

        if (data.passportNumber !== undefined) {
          dbData.passport_number = data.passportNumber;
          delete dbData.passportNumber;
        }

        if (data.address !== undefined) {
          dbData.address = data.address;
          delete dbData.address;
        }
        
        // Handle academic fields
        if (data.degreeLevel !== undefined) {
          dbData.degree_level = data.degreeLevel;
          delete dbData.degreeLevel;
        }
        
        if (data.fieldOfStudy !== undefined) {
          dbData.field_of_study = data.fieldOfStudy;
          delete dbData.fieldOfStudy;
        }
        
        if (data.isSTEM !== undefined) {
          dbData.is_stem = data.isSTEM;
          delete dbData.isSTEM;
        }
        
        // Remove undefined fields
        Object.keys(dbData).forEach(key => {
          if (dbData[key] === undefined) {
            delete dbData[key];
          }
        });
        
        console.log("Sending to database:", dbData);
        
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
        
        // The navigation is now handled in OnboardingComplete.tsx
        // This ensures that the state is updated before navigation
        return true;
      } catch (error: any) {
        console.error("Error completing onboarding:", error);
        toast.error(`Failed to complete onboarding: ${error.message}`);
        throw error; // Re-throw the error so the calling function can handle it
      }
    }
    return false;
  };

  // Helper function to safely format dates
  const formatDateToString = (date: Date): string => {
    try {
      // Format as YYYY-MM-DD manually
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      // Return today's date as fallback
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
