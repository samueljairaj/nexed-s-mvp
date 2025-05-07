
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type VisaType = "F1" | "OPT" | "H1B" | "Other" | null;

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

// Mock user for development purposes
const MOCK_USER: UserProfile = {
  id: "user-1",
  name: "",
  email: "student@university.edu",
  country: "",
  visaType: null,
  onboardingComplete: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Mock authentication for demo purposes
  useEffect(() => {
    // Simulating auth check
    const checkAuth = async () => {
      try {
        // Get user from localStorage or use mock
        const savedUser = localStorage.getItem("nexed_user");
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          // Auto-login with mock user
          setCurrentUser(MOCK_USER);
          localStorage.setItem("nexed_user", JSON.stringify(MOCK_USER));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login
      setCurrentUser(MOCK_USER);
      localStorage.setItem("nexed_user", JSON.stringify(MOCK_USER));
      toast.success("Logged in successfully");
      
      if (!MOCK_USER.onboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/app/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("nexed_user");
    toast.info("Logged out");
    navigate("/");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem("nexed_user", JSON.stringify(updatedUser));
    }
  };

  const completeOnboarding = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, onboardingComplete: true };
      setCurrentUser(updatedUser);
      localStorage.setItem("nexed_user", JSON.stringify(updatedUser));
      navigate("/app/dashboard");
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    updateProfile,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
