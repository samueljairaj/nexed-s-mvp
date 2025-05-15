
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonalInfoFormValues, personalInfoSchema, countries } from "@/types/onboarding"; // Updated import
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { Calendar, Phone, MapPin, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
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

interface PersonalInfoStepProps {
  defaultValues: Partial<PersonalInfoFormValues>;
  onSubmit: (data: PersonalInfoFormValues) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function PersonalInfoStep({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false 
}: PersonalInfoStepProps) {

  // Initialize form with validation schema and default values
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      ...defaultValues,
      country: defaultValues.country || "",
      currentCountry: defaultValues.currentCountry || "",
      phoneNumber: defaultValues.phoneNumber || "",
      passportNumber: defaultValues.passportNumber || "",
      address: defaultValues.address || "",
    }
  });

  // Handle form submission
  const handleSubmit = (data: PersonalInfoFormValues) => {
    onSubmit(data);
  };

  // Calculate min date for date of birth (must be at least 16 years old)
  const maxDateOfBirth = new Date();
  maxDateOfBirth.setFullYear(maxDateOfBirth.getFullYear() - 16);
  
  // Calculate min date for passport expiry (must be in the future)
  const minPassportExpiry = new Date();
  minPassportExpiry.setDate(minPassportExpiry.getDate() + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <p className="text-muted-foreground">Please provide your personal details for your visa records.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country of Origin */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Origin <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Current Country of Residence */}
            <FormField
              control={form.control}
              name="currentCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Country of Residence <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your phone number" 
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

            {/* Passport Number */}
            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your passport number" 
                        {...field}
                        className="pl-10" 
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>Used to track expiration and documentation</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <FormDatePicker
                      name="dateOfBirth"
                      placeholder="Select your date of birth"
                      disabledDates={(date) => {
                        return date > maxDateOfBirth;
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Helps verify age-based eligibility and form autofill
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passport Expiry Date */}
            <FormField
              control={form.control}
              name="passportExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Expiry Date <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker
                        name="passportExpiryDate"
                        placeholder="Select passport expiry date"
                        disabledDates={(date) => {
                          return date < minPassportExpiry;
                        }}
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* U.S. Residential Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>U.S. Residential Address <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your U.S. address" 
                      {...field}
                      className="pl-10" 
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
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
