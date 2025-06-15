
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  
  const email = location.state?.email || currentUser?.email || "";

  useEffect(() => {
    // Check if user is already verified
    if (currentUser && !isVerified) {
      checkVerificationStatus();
    }
  }, [currentUser]);

  useEffect(() => {
    // Cooldown timer
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsVerified(true);
        toast.success("Email verified successfully!");
        setTimeout(() => {
          navigate("/app/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleResendVerification = async () => {
    if (!email || cooldownTime > 0) return;
    
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`
        }
      });
      
      if (error) throw error;
      
      setResendCount(prev => prev + 1);
      setCooldownTime(60); // 60 second cooldown
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-center items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-nexed-500 rounded-md flex items-center justify-center">
                <div className="h-5 w-5 rounded-sm bg-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">neXed</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. Redirecting you to your dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-nexed-500 rounded-md flex items-center justify-center">
              <div className="h-5 w-5 rounded-sm bg-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">neXed</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-nexed-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click the verification link in your email to activate your account.
                If you don't see the email, check your spam folder.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
                disabled={isResending || cooldownTime > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldownTime > 0 ? (
                  `Resend in ${cooldownTime}s`
                ) : (
                  `Resend verification email${resendCount > 0 ? ` (${resendCount})` : ""}`
                )}
              </Button>

              <Button
                onClick={checkVerificationStatus}
                variant="ghost"
                className="w-full"
              >
                I've verified my email
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Wrong email address?{" "}
                <Link to="/signup" className="text-nexed-600 hover:text-nexed-700">
                  Sign up again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VerifyEmail;
