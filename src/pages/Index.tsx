
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileCheck, FolderArchive, MessageCircle, GraduationCap, Building2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Only proceed if auth has finished loading and we haven't already navigated
    if (isLoading || hasNavigated) {
      return;
    }

    if (isAuthenticated && currentUser) {
      setHasNavigated(true);
      
      // Check if user has completed onboarding
      if (currentUser.onboardingComplete) {
        // Navigate based on user type
        const targetPath = currentUser.user_type === "dso" ? "/app/dso-dashboard" : "/app/dashboard";
        navigate(targetPath, { replace: true });
      } else {
        // User needs to complete onboarding
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate, hasNavigated]);

  // Show loading only while auth is initializing
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they should be redirected)
  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
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
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-nexed-700 hover:bg-blue-50"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
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
                  Your International Student Visa Companion
                </h1>
                <p className="text-lg md:text-xl text-blue-50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Stay compliant, organized, and worry-free with neXed's all-in-one visa management platform for international students and DSOs.
                </p>
                <div className="pt-4 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Button 
                    size="lg" 
                    className="bg-white text-nexed-700 hover:bg-blue-50"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Choose Your Role</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-white/20 border border-white/30 text-white hover:bg-white/30 p-6 h-auto flex flex-col items-center space-y-2"
                    >
                      <GraduationCap size={32} />
                      <span className="font-medium">Student</span>
                      <span className="text-xs opacity-90">Manage your visa compliance</span>
                    </Button>
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-white/20 border border-white/30 text-white hover:bg-white/30 p-6 h-auto flex flex-col items-center space-y-2"
                    >
                      <Building2 size={32} />
                      <span className="font-medium">DSO</span>
                      <span className="text-xs opacity-90">Monitor student compliance</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              Simplify Your International Student Journey
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Whether you're a student managing your visa compliance or a DSO overseeing multiple students, 
              neXed provides the tools you need to stay organized and compliant.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Student Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-center text-nexed-700 mb-8">For Students</h3>
                <FeatureCard
                  icon={<FileCheck size={32} className="text-nexed-600" />}
                  title="Visa Compliance Tracking"
                  description="Stay on top of deadlines and requirements with personalized checklists and timely reminders."
                />
                <FeatureCard
                  icon={<FolderArchive size={32} className="text-nexed-600" />}
                  title="Secure Document Vault"
                  description="Securely store and organize all your essential documents for quick access whenever you need them."
                />
                <FeatureCard
                  icon={<MessageCircle size={32} className="text-nexed-600" />}
                  title="AI Immigration Assistant"
                  description="Get instant answers to your visa questions with our specialized immigration AI assistant."
                />
              </div>

              {/* DSO Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-center text-nexed-700 mb-8">For DSOs</h3>
                <FeatureCard
                  icon={<GraduationCap size={32} className="text-nexed-600" />}
                  title="Student Management Dashboard"
                  description="Efficiently track and manage all your international students in one centralized dashboard."
                />
                <FeatureCard
                  icon={<FileCheck size={32} className="text-nexed-600" />}
                  title="Automated Compliance Monitoring"
                  description="Automate compliance tracking and get alerts about upcoming deadlines and potential issues."
                />
                <FeatureCard
                  icon={<FolderArchive size={32} className="text-nexed-600" />}
                  title="Document Verification System"
                  description="Streamline document collection and verification processes for your international students."
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-nexed-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Join thousands of international students and DSOs who trust neXed for their visa compliance needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-nexed-700 hover:bg-blue-50"
                onClick={() => navigate("/signup")}
              >
                Start Your Free Account
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Sign In to Your Account
              </Button>
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
            <div className="flex space-x-6 text-sm">
              <a href="/terms" className="hover:text-gray-300">Terms</a>
              <a href="/privacy" className="hover:text-gray-300">Privacy</a>
              <a href="/contact" className="hover:text-gray-300">Contact</a>
            </div>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              © 2025 neXed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="nexed-card flex items-start space-x-4 p-6">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default Index;
