import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";

const accountCreationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Service",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AccountCreationFormData = z.infer<typeof accountCreationSchema>;

interface AccountCreationStepProps {
  defaultValues: Partial<AccountCreationFormData>;
  onSubmit: (data: AccountCreationFormData) => void;
  isSubmitting?: boolean;
}

export function AccountCreationStep({ 
  defaultValues,
  onSubmit,
  isSubmitting = false 
}: AccountCreationStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const form = useForm<AccountCreationFormData>({
    resolver: zodResolver(accountCreationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      ...defaultValues
    }
  });

  const handleBackToLogin = () => {
    // First logout the user if they are authenticated
    logout();
    // Then navigate to the root page which contains the login form
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Create Your Account</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={handleBackToLogin}
          className="flex items-center gap-1 text-primary"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Button>
      </div>
      <p className="text-muted-foreground">Please enter your information as it appears on your official documents.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name (as on passport)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your first name"
                        className="pl-10" 
                        {...field} 
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name (as on passport)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your last name"
                        className="pl-10" 
                        {...field} 
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="your.name@example.com" 
                      className="pl-10" 
                      {...field} 
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Create a password" 
                        className="pl-10 pr-10" 
                        {...field} 
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-10 w-10 px-3" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirm your password" 
                        className="pl-10 pr-10" 
                        {...field} 
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-10 w-10 px-3" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? 
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md">
            <div className="space-y-1">
              <Button type="button" variant="outline" className="w-full flex justify-center items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
            <div className="space-y-1">
              <Button type="button" variant="outline" className="w-full flex justify-center items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17.6 7.8C16.8 7 15.8 6.5 14.7 6.4C13.5 6.2 12.3 6.7 11.5 7.2C10.7 7.7 10.2 8.2 9.5 8.2C8.8 8.2 8.2 7.7 7.3 7.2C6.5 6.7 5.5 6.2 4.2 6.4C3 6.5 1.9 7.2 1 8.2C0.1 9.2 -0.2 10.8 0.2 12.8C0.5 14.7 1.6 16.8 2.8 18.1C3.6 19 4.4 19.8 5.2 19.8C6 19.8 6.2 19.3 7.2 19.3C8.2 19.3 8.3 19.8 9.2 19.8C10 19.8 10.7 19 11.5 18.1C12.1 17.4 12.7 16.5 13.1 15.5C12.1 15 11.5 14.1 11.2 13.1C11 12.2 11.2 11.1 11.8 10.2C12.2 9.5 12.9 9 13.6 8.8C13.1 8.4 12.3 8 11.5 7.8C13.4 7.5 14.9 8.5 15.6 9C16 9.3 16.3 9.6 16.9 9.6C17.4 9.6 17.8 9.2 18.3 8.8C19.2 8.1 19.9 7.3 20.4 6.5C19.5 6.9 18.6 7.5 17.6 7.8Z" fill="black"/>
                  <path d="M15.6 4C15.8 5.1 15.5 6.2 15 7C14.6 7.8 13.7 8.5 12.7 8.4C12.4 7.3 12.8 6.2 13.3 5.5C13.8 4.7 14.7 4.1 15.6 4Z" fill="black"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Creating Account...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

