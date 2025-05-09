import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserTypeToggle } from "@/components/landing/UserTypeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileCheck, FolderArchive, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const UniversityLanding = () => {
  const { isAuthenticated, login, currentUser, isLoading, signup, isDSO } = useAuth();
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStep, setSubmissionStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Basic auth form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Use refs instead of state for timeouts to avoid re-renders
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication status and redirect if necessary
  useEffect(() => {
    console.log("UniversityLanding: Auth state:", { isAuthenticated, isDSO, isLoading });
    
    if (!isLoading && isAuthenticated && currentUser) {
      const onboardingComplete = currentUser.onboarding_complete;
      
      if (isDSO) {
        if (onboardingComplete) {
          navigate('/app/dso-dashboard', { replace: true });
        } else {
          navigate('/dso-onboarding', { replace: true });
        }
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, isLoading, isDSO]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Progress bar animation for better UX during account creation/login
  useEffect(() => {
    if (!isSubmitting) {
      return;
    }
    
    // Clear any existing interval first to prevent multiple intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setSubmissionProgress((prev) => {
        // Cap progress at 90% during waiting to give feedback without claiming completion
        if (prev >= 90) return prev;
        return prev + Math.random() * 3 + 1; // Smaller, more gradual increments
      });
    }, 800);
    
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
    
    // Set a reasonable timeout (8 seconds instead of 15)
    timeoutRef.current = setTimeout(() => {
      console.log("Auth operation timed out, resetting submission state");
      setIsSubmitting(false);
      setSubmissionProgress(0);
      setSubmissionStep("");
      setErrorMessage("Operation timed out. Please try again. If this persists, check your network connection or try refreshing the page.");
      toast.error("Operation timed out. Please try again.");
    }, 8000);
    
    try {
      if (authMode === "signup") {
        setSubmissionStep("Creating your account...");
        console.log("Starting signup process for:", email);
        
        // Simplified signup with just basic info - university details come later
        console.log("Calling signup with data:", {
          email,
          firstName,
          lastName,
          role: "dso"
        });
        
        const signupResult = await signup({
          email,
          password,
          firstName,
          lastName,
          role: "dso" // Always create DSO users from university landing
        });
        
        console.log("Signup result:", signupResult);
        
        if (signupResult) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setSubmissionProgress(100);
          setSubmissionStep("Account created successfully! Redirecting to onboarding...");
          toast.success("DSO account created successfully!");
          
          // The auth state change should handle redirection automatically
        } else {
          throw new Error("Failed to create account");
        }
      } else {
        setSubmissionStep("Signing in...");
        console.log("Starting login process for:", email);
        
        await login(email, password);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSubmissionProgress(100);
        setSubmissionStep("Login successful! Redirecting...");
      }
    } catch (error: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.error("Authentication error:", error);
      let errorMsg = "Authentication failed";
      
      // Provide more detailed error information
      if (error?.message?.includes("already registered")) {
        errorMsg = "This email is already registered. Please try logging in instead.";
      } else if (error?.message?.includes("Invalid login credentials")) {
        errorMsg = "Invalid email or password. Please check your credentials and try again.";
      } else if (error?.message) {
        errorMsg = `Authentication failed: ${error.message}`;
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      // Ensure we don't leave the user in a stuck state
      setTimeout(() => {
        if (isSubmitting) {
          setIsSubmitting(false);
          setSubmissionProgress(0);
          setSubmissionStep("");
        }
      }, 500);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login");
    resetForm();
  };

  const handleDemoLogin = () => {
    setEmail("dso@example.com");
    setPassword("Password123!");
    toast.info("Demo credentials loaded! Click Sign In to continue.");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nexed-gradient">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center">
              <div className="h-6 w-6 rounded-sm nexed-gradient" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">neXed</span>
          </div>
          
          <UserTypeToggle />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="nexed-gradient text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                  Streamline Your DSO Responsibilities
                </h1>
                <p className="text-lg md:text-xl text-blue-50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Efficiently manage student visa compliance, document verification, and reporting with neXed's comprehensive DSO platform.
                </p>
                <div className="pt-4 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Button 
                    size="lg" 
                    className="bg-white text-nexed-700 hover:bg-blue-50"
                    onClick={() => setAuthMode("signup")}
                  >
                    Get Started
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </div>
              </div>
              
              {/* Auth Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Card>
                  <CardContent className="pt-6">
                    <Tabs defaultValue={authMode} value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Create Account</TabsTrigger>
                      </TabsList>
                      
                      <form onSubmit={handleAuth} className="space-y-4 mt-2">
                        {errorMessage && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                          </Alert>
                        )}
                        
                        <TabsContent value="signup" className="space-y-4 mt-0">
                          <h2 className="text-xl font-semibold text-center">Create University DSO Account</h2>
                          <p className="text-sm text-gray-500 text-center mb-2">
                            University details will be collected during onboarding
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="login" className="mt-0">
                          <h2 className="text-xl font-semibold text-center mb-4">Sign In to Your DSO Account</h2>
                        </TabsContent>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.name@university.edu"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                          />
                        </div>
                        
                        {isSubmitting && (
                          <div className="mt-4 space-y-2">
                            <Progress value={submissionProgress} className="h-2 w-full" />
                            <p className="text-sm text-center text-gray-600">{submissionStep}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-col space-y-3 pt-2">
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                                {authMode === "signup" ? "Creating Account..." : "Signing In..."}
                              </>
                            ) : (
                              authMode === "signup" ? "Create Account" : "Sign In"
                            )}
                          </Button>
                          
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={toggleAuthMode}
                            disabled={isSubmitting}
                          >
                            {authMode === "signup" 
                              ? "Already have an account? Sign In" 
                              : "New DSO? Create Account"
                            }
                          </Button>
                          
                          {authMode === "login" && (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={handleDemoLogin}
                              disabled={isSubmitting}
                            >
                              Demo Login
                            </Button>
                          )}
                        </div>
                      </form>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose neXed for DSOs</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Student Management</h3>
                <p className="text-gray-600">Comprehensive student profiles with visa status tracking, document verification, and automated compliance checks.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compliance Automation</h3>
                <p className="text-gray-600">Automatic alerts for approaching deadlines, expired documents, and status changes to ensure full compliance.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FolderArchive className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Repository</h3>
                <p className="text-gray-600">Securely store, organize, and retrieve important documents with built-in version control and audit trails.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <div className="h-5 w-5 rounded-sm nexed-gradient" />
              </div>
              <span className="ml-2 text-xl font-bold">neXed</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} neXed. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UniversityLanding;
