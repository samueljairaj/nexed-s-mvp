
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserTypeToggle } from "@/components/landing/UserTypeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, FileCheck, FolderArchive, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getProfileProperty } from "@/utils/propertyMapping";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const UniversityLanding = () => {
  const { isAuthenticated, login, currentUser, isLoading, signUp, isDSO } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [universityCountry, setUniversityCountry] = useState("United States");
  const [sevisId, setSevisId] = useState("");
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStep, setSubmissionStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
      console.log("UniversityLanding: User authenticated, isDSO:", isDSO, "onboarding complete:", onboardingComplete);
      
      // If authenticated user is a DSO
      if (isDSO) {
        if (onboardingComplete) {
          navigate('/app/dso-dashboard', { replace: true });
        } else {
          navigate('/dso-onboarding', { replace: true });
        }
      } else {
        // If somehow a student user reached this page, redirect them appropriately
        navigate('/student', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, isDSO]);
  
  // Progress bar animation with timeout
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    // Only start the progress animation if currently submitting
    if (isSubmitting) {
      progressInterval = setInterval(() => {
        setSubmissionProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 5 + 1; // Random increment for natural feel
        });
      }, 800);
      
      // Add a timeout to prevent infinite submission state
      timeoutId = setTimeout(() => {
        if (isSubmitting) {
          console.log("Signup timed out after 20 seconds");
          setIsSubmitting(false);
          setSubmissionProgress(0);
          setSubmissionStep("");
          setErrorMessage("Signup timed out after 20 seconds");
          toast.error("Signup timed out after 20 seconds");
        }
      }, 20000); // 20 seconds timeout
      
      return () => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSubmitting]);

  const resetForm = () => {
    setErrorMessage("");
    setSubmissionStep("");
    setSubmissionProgress(0);
  };

  const validateInputs = () => {
    resetForm();
    
    if (isSignup) {
      // Basic validation
      if (!email || !password || !confirmPassword || !firstName || !lastName || !universityName || !sevisId) {
        const message = "Please fill out all required fields";
        setErrorMessage(message);
        toast.error(message);
        return false;
      }
      
      if (password !== confirmPassword) {
        const message = "Passwords do not match";
        setErrorMessage(message);
        toast.error(message);
        return false;
      }
      
      if (password.length < 8) {
        const message = "Password must be at least 8 characters";
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

  // Direct auth with Supabase for more reliable signup
  const directSignUp = async () => {
    try {
      setSubmissionStep("Creating auth account...");
      setSubmissionProgress(30);
      
      // 1. Create the auth user directly with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: `${firstName} ${lastName}`,
            role: "dso",
            firstName,
            lastName
          }
        }
      });

      if (authError) throw authError;
      console.log("Auth user created successfully:", !!authData.user);
      
      // 2. Check if university exists or create it
      setSubmissionStep("Setting up university...");
      setSubmissionProgress(60);
      
      let universityId: string | null = null;
      
      const { data: existingUniversity } = await supabase
        .from('universities')
        .select('id')
        .eq('name', universityName)
        .eq('country', universityCountry)
        .maybeSingle();
        
      if (existingUniversity) {
        universityId = existingUniversity.id;
        console.log("Using existing university:", universityId);
      } else {
        // Create university
        const { data: newUniversity, error: createError } = await supabase
          .from('universities')
          .insert({
            name: universityName,
            country: universityCountry,
            sevis_id: sevisId
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("Error creating university:", createError);
          // Continue anyway - profile can be updated later
        } else if (newUniversity) {
          universityId = newUniversity.id;
          console.log("Created new university:", universityId);
        }
      }
      
      // 3. Update the profile with university info
      if (universityId && authData.user) {
        setSubmissionStep("Finalizing profile...");
        setSubmissionProgress(80);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            university_id: universityId,
            university: universityName
          })
          .eq('id', authData.user.id);
          
        if (profileError) {
          console.error("Error updating profile with university:", profileError);
          // Non-critical error, continue
        }
      }
      
      setSubmissionProgress(100);
      setSubmissionStep("Account created! Redirecting...");
      toast.success("DSO account created! Proceeding to onboarding...");
      
      // Wait briefly before redirecting via login
      setTimeout(() => {
        login(email, password).catch(err => {
          console.error("Auto-login failed:", err);
          // If auto-login fails, redirect to onboarding anyway
          navigate('/dso-onboarding', { replace: true });
        });
      }, 1500);
      
      return true;
    } catch (error: any) {
      console.error("Direct signup failed:", error);
      setErrorMessage(`Signup failed: ${error.message}`);
      toast.error(`Signup failed: ${error.message}`);
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we're not already submitting
    if (isSubmitting) {
      console.log("Already submitting, ignoring additional submit");
      return;
    }
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionProgress(10);
    
    try {
      if (isSignup) {
        // Use direct signup for DSO accounts to bypass potential timeouts
        const success = await directSignUp();
        if (!success) {
          setIsSubmitting(false);
          setSubmissionProgress(0);
        }
      } else {
        setSubmissionStep("Signing in...");
        
        try {
          // Login with email and password
          await login(email, password);
          setSubmissionProgress(100);
          
          // Wait briefly before redirecting
          setTimeout(() => {
            if (isAuthenticated && isDSO) {
              navigate('/app/dso-dashboard', { replace: true });
            }
          }, 1000);
        } catch (error: any) {
          setErrorMessage(`Login failed: ${error.message}`);
          toast.error(`Login failed: ${error.message}`);
          setIsSubmitting(false);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMsg = error.message || "Unknown error occurred";
      setErrorMessage(`Authentication failed: ${errorMsg}`);
      toast.error(`Authentication failed: ${errorMsg}`);
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    // Clear passwords when toggling
    setPassword("");
    setConfirmPassword("");
    resetForm();
  };

  const handleDemoLogin = () => {
    setEmail("dso@example.com");
    setPassword("Password123!");
    login("dso@example.com", "Password123!");
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
      {/* Hero Section */}
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
        {/* Hero Content */}
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
                    onClick={() => setIsSignup(true)}
                  >
                    Get Started
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        {isSignup ? "Create University DSO Account" : "Sign In"}
                      </h2>
                      
                      {errorMessage && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}
                      
                      {isSignup && (
                        <>
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
                          
                          <div className="space-y-4 border rounded-md p-4 bg-blue-50">
                            <h3 className="font-medium text-nexed-700">University Information</h3>
                            <div className="space-y-2">
                              <Label htmlFor="universityName">University Name</Label>
                              <Input
                                id="universityName"
                                value={universityName}
                                onChange={(e) => setUniversityName(e.target.value)}
                                placeholder="University of California"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Input
                                id="country"
                                value={universityCountry}
                                onChange={(e) => setUniversityCountry(e.target.value)}
                                placeholder="United States"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sevisId">SEVIS School Code</Label>
                              <Input
                                id="sevisId"
                                value={sevisId}
                                onChange={(e) => setSevisId(e.target.value)}
                                placeholder="EX1234567890"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
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
                          placeholder={isSignup ? "Create a password" : "Enter your password"}
                        />
                      </div>
                      
                      {isSignup && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                          />
                        </div>
                      )}
                      
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
                              {isSignup ? "Creating Account..." : "Signing In..."}
                            </>
                          ) : (
                            isSignup ? "Create Account" : "Sign In"
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={toggleAuthMode}
                          disabled={isSubmitting}
                        >
                          {isSignup ? "Already have an account? Sign In" : "New DSO? Create Account"}
                        </Button>
                        
                        {!isSignup && (
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
