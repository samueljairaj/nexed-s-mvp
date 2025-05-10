
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FormAuthProps {
  initialMode?: "login" | "signup";
}

export const useFormAuth = ({ initialMode = "login" }: FormAuthProps = {}) => {
  const { login, signup } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStep, setSubmissionStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Use refs for timeouts to avoid re-renders
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (!isSubmitting) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }
    
    // Clear any existing interval first
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setSubmissionProgress((prev) => {
        if (prev >= 80) return prev;
        return prev + 5;
      });
    }, 300);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isSubmitting]);

  const resetForm = () => {
    setErrorMessage("");
    setSubmissionStep("");
    setSubmissionProgress(0);
  };

  const validateInputs = () => {
    resetForm();
    
    if (authMode === "signup") {
      if (!email || !password || !firstName || !lastName) {
        const message = "Please fill out all required fields";
        setErrorMessage(message);
        toast.error(message);
        return false;
      }
      
      if (password.length < 6) {
        const message = "Password must be at least 6 characters";
        setErrorMessage(message);
        toast.error(message);
        return false;
      }
    } else {
      if (!email || !password) {
        const message = "Please enter both email and password";
        setErrorMessage(message);
        toast.error(message);
        return false;
      }
    }
    
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateInputs()) return;
    
    setIsSubmitting(true);
    setSubmissionProgress(10);
    setErrorMessage("");
    
    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Set a timeout to prevent hanging
    timeoutRef.current = setTimeout(() => {
      console.log("Auth operation timed out, resetting submission state");
      setIsSubmitting(false);
      setSubmissionProgress(0);
      setSubmissionStep("");
      setErrorMessage("Operation timed out. Please try again.");
      toast.error("Operation timed out. Please try again.");
    }, 10000); // Increased timeout to 10 seconds
    
    try {
      if (authMode === "signup") {
        setSubmissionStep("Creating your account...");
        setSubmissionProgress(30);
        
        console.log("Attempting signup with:", { email, password, firstName, lastName });
        
        const signupResult = await signup({
          email,
          password,
          firstName,
          lastName
        });
        
        console.log("Signup result:", signupResult);
        
        if (signupResult) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setSubmissionProgress(100);
          setSubmissionStep("Account created! Redirecting...");
        } else {
          throw new Error("Account creation failed");
        }
      } else {
        setSubmissionStep("Signing in...");
        setSubmissionProgress(30);
        
        console.log("Attempting login with:", { email });
        
        await login(email, password);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSubmissionProgress(100);
        setSubmissionStep("Login successful! Redirecting...");
      }
    } catch (error: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.error("Authentication error:", error);
      
      // Provide more detailed error information
      let errorMsg = "Authentication failed";
      
      if (error?.message?.includes("already registered")) {
        errorMsg = "This email is already registered. Try logging in instead.";
      } else if (error?.message?.includes("Invalid login credentials")) {
        errorMsg = "Invalid email or password. Check your credentials and try again.";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login");
    resetForm();
  };

  return {
    authMode,
    setAuthMode,
    isSubmitting,
    submissionProgress,
    submissionStep,
    errorMessage,
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    handleAuth,
    toggleAuthMode,
    resetForm
  };
};
