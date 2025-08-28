import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  
  const email = location.state?.email || currentUser?.email;
  const continueOnboarding = location.state?.continueOnboarding;

  useEffect(() => {
    // If user is already verified and authenticated, redirect appropriately
    if (isAuthenticated && currentUser) {
      if (continueOnboarding) {
        // Continue onboarding flow
        navigate('/onboarding', { replace: true });
      } else if (currentUser.onboardingComplete) {
        // Go to dashboard
        const targetDashboard = currentUser.role === 'dso' ? '/app/dso-dashboard' : '/app/dashboard';
        navigate(targetDashboard, { replace: true });
      } else {
        // Resume onboarding
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, continueOnboarding, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;
      toast.success("Verification email sent!");
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(`Failed to resend email: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to {email || "your email address"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account and continue with onboarding.</p>
            <p className="mt-2">Didn't receive the email? Check your spam folder.</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleResendEmail}
              disabled={isResending || !email}
              className="w-full"
              variant="outline"
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </Button>
            
            <Button 
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
