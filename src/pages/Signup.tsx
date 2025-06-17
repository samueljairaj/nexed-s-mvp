
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"student" | "dso">("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    // DSO fields
    universityName: "",
    universityCountry: "United States",
    sevisId: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
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
    
    // DSO-specific validation
    if (userType === "dso") {
      if (!formData.universityName.trim()) {
        newErrors.universityName = "University name is required";
      }
      if (!formData.universityCountry.trim()) {
        newErrors.universityCountry = "University country is required";
      }
      if (!formData.sevisId.trim()) {
        newErrors.sevisId = "SEVIS School Code is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const universityInfo = userType === "dso" ? {
        universityName: formData.universityName,
        universityCountry: formData.universityCountry,
        sevisId: formData.sevisId
      } : undefined;

      await signup(formData.email, formData.password, userType, universityInfo);
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
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Join neXed to manage your visa compliance journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* User Type Selection */}
              <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "dso")}>
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

              {/* DSO University Info */}
              {userType === "dso" && (
                <div className="space-y-4 border rounded-md p-4 bg-blue-50">
                  <h3 className="font-medium text-nexed-700">University Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="universityName">University Name</Label>
                    <Input
                      id="universityName"
                      value={formData.universityName}
                      onChange={(e) => handleInputChange("universityName", e.target.value)}
                      placeholder="University of California"
                      className={errors.universityName ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.universityName && (
                      <p className="text-sm text-red-600">{errors.universityName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="universityCountry">Country</Label>
                    <Input
                      id="universityCountry"
                      value={formData.universityCountry}
                      onChange={(e) => handleInputChange("universityCountry", e.target.value)}
                      placeholder="United States"
                      className={errors.universityCountry ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.universityCountry && (
                      <p className="text-sm text-red-600">{errors.universityCountry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sevisId">SEVIS School Code</Label>
                    <Input
                      id="sevisId"
                      value={formData.sevisId}
                      onChange={(e) => handleInputChange("sevisId", e.target.value)}
                      placeholder="e.g. ABC123456789"
                      className={errors.sevisId ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.sevisId && (
                      <p className="text-sm text-red-600">{errors.sevisId}</p>
                    )}
                  </div>
                </div>
              )}

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
                  `Create ${userType === "dso" ? "DSO" : "Student"} Account`
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
