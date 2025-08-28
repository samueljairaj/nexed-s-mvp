
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error("OAuth sign-in error:", error);
        toast.error("Unable to sign in with " + provider + ".");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return "Very weak";
    if (strength < 50) return "Weak";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (passwordStrength < 50) {
      newErrors.password = "Password is too weak. Include uppercase, lowercase, and numbers.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await signup(formData.email, formData.password, "student");
      toast.success("Account created successfully! Please check your email for verification.");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Account creation failed. Please try again.";
      if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "Password does not meet security requirements.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      }
      
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-nexed-500 rounded-md flex items-center justify-center">
              <div className="h-5 w-5 rounded-sm bg-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">neXed</span>
          </Link>
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-nexed-600 hover:text-nexed-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-nexed-100 rounded-full">
                <GraduationCap className="h-8 w-8 text-nexed-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create your student account</CardTitle>
            <CardDescription>
              Join neXed to manage your visa compliance journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social sign-up */}
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting || isLoading}
                onClick={() => handleOAuthLogin("google")}
              >
                {/* Google logo */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting || isLoading}
                onClick={() => handleOAuthLogin("apple")}
              >
                {/* Apple logo */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.67 1.83c0 1.14-.46 2.24-1.28 3.06-.82.84-2 1.42-3.16 1.34-.06-1.2.46-2.34 1.26-3.15.82-.84 2.1-1.46 3.18-1.49.01.08.01.16.01.24z" />
                  <path d="M21.55 17.58c-.01.01-1.85.67-2.89 2.62-1.03 1.9-2.1 3.54-3.78 3.57-1.64.03-2.15-1.09-4.01-1.09s-2.44 1.08-4 1.12c-1.63.04-2.79-1.93-3.83-3.83-2.08-3.86-2.3-8.37-.95-10.78 1.02-1.86 2.85-3.03 4.83-3.06 1.5-.03 2.91 1.03 3.83 1.03.9 0 2.6-1.27 4.4-1.08.75.03 2.87.3 4.24 2.3-.11.07-2.54 1.49-2.52 4.38.03 3.47 3.1 4.62 3.12 4.63z" />
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                    className={errors.firstName ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className={errors.lastName ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@university.edu"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password strength:</span>
                      <span className={passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle size={16} className="mr-1" />
                    Passwords match
                  </div>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-5">
                  I agree to the{" "}
                  <Link to="/terms" className="text-nexed-600 hover:text-nexed-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-nexed-600 hover:text-nexed-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-nexed-500 to-nexed-600 hover:from-nexed-600 hover:to-nexed-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Student Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Signup;

