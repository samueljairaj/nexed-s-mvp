
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { personalInfoSchema, countries } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { Flag, Phone, MapPin, Calendar, Passport } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PersonalInfoFormData {
  nationality: string;
  country: string;
  phoneNumber: string;
  passportNumber: string;
  passportExpiryDate: Date;
  address: string;
  dateOfBirth?: Date | null;
  usEntryDate?: Date | null;
}

interface PersonalInfoStepProps {
  defaultValues: Partial<PersonalInfoFormData>;
  onSubmit: (data: PersonalInfoFormData) => void;
  isSubmitting?: boolean;
}

export function PersonalInfoStep({ defaultValues, onSubmit, isSubmitting = false }: PersonalInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      nationality: defaultValues.nationality || "",
      country: defaultValues.country || "",
      phoneNumber: defaultValues.phoneNumber || "",
      passportNumber: defaultValues.passportNumber || "",
      passportExpiryDate: defaultValues.passportExpiryDate || null,
      dateOfBirth: defaultValues.dateOfBirth || null,
      address: defaultValues.address || "",
      usEntryDate: defaultValues.usEntryDate || null,
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Personal Information</h2>
      <p className="text-muted-foreground">Please provide your personal information for SEVIS compliance.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Origin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <div className="relative">
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your nationality" />
                      </SelectTrigger>
                      <Flag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Country of Residence</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <div className="relative">
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      {...field} 
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passportNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your passport number" 
                      {...field} 
                      className="pl-10"
                    />
                    <Passport className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Used to track expiration and verify identification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passportExpiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Expiry Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FormDatePicker
                      name="passportExpiryDate"
                      placeholder="Select passport expiry date"
                    />
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth (Optional)</FormLabel>
                <FormControl>
                  <FormDatePicker
                    name="dateOfBirth"
                    placeholder="Select date of birth"
                    required={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>U.S. Residential Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your U.S. residential address" 
                      {...field} 
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Required for SEVIS compliance reporting
                </FormDescription>
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
