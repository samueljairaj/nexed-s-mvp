
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserTypeToggle } from "@/components/landing/UserTypeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, FileCheck, FolderArchive, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getProfileProperty } from "@/utils/propertyMapping";

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
  const [submissionTimeoutId, setSubmissionTimeoutId] = useState<NodeJS.Timeout | null>(null);

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
  
  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    // Clear previous timeout if exists
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
    }
    
    // Set new timeout if currently submitting
    if (isSubmitting) {
      const timeoutId = setTimeout(() => {
        console.log("Form submission timed out after 10 seconds");
        setIsSubmitting(false);
        toast.error("Request timed out. Please try again or refresh the page.");
      }, 10000); // Reduced to 10 second timeout for faster feedback
      
      setSubmissionTimeoutId(timeoutId);
    }
    
    return () => {
      if (submissionTimeoutId) clearTimeout(submissionTimeoutId);
    };
  }, [isSubmitting]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we're not already submitting
    if (isSubmitting) {
      console.log("Already submitting, ignoring additional submit");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignup) {
        // Basic validation
        if (!email || !password || !confirmPassword || !firstName || !lastName || !universityName || !sevisId) {
          toast.error("Please fill out all required fields");
          setIsSubmitting(false);
          return;
        }
        
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setIsSubmitting(false);
          return;
        }
        
        console.log("Creating DSO account with data:", {
          email,
          firstName,
          lastName,
          role: "dso",
          universityName,
          universityCountry,
          sevisId
        });
        
        // Create account with full name and role
        const success = await signUp({
          email,
          password,
          firstName,
          lastName,
          role: "dso", // Important: Set role to DSO
          universityName,
          universityCountry,
          sevisId
        });
        
        if (success) {
          toast.success("DSO account created! Proceeding to onboarding...");
          
          // Manual navigation if the auth state change doesn't trigger navigation
          setTimeout(() => {
            console.log("Manual navigation to DSO onboarding");
            navigate('/dso-onboarding', { replace: true });
          }, 1500);
        }
      } else {
        // Login with email and password
        if (!email || !password) {
          toast.error("Please enter both email and password");
          setIsSubmitting(false);
          return;
        }
        
        await login(email, password);
        
        // If login is successful, the useEffect above will handle redirection
        // But also have a backup timeout for manual navigation
        setTimeout(() => {
          if (isAuthenticated && isDSO) {
            navigate('/app/dso-dashboard', { replace: true });
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(`Authentication failed: ${error.message}`);
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    // Clear passwords when toggling
    setPassword("");
    setConfirmPassword("");
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
                              <Label htmlFor="universityCountry">Country</Label>
                              <Input
                                id="universityCountry"
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
                                placeholder="e.g. ABC123456789"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="dso@university.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      
                      {isSignup && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full nexed-gradient"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            {isSignup ? "Creating Account..." : "Signing In..."}
                          </span>
                        ) : (
                          isSignup ? "Create University DSO Account" : "Sign In"
                        )}
                      </Button>
                      
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">
                          {isSignup ? "Already have an account?" : "Don't have an account?"}
                        </p>
                        <Button 
                          type="button" 
                          variant="link" 
                          onClick={toggleAuthMode}
                          className="text-nexed-600"
                        >
                          {isSignup ? "Sign In" : "Create Account"}
                        </Button>
                      </div>
                      
                      {!isSignup && (
                        <div className="pt-2 border-t">
                          <p className="text-center text-sm text-gray-500 mt-2">
                            Demo account: dso@example.com / Password123!
                          </p>
                          <Button 
                            type="button" 
                            variant="link"
                            className="text-nexed-600 w-full"
                            onClick={handleDemoLogin}
                          >
                            Use demo account
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Powerful DSO Management Tools
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<User size={32} className="text-nexed-600" />}
                title="Student Management"
                description="Efficiently track and manage all your international students in one centralized dashboard."
              />
              <FeatureCard
                icon={<FileCheck size={32} className="text-nexed-600" />}
                title="Compliance Monitoring"
                description="Automate compliance tracking and get alerts about upcoming deadlines and potential issues."
              />
              <FeatureCard
                icon={<FolderArchive size={32} className="text-nexed-600" />}
                title="Document Verification"
                description="Streamline document collection and verification processes for your international students."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <div className="h-5 w-5 rounded-sm nexed-gradient" />
              </div>
              <span className="ml-2 text-xl font-bold">neXed</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 neXed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="nexed-card flex flex-col items-center text-center p-8">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
    <div className="mt-6">
      <Button variant="ghost" className="text-nexed-600 hover:text-nexed-700 group">
        Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  </div>
);

export default UniversityLanding;
