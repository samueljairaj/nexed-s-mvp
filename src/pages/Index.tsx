
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, FolderArchive, MessageCircle, GraduationCap, Building2, Shield, Clock, Users, CheckCircle, Star, ArrowRight } from "lucide-react";

const Index = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Only handle navigation if not currently loading auth state
    if (isLoading) {
      return;
    }

    // If user is authenticated and we haven't started navigating yet
    if (isAuthenticated && currentUser && !isNavigating) {
      setIsNavigating(true);
      
      // Small delay to prevent flash
      setTimeout(() => {
        if (currentUser.onboardingComplete) {
          const targetPath = currentUser.user_type === "dso" ? "/app/dso-dashboard" : "/app/dashboard";
          navigate(targetPath, { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      }, 100);
    }
  }, [isAuthenticated, currentUser, isLoading, navigate, isNavigating]);

  // Show loading spinner only during initial auth check or when navigating
  if (isLoading || (isAuthenticated && isNavigating)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
          <p className="text-gray-600">
            {isLoading ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated but we're not navigating, show loading (shouldn't happen)
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

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <header className="nexed-gradient sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <div className="h-6 w-6 rounded-sm nexed-gradient" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">neXed</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-white/90 hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="text-white/90 hover:text-white transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 transition-colors"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-nexed-700 hover:bg-blue-50 shadow-md transition-all duration-200"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="nexed-gradient text-white py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                    <Star className="mr-2 h-4 w-4 text-yellow-300" />
                    Trusted by 10,000+ International Students
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight animate-fade-in">
                    Your Visa Compliance
                    <span className="block text-gradient bg-white bg-clip-text">Made Simple</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-50 leading-relaxed animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    Stay compliant, organized, and stress-free with neXed's intelligent visa management platform designed for international students and DSOs.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Button 
                    size="lg" 
                    className="bg-white text-nexed-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
                    onClick={() => navigate("/signup")}
                  >
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-white text-white hover:bg-white hover:text-nexed-700 transition-all duration-300 text-lg px-8 py-4"
                    onClick={() => navigate("/login")}
                  >
                    Watch Demo
                  </Button>
                </div>

                <div className="flex items-center space-x-8 pt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span className="text-sm">No Credit Card Required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span className="text-sm">Free Forever Plan</span>
                  </div>
                </div>
              </div>

              <div className="relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Choose Your Experience</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          onClick={() => navigate("/signup")}
                          className="bg-nexed-500 hover:bg-nexed-600 text-white p-8 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:shadow-lg"
                        >
                          <GraduationCap size={40} />
                          <div>
                            <span className="font-semibold text-lg block">International Student</span>
                            <span className="text-sm opacity-90">Manage your visa compliance journey</span>
                          </div>
                        </Button>
                        <Button
                          onClick={() => navigate("/signup")}
                          className="bg-nexed-700 hover:bg-nexed-800 text-white p-8 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:shadow-lg"
                        >
                          <Building2 size={40} />
                          <div>
                            <span className="font-semibold text-lg block">DSO / Administrator</span>
                            <span className="text-sm opacity-90">Monitor and support your students</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-nexed-600">10K+</div>
                <div className="text-gray-600 mt-2">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-nexed-600">500+</div>
                <div className="text-gray-600 mt-2">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-nexed-600">99.8%</div>
                <div className="text-gray-600 mt-2">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-nexed-600">24/7</div>
                <div className="text-gray-600 mt-2">AI Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Visa Compliance in 3 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                From onboarding to graduation, we've got your visa compliance covered
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-nexed-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Quick Setup</h3>
                <p className="text-gray-600">Complete your profile in minutes. Our smart onboarding captures your visa details and academic information.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-nexed-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Tracking</h3>
                <p className="text-gray-600">Get personalized compliance checklists, deadline reminders, and document management tailored to your visa type.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-nexed-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Stay Compliant</h3>
                <p className="text-gray-600">Receive instant guidance from our AI assistant and stay ahead of important deadlines with automated reminders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Visa Compliance
              </h2>
              <p className="text-xl text-gray-600">
                Powerful tools designed specifically for international students and the DSOs who support them
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 mb-20">
              {/* Student Features */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-nexed-700 mb-4 flex items-center justify-center lg:justify-start">
                    <GraduationCap className="mr-3 h-8 w-8" />
                    For Students
                  </h3>
                  <p className="text-gray-600 text-lg">Stay on top of your visa requirements with intelligent automation</p>
                </div>
                
                <div className="space-y-6">
                  <FeatureCard
                    icon={<FileCheck size={32} className="text-nexed-600" />}
                    title="Smart Compliance Tracking"
                    description="AI-powered checklists that adapt to your visa type, academic program, and employment status with real-time deadline monitoring."
                  />
                  <FeatureCard
                    icon={<FolderArchive size={32} className="text-nexed-600" />}
                    title="Secure Document Vault"
                    description="Military-grade encryption for your sensitive documents with version control, expiration tracking, and instant access."
                  />
                  <FeatureCard
                    icon={<MessageCircle size={32} className="text-nexed-600" />}
                    title="24/7 AI Immigration Assistant"
                    description="Get instant, accurate answers to complex visa questions from our specialized AI trained on immigration law."
                  />
                </div>
              </div>

              {/* DSO Features */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-nexed-700 mb-4 flex items-center justify-center lg:justify-start">
                    <Building2 className="mr-3 h-8 w-8" />
                    For DSOs
                  </h3>
                  <p className="text-gray-600 text-lg">Streamline student oversight with comprehensive management tools</p>
                </div>
                
                <div className="space-y-6">
                  <FeatureCard
                    icon={<Users size={32} className="text-nexed-600" />}
                    title="Centralized Student Dashboard"
                    description="Monitor hundreds of students in one place with advanced filtering, risk assessment, and bulk communication tools."
                  />
                  <FeatureCard
                    icon={<Shield size={32} className="text-nexed-600" />}
                    title="Automated Compliance Monitoring"
                    description="Real-time alerts for compliance issues, automated SEVIS reporting preparation, and proactive risk identification."
                  />
                  <FeatureCard
                    icon={<Clock size={32} className="text-nexed-600" />}
                    title="Efficient Document Processing"
                    description="Streamlined document collection, verification workflows, and digital signature capabilities for faster processing."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Loved by Students and DSOs Worldwide
              </h2>
              <p className="text-xl text-gray-600">
                See what our community says about their neXed experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <TestimonialCard
                quote="neXed saved me from missing my OPT application deadline. The AI assistant answered questions my DSO couldn't get to for weeks!"
                author="Maria Santos"
                role="Computer Science Student"
                university="Stanford University"
              />
              <TestimonialCard
                quote="Managing 800+ international students became manageable with neXed. The compliance dashboard is a game-changer for our office."
                author="Dr. James Chen"
                role="International Student Services Director"
                university="UC Berkeley"
              />
              <TestimonialCard
                quote="The document vault is incredible. I can access my I-20, transcript, and work authorization from anywhere, anytime. So convenient!"
                author="Priya Patel"
                role="Engineering Graduate Student"
                university="MIT"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 nexed-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">Ready to Simplify Your Visa Journey?</h2>
              <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto">
                Join thousands of international students and DSOs who trust neXed for seamless visa compliance management.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                <Button 
                  size="lg" 
                  className="bg-white text-nexed-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-10 py-4"
                  onClick={() => navigate("/signup")}
                >
                  Start Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-nexed-700 transition-all duration-300 text-lg px-10 py-4"
                  onClick={() => navigate("/login")}
                >
                  Sign In to Your Account
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 pt-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Free forever plan available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Setup in under 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="h-5 w-5 rounded-sm nexed-gradient" />
                </div>
                <span className="ml-2 text-xl font-bold">neXed</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Simplifying visa compliance for international students and the institutions that support them.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="text-gray-400 hover:text-white transition-colors block">Features</a>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors block">How it Works</a>
                <a href="/signup" className="text-gray-400 hover:text-white transition-colors block">Get Started</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors block">Help Center</a>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors block">Contact Us</a>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors block">Reviews</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors block">Terms of Service</a>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors block">Privacy Policy</a>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors block">Security</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 neXed. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-nexed-50 rounded-lg">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialCard = ({ quote, author, role, university }: { 
  quote: string, 
  author: string, 
  role: string, 
  university: string 
}) => (
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-8">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-6 leading-relaxed">
        "{quote}"
      </blockquote>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-600">{role}</div>
        <div className="text-sm text-nexed-600 font-medium">{university}</div>
      </div>
    </CardContent>
  </Card>
);

export default Index;
