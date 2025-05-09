
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Define user profile type
type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role?: "student" | "dso" | "admin";
  onboardingComplete?: boolean;
  university?: string;
  universityId?: string;
  country?: string;
  visaType?: Database["public"]["Enums"]["visa_type"] | null;
  address?: string;
  phone?: string;
  degreeLevel?: string;
  fieldOfStudy?: string;
  isSTEM?: boolean;
  courseStartDate?: Date | null;
  usEntryDate?: Date | null;
  employmentStartDate?: Date | null;
  dateOfBirth?: Date | null;
  passportNumber?: string;
  passportExpiryDate?: Date | null;
  dsoProfile?: {
    title?: string;
    department?: string;
    officeLocation?: string;
    officeHours?: string;
    contactEmail?: string;
    contactPhone?: string;
    role?: Database["public"]["Enums"]["dso_role"];
    university_id?: string;
  };
};

// Define authentication context type
type AuthContextType = {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDSO: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (
    email: string,
    password: string,
    role?: "student" | "dso",
    metadata?: any
  ) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateDSOProfile: (data: any) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  session: Session | null;
  dsoProfile?: {
    title?: string;
    department?: string;
    officeLocation?: string;
    officeHours?: string;
    contactEmail?: string;
    contactPhone?: string;
    role?: Database["public"]["Enums"]["dso_role"];
    university_id?: string;
  };
};

// Create context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  isDSO: false,
  isAdmin: false,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
  updateProfile: async () => {},
  updateDSOProfile: async () => {},
  completeOnboarding: async () => {},
  session: null,
});

// Export useAuth hook
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dsoProfile, setDsoProfile] = useState<UserProfile['dsoProfile']>(undefined);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      // If the user is a DSO, fetch additional DSO profile data
      if (data.role === "dso") {
        const { data: dsoData, error: dsoError } = await supabase
          .from("dso_profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (!dsoError && dsoData) {
          // Store DSO profile data
          setDsoProfile({
            title: dsoData.title || undefined,
            department: dsoData.department || undefined,
            officeLocation: dsoData.office_location || undefined,
            officeHours: dsoData.office_hours || undefined,
            contactEmail: dsoData.contact_email || undefined,
            contactPhone: dsoData.contact_phone || undefined,
            role: dsoData.role || undefined,
            university_id: dsoData.university_id || undefined
          });
          
          // Merge DSO profile data with user profile
          return {
            ...data,
            dsoProfile: {
              title: dsoData.title || undefined,
              department: dsoData.department || undefined,
              officeLocation: dsoData.office_location || undefined,
              officeHours: dsoData.office_hours || undefined,
              contactEmail: dsoData.contact_email || undefined,
              contactPhone: dsoData.contact_phone || undefined,
              role: dsoData.role || undefined,
              university_id: dsoData.university_id || undefined
            },
            universityId: dsoData.university_id // Map university_id to universityId for consistency
          };
        }
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setCurrentUser({
                id: session.user.id,
                email: session.user.email || "",
                ...profile
              });
            } else {
              setCurrentUser(null);
            }
            
            setIsLoading(false);
          }
        );
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || "",
            ...profile
          });
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const profile = await fetchUserProfile(data.user.id);
      
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || "",
        ...profile,
      };

      setCurrentUser(user);
      toast.success("Login successful!");
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error.message}`);
      return null;
    }
  };

  // Signup function
  const signup = async (
    email: string, 
    password: string, 
    role: "student" | "dso" = "student",
    metadata?: any
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role // Add role to user metadata
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("User registration failed");
      }
      
      // Update the profile with role information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: role,
          // For DSO signup, add university info
          ...(role === "dso" && metadata ? {
            university: metadata.universityName
          } : {})
        })
        .eq("id", authData.user.id);
      
      if (profileError) throw profileError;
      
      // If user is a DSO, create DSO profile
      if (role === "dso") {
        const { error: dsoProfileError } = await supabase
          .from("dso_profiles")
          .insert({
            id: authData.user.id,
            role: "dso_admin" // First DSO is always admin
          });
        
        if (dsoProfileError) throw dsoProfileError;
        
        // If university info is provided, check if it exists
        if (metadata?.universityName) {
          // This will be handled in the onboarding process now
        }
      }
      
      const profile = await fetchUserProfile(authData.user.id);
      
      const user: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || "",
        role: role,
        ...profile,
      };
      
      setCurrentUser(user);
      return user;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(`Signup failed: ${error.message}`);
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);
      toast.success("You've been logged out");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name !== undefined ? data.name : currentUser.name,
          country: data.country !== undefined ? data.country : currentUser.country,
          university: data.university !== undefined ? data.university : currentUser.university,
          visa_type: data.visaType !== undefined ? data.visaType : currentUser.visaType,
          address: data.address !== undefined ? data.address : currentUser.address,
          phone: data.phone !== undefined ? data.phone : currentUser.phone,
          degree_level: data.degreeLevel !== undefined ? data.degreeLevel : currentUser.degreeLevel,
          field_of_study: data.fieldOfStudy !== undefined ? data.fieldOfStudy : currentUser.fieldOfStudy,
          is_stem: data.isSTEM !== undefined ? data.isSTEM : currentUser.isSTEM,
          course_start_date: data.courseStartDate ? data.courseStartDate.toISOString() : currentUser.courseStartDate,
          us_entry_date: data.usEntryDate ? data.usEntryDate.toISOString() : currentUser.usEntryDate,
          employment_start_date: data.employmentStartDate ? data.employmentStartDate.toISOString() : currentUser.employmentStartDate,
          date_of_birth: data.dateOfBirth ? data.dateOfBirth.toISOString() : currentUser.dateOfBirth,
          passport_number: data.passportNumber !== undefined ? data.passportNumber : currentUser.passportNumber,
          passport_expiry_date: data.passportExpiryDate ? data.passportExpiryDate.toISOString() : currentUser.passportExpiryDate
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser({
        ...currentUser,
        ...data,
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(`Profile update failed: ${error.message}`);
    }
  };
  
  // Update DSO profile
  const updateDSOProfile = async (data: any) => {
    if (!currentUser || currentUser.role !== "dso") return;
    
    try {
      const { error } = await supabase
        .from("dso_profiles")
        .update({
          title: data.title,
          department: data.department,
          office_location: data.officeLocation,
          office_hours: data.officeHours,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          university_id: data.universityId,
        })
        .eq("id", currentUser.id);
      
      if (error) throw error;
      
      // Update local DSO profile state
      const updatedDsoProfile = {
        ...dsoProfile,
        title: data.title,
        department: data.department,
        officeLocation: data.officeLocation,
        officeHours: data.officeHours,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        university_id: data.universityId
      };
      
      setDsoProfile(updatedDsoProfile);
      
      // Update local user state
      setCurrentUser({
        ...currentUser,
        dsoProfile: updatedDsoProfile
      });
    } catch (error: any) {
      console.error("DSO profile update error:", error);
      toast.error(`DSO profile update failed: ${error.message}`);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_complete: true,
        })
        .eq("id", currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        onboardingComplete: true,
      });
      
      // Set flag for dashboard tour
      sessionStorage.setItem("onboardingJustCompleted", "true");
    } catch (error: any) {
      console.error("Onboarding completion error:", error);
      toast.error(`Failed to complete onboarding: ${error.message}`);
    }
  };
  
  // Determine if user is a DSO
  const isDSO = Boolean(currentUser?.role === "dso");
  
  // Determine if user is an admin
  const isAdmin = Boolean(currentUser?.role === "admin");

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    isDSO,
    isAdmin,
    login,
    signup,
    logout,
    updateProfile,
    updateDSOProfile,
    completeOnboarding,
    session,
    dsoProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
