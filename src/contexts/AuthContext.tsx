
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  user_type: "student" | "dso";
  onboardingComplete: boolean;
  role?: "student" | "dso";
  // Basic profile info
  name?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  currentCountry?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  nationality?: string;
  
  // Visa information
  visaType?: string;
  visaStatus?: string;
  visa_expiry_date?: string;
  usEntryDate?: string;
  i94Number?: string;
  sevisId?: string;
  
  // Academic information
  university?: string;
  universityId?: string;
  university_id?: string;
  universityName?: string;
  universityCountry?: string;
  fieldOfStudy?: string;
  degreeLevel?: string;
  courseStartDate?: string;
  graduationDate?: string;
  isSTEM?: boolean;
  dsoContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  
  // Employment information
  employmentStatus?: string;
  employerName?: string;
  employer?: string;
  jobTitle?: string;
  employmentStartDate?: string;
  employmentEndDate?: string;
  authType?: string;
  authStartDate?: string;
  authEndDate?: string;
  eadNumber?: string;
  unemploymentDays?: string;
  eVerifyNumber?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDSO: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, userType?: "student" | "dso", universityInfo?: { universityName: string; universityCountry: string; sevisId: string; }) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateDSOProfile?: (updates: any) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  dsoProfile?: any;
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
          user_type: userProfile.role === 'dso' ? 'dso' : 'student',
          role: userProfile.role === 'dso' ? 'dso' : 'student',
          onboardingComplete: userProfile.onboarding_complete,
          // Basic info
          name: userProfile.name,
          country: userProfile.country,
          phone: userProfile.phone,
          address: userProfile.address,
          dateOfBirth: userProfile.date_of_birth,
          passportNumber: userProfile.passport_number,
          passportExpiryDate: userProfile.passport_expiry_date,
          nationality: userProfile.nationality,
          
          // Visa info - only accessing fields that exist in the database
          visaType: userProfile.visa_type,
          visaStatus: undefined, // Not in database schema
          visa_expiry_date: userProfile.visa_expiry_date,
          usEntryDate: userProfile.us_entry_date,
          i94Number: undefined, // Not in database schema
          sevisId: undefined, // Not in database schema
          
          // Academic info
          university: userProfile.university,
          universityId: userProfile.university_id,
          university_id: userProfile.university_id,
          fieldOfStudy: userProfile.field_of_study,
          degreeLevel: userProfile.degree_level,
          courseStartDate: userProfile.course_start_date,
          graduationDate: undefined, // Not in database schema
          isSTEM: userProfile.is_stem,
          
          // Employment info
          employmentStatus: userProfile.employment_status,
          employerName: userProfile.employer_name,
          employer: userProfile.employer_name, // Alias for backward compatibility
          jobTitle: userProfile.job_title,
          employmentStartDate: userProfile.employment_start_date,
          employmentEndDate: undefined, // Not in database schema
          authType: userProfile.auth_type,
          authStartDate: userProfile.auth_start_date,
          authEndDate: userProfile.auth_end_date,
          eadNumber: userProfile.ead_number,
          unemploymentDays: userProfile.unemployment_days,
          eVerifyNumber: userProfile.e_verify_number,
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

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error("No user logged in");
    
    setIsLoading(true);
    try {
      // Map camelCase to snake_case for database
      const dbUpdates: Record<string, any> = {};
      
      // Map common fields
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.passportNumber !== undefined) dbUpdates.passport_number = updates.passportNumber;
      if (updates.passportExpiryDate !== undefined) dbUpdates.passport_expiry_date = updates.passportExpiryDate;
      if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
      
      // Visa fields
      if (updates.visaType !== undefined) dbUpdates.visa_type = updates.visaType;
      if (updates.visa_expiry_date !== undefined) dbUpdates.visa_expiry_date = updates.visa_expiry_date;
      if (updates.usEntryDate !== undefined) dbUpdates.us_entry_date = updates.usEntryDate;
      
      // Academic fields
      if (updates.university !== undefined) dbUpdates.university = updates.university;
      if (updates.fieldOfStudy !== undefined) dbUpdates.field_of_study = updates.fieldOfStudy;
      if (updates.degreeLevel !== undefined) dbUpdates.degree_level = updates.degreeLevel;
      if (updates.courseStartDate !== undefined) dbUpdates.course_start_date = updates.courseStartDate;
      if (updates.isSTEM !== undefined) dbUpdates.is_stem = updates.isSTEM;
      
      // Employment fields
      if (updates.employmentStatus !== undefined) dbUpdates.employment_status = updates.employmentStatus;
      if (updates.employerName !== undefined) dbUpdates.employer_name = updates.employerName;
      if (updates.jobTitle !== undefined) dbUpdates.job_title = updates.jobTitle;
      if (updates.employmentStartDate !== undefined) dbUpdates.employment_start_date = updates.employmentStartDate;
      if (updates.authType !== undefined) dbUpdates.auth_type = updates.authType;
      if (updates.authStartDate !== undefined) dbUpdates.auth_start_date = updates.authStartDate;
      if (updates.authEndDate !== undefined) dbUpdates.auth_end_date = updates.authEndDate;
      if (updates.eadNumber !== undefined) dbUpdates.ead_number = updates.eadNumber;
      if (updates.unemploymentDays !== undefined) dbUpdates.unemployment_days = updates.unemploymentDays;
      if (updates.eVerifyNumber !== undefined) dbUpdates.e_verify_number = updates.eVerifyNumber;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!currentUser) throw new Error("No user logged in");
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, onboardingComplete: true } : null);
      toast.success("Onboarding completed!");
    } catch (error: any) {
      console.error("Complete onboarding error:", error);
      toast.error(`Failed to complete onboarding: ${error.message}`);
      throw error;
    }
  };

  const signup = async (email: string, password: string, userType: "student" | "dso" = "student", universityInfo?: { universityName: string; universityCountry: string; sevisId: string; }) => {
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

  // Alias for signin
  const login = signin;

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

  // Alias for logout
  const logout = signout;

  const updateDSOProfile = async (updates: any) => {
    // Placeholder for DSO profile updates
    console.log("DSO profile update not implemented:", updates);
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
    isAdmin: false, // Placeholder - implement based on your admin logic
    signup,
    signin,
    login,
    signout,
    logout,
    refreshUser: () => currentUser ? fetchUserProfile(currentUser.id) : Promise.resolve(),
    updateProfile,
    updateDSOProfile,
    completeOnboarding,
    dsoProfile: null, // Placeholder
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
