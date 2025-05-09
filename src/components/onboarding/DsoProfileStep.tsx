import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Clock, MapPin, AlertCircle, RefreshCw } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const dsoProfileSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  officeLocation: z.string().min(2, "Office location must be at least 2 characters"),
  officeHours: z.string().min(2, "Office hours must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(7, "Phone number must be at least 7 digits"),
});

export type DsoProfileFormData = z.infer<typeof dsoProfileSchema>;

interface DsoProfileStepProps {
  defaultValues?: Partial<DsoProfileFormData>;
  onSubmit: (data: DsoProfileFormData) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSkip?: () => void;
}

export function DsoProfileStep({ 
  defaultValues = {},
  onSubmit,
  isSubmitting = false,
  submitError = null,
  onSkip
}: DsoProfileStepProps) {
  const { currentUser } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);
  
  const form = useForm<DsoProfileFormData>({
    resolver: zodResolver(dsoProfileSchema),
    defaultValues: {
      title: defaultValues.title || "",
      department: defaultValues.department || "",
      officeLocation: defaultValues.officeLocation || "",
      officeHours: defaultValues.officeHours || "",
      contactEmail: defaultValues.contactEmail || currentUser?.email || "",
      contactPhone: defaultValues.contactPhone || currentUser?.phone || "",
    }
  });

  // Show skip option after submission errors
  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setShowSkipOption(true);
      }, 5000); // Show skip option after 5 seconds of error
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  // Handle manual retry
  const handleRetry = () => {
    setIsRetrying(true);
    form.handleSubmit(onSubmit)();
    setTimeout(() => setIsRetrying(false), 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Set Up Your DSO Profile</h2>
        <p className="text-muted-foreground">
          This information will be visible to students to help them reach out to you when needed.
        </p>
      </div>
      
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <div>{submitError}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              disabled={isRetrying || isSubmitting}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Title</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. International Student Advisor"
                        className="pl-10" 
                        {...field} 
                      />
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. Office of International Education"
                        className="pl-10" 
                        {...field} 
                      />
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="email" 
                        placeholder="dso@university.edu" 
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
            
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="tel" 
                        placeholder="(123) 456-7890" 
                        className="pl-10" 
                        {...field} 
                      />
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="officeLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. International Center, Room 204" 
                      className="pl-10" 
                      {...field} 
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="officeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Hours</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="e.g. Monday-Friday: 9AM-5PM, Walk-in hours: Tuesday 1-3PM" 
                      className="pl-10 pt-8" 
                      {...field} 
                    />
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col md:flex-row gap-4 justify-between mt-6">
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isSubmitting || isRetrying}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
            
            {showSkipOption && onSkip && (
              <Button 
                type="button"
                variant="outline" 
                className="w-full md:w-auto"
                onClick={onSkip}
              >
                Skip for now
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
