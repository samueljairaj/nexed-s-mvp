import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, FolderArchive, MessageCircle, ChevronRight, User, Building2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { getProfileProperty } from "@/utils/propertyMapping";

const Index = () => {
  const { isAuthenticated, login, currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password123!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<"student" | "dso">("student");
  const [universityName, setUniversityName] = useState("");
  const [universityCountry, setUniversityCountry] = useState("United States");
  const [sevisId, setSevisId] = useState("");

  useEffect(() => {
    if (isAuthenticated && currentUser && getProfileProperty(currentUser, 'onboarding_complete')) {
      navigate(isDSO ? '/app/dso-dashboard' : '/app/dashboard');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isSignup) {
        // Basic validation
        if (!email || !password || !confirmPassword || !firstName || !lastName) {
          toast.error("Please fill out all fields");
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

        // Additional validation for DSO signup
        if (userType === "dso" && (!universityName || !universityCountry || !sevisId)) {
          toast.error("Please fill out all university fields");
          setIsSubmitting(false);
          return;
        }
        
        const fullName = `${firstName} ${lastName}`;
        
        // Create account with role metadata
        await login(
          email, 
          password,
          userType, 
          userType === "dso" ? 
            { universityName, universityCountry, sevisId } : undefined
        );
        
        toast.success(`${userType === "dso" ? "DSO" : "Student"} account created! Proceeding to onboarding...`);
      } else {
        // Login
        if (!email || !password) {
          toast.error("Please enter both email and password");
          setIsSubmitting(false);
          return;
        }
        
        await login(email, password);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(`Authentication failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    // Clear passwords when toggling
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = () => {
    // Replace this with a redirect to the signup page
    // or use the login method that is available
    login();
  };

  const handleDemoSignup = () => {
    // Instead of passing arguments to login, just call it directly as it shows in the interface
    login();
  };

  const handleDemoLogin = () => {
    // Instead of passing arguments to login, just call it directly as it shows in the interface
    login();
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Content */}
        <section className="nexed-gradient text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                  {userType === "student" 
                    ? "Your International Student Visa Companion" 
                    : "Streamline Your DSO Responsibilities"}
                </h1>
                <p className="text-lg md:text-xl text-blue-50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  {userType === "student"
                    ? "Stay compliant, organized, and worry-free with neXed's all-in-one visa management platform for international students."
                    : "Efficiently manage student visa compliance, document verification, and reporting with neXed's comprehensive DSO platform."}
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
                        {isSignup ? "Create an Account" : "Sign In"}
                      </h2>
                      
                      {isSignup && (
                        <>
                          <Tabs defaultValue="student" value={userType} onValueChange={(value) => setUserType(value as "student" | "dso")} className="mb-6">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="student" className="flex items-center gap-2">
                                <GraduationCap size={16} />
                                <span>Student</span>
                              </TabsTrigger>
                              <TabsTrigger value="dso" className="flex items-center gap-2">
                                <Building2 size={16} />
                                <span>DSO</span>
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                          
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
                          
                          {userType === "dso" && (
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
                          )}
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@university.edu"
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
                          isSignup ? "Create Account" : "Sign In"
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
                            Demo account: demo@example.com / Password123!
                          </p>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section - Different features based on user type */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              {userType === "student" 
                ? "Simplify Your International Student Journey" 
                : "Powerful DSO Management Tools"}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {userType === "student" ? (
                <>
                  <FeatureCard
                    icon={<FileCheck size={32} className="text-nexed-600" />}
                    title="Visa Compliance"
                    description="Stay on top of deadlines and requirements with personalized checklists and timely reminders."
                  />
                  <FeatureCard
                    icon={<FolderArchive size={32} className="text-nexed-600" />}
                    title="Document Vault"
                    description="Securely store and organize all your essential documents for quick access whenever you need them."
                  />
                  <FeatureCard
                    icon={<MessageCircle size={32} className="text-nexed-600" />}
                    title="AI Assistance"
                    description="Get instant answers to your visa questions with our specialized immigration AI assistant."
                  />
                </>
              ) : (
                <>
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
                </>
              )}
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

export default Index;
