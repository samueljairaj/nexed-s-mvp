
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export type VisaType = "F1" | "J1" | "H1B" | "Other" | null;
export type UserRole = "student" | "dso" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  visaType: VisaType;
  university?: string;
  universityId?: string;
  role: UserRole;
  degreeLevel?: string;     
  fieldOfStudy?: string;    
  isSTEM?: boolean;         
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

interface DSOProfile {
  title?: string;
  department?: string;
  officeLocation?: string;
  officeHours?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface UniversityInfo {
  universityName: string;
  universityCountry: string;
  sevisId: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  dsoProfile: DSOProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDSO: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: UserRole, universityInfo?: UniversityInfo) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateDSOProfile: (data: Partial<DSOProfile>) => Promise<void>;
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
  const [dsoProfile, setDSOProfile] = useState<DSOProfile | null>(null);
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
          setDSOProfile(null);
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
      // First fetch the basic profile
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          universities(name)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const userProfile: UserProfile = {
          id: user.id,
          name: data.name || '',
          email: data.email || user.email || '',
          country: data.country || '',
          visaType: data.visa_type as VisaType,
          university: data.universities?.name || undefined,
          universityId: data.university_id || undefined,
          role: data.role || 'student',
          degreeLevel: data.degree_level || undefined,
          fieldOfStudy: data.field_of_study || undefined,
          isSTEM: data.is_stem || false,
          courseStartDate: data.course_start_date ? new Date(data.course_start_date) : undefined,
          usEntryDate: data.us_entry_date ? new Date(data.us_entry_date) : undefined,
          employmentStartDate: data.employment_start_date ? new Date(data.employment_start_date) : undefined,
          onboardingComplete: data.onboarding_complete || false,
          dateOfBirth: data.date_of_birth || undefined,
          passportExpiryDate: data.passport_expiry_date || undefined,
          phone: data.phone || undefined,
          passportNumber: data.passport_number || undefined,
          address: data.address || undefined
        };
        
        setCurrentUser(userProfile);
        
        // If the user is a DSO, fetch the DSO-specific profile
        if (userProfile.role === 'dso') {
          const { data: dsoData, error: dsoError } = await supabase
            .from('dso_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!dsoError && dsoData) {
            setDSOProfile({
              title: dsoData.title || undefined,
              department: dsoData.department || undefined,
              officeLocation: dsoData.office_location || undefined,
              officeHours: dsoData.office_hours || undefined,
              contactEmail: dsoData.contact_email || undefined,
              contactPhone: dsoData.contact_phone || undefined
            });
          }
        }
      } else {
        // Profile not found, create one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            email: user.email,
            onboarding_complete: false,
            role: 'student'
          }]);

        if (insertError) throw insertError;
        
        setCurrentUser({
          id: user.id,
          name: '',
          email: user.email || '',
          country: '',
          visaType: null,
          role: 'student',
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

  const signup = async (email: string, password: string, role: UserRole = 'student', universityInfo?: UniversityInfo) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // If university info is provided (DSO signup), create or find the university
      let universityId: string | undefined = undefined;
      
      if (role === 'dso' && universityInfo) {
        // Check if university already exists
        const { data: existingUniversity } = await supabase
          .from('universities')
          .select('id')
          .ilike('name', universityInfo.universityName)
          .eq('country', universityInfo.universityCountry)
          .maybeSingle();
        
        if (existingUniversity) {
          universityId = existingUniversity.id;
        } else {
          // Create new university
          const { data: newUniversity, error: universityError } = await supabase
            .from('universities')
            .insert({
              name: universityInfo.universityName,
              country: universityInfo.universityCountry,
              sevis_id: universityInfo.sevisId
            })
            .select('id')
            .single();
          
          if (universityError) throw universityError;
          universityId = newUniversity.id;
        }
      }
      
      // If we have a user ID after signup, update the profile with role and university
      if (authData?.user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: role,
            university_id: universityId
          })
          .eq('id', authData.user.id);
        
        if (updateError) throw updateError;
        
        // If DSO, create an empty DSO profile record
        if (role === 'dso') {
          const { error: dsoProfileError } = await supabase
            .from('dso_profiles')
            .insert({ id: authData.user.id });
          
          if (dsoProfileError) throw dsoProfileError;
        }
      }
      
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
        
        // Handle university ID
        if (data.universityId !== undefined) {
          dbData.university_id = data.universityId;
          delete dbData.universityId;
        }
        
        // Map role
        if (data.role !== undefined) {
          dbData.role = data.role;
          delete dbData.role;
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

  const updateDSOProfile = async (data: Partial<DSOProfile>) => {
    if (!currentUser || currentUser.role !== 'dso') {
      throw new Error("Only DSO users can update DSO profiles");
    }

    try {
      // Map properties to database column names
      const dbData: any = {};
      
      if (data.title !== undefined) dbData.title = data.title;
      if (data.department !== undefined) dbData.department = data.department;
      if (data.officeLocation !== undefined) dbData.office_location = data.officeLocation;
      if (data.officeHours !== undefined) dbData.office_hours = data.officeHours;
      if (data.contactEmail !== undefined) dbData.contact_email = data.contactEmail;
      if (data.contactPhone !== undefined) dbData.contact_phone = data.contactPhone;
      
      // Check if DSO profile exists
      const { data: existingProfile } = await supabase
        .from('dso_profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();
      
      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('dso_profiles')
          .update(dbData)
          .eq('id', currentUser.id);
          
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('dso_profiles')
          .insert([{ 
            ...dbData,
            id: currentUser.id 
          }]);
          
        error = insertError;
      }
      
      if (error) throw error;

      // Update local state
      setDSOProfile(prev => ({
        ...prev,
        ...data,
      }));

      toast.success('DSO profile updated successfully');
    } catch (error: any) {
      console.error("Error updating DSO profile:", error);
      toast.error(`Failed to update DSO profile: ${error.message}`);
      throw error;
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
      // Student users without completed onboarding should be directed to onboarding
      if (currentUser.role === 'student' && !currentUser.onboardingComplete && !window.location.pathname.includes("/onboarding")) {
        navigate("/onboarding");
      }
    }
  }, [currentUser, isLoading, navigate]);

  // Computed properties for user roles
  const isDSO = currentUser?.role === 'dso';
  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    dsoProfile,
    isAuthenticated: !!session,
    isLoading,
    isDSO,
    isAdmin,
    login,
    signup,
    logout,
    updateProfile,
    updateDSOProfile,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
