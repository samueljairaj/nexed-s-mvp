
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { onboardingPersonalInfoSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Export the form data type
export interface PersonalInfoFormData {
  dateOfBirth: Date | string | null;
  nationality: string;
  country: string;
  usEntryDate: Date | string | null;
  address: string;
  phoneNumber: string;
}

interface PersonalInfoStepProps {
  defaultValues: {
    dateOfBirth: Date | string | null;
    nationality: string;
    country: string;
    usEntryDate: Date | string | null;
    address: string;
    phoneNumber: string;
  };
  onSubmit: (data: PersonalInfoFormData) => void;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void;
}

export function PersonalInfoStep({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false,
  handleBackToLogin
}: PersonalInfoStepProps) {
  // Parse date strings to Date objects if they are strings
  const initialValues = {
    ...defaultValues,
    dateOfBirth: defaultValues.dateOfBirth ? new Date(defaultValues.dateOfBirth) : null,
    usEntryDate: defaultValues.usEntryDate ? new Date(defaultValues.usEntryDate) : null
  };
  
  const form = useForm({
    resolver: zodResolver(onboardingPersonalInfoSchema),
    defaultValues: initialValues
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        {handleBackToLogin && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToLogin}
            className="flex items-center gap-1 text-primary"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">Please enter your personal details.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormDatePicker
                    name="dateOfBirth"
                    placeholder="Select date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your nationality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Residence</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your country of residence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="usEntryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of First Entry to the U.S.</FormLabel>
                  <FormDatePicker
                    name="usEntryDate"
                    placeholder="Select date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current U.S. Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your U.S. address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Saving...
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
