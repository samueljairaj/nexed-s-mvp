import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Flag, Home, User, Phone } from "lucide-react";
import { format, parse, isValid } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { countries } from "@/types/onboarding";

const personalInfoSchema = z.object({
  country: z.string().min(1, "Please select your country of citizenship"),
  phone: z.string().min(5, "Please enter a valid phone number"),
  passportNumber: z.string().min(3, "Please enter a valid passport number"),
  passportExpiryDate: z.date({
    required_error: "Please select your passport expiration date",
  }).refine(date => date > new Date(), {
    message: "Passport expiration date must be in the future"
  }),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }).refine(date => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return date <= eighteenYearsAgo;
  }, {
    message: "You must be at least 18 years old"
  }),
  address: z.string().min(5, "Please enter your U.S. residential address")
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  defaultValues: Partial<PersonalInfoFormData>;
  onSubmit: (data: PersonalInfoFormData) => void;
  isSubmitting?: boolean;
}

export function PersonalInfoStep({ 
  defaultValues,
  onSubmit,
  isSubmitting = false 
}: PersonalInfoStepProps) {
  // Initialize state with defaultValues if available
  const [passportExpiryInputValue, setPassportExpiryInputValue] = useState(
    defaultValues.passportExpiryDate ? format(defaultValues.passportExpiryDate, "MM/dd/yyyy") : ""
  );
  const [dateOfBirthInputValue, setDateOfBirthInputValue] = useState(
    defaultValues.dateOfBirth ? format(defaultValues.dateOfBirth, "MM/dd/yyyy") : ""
  );
  
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      country: defaultValues.country || "",
      phone: defaultValues.phone || "",
      passportNumber: defaultValues.passportNumber || "",
      address: defaultValues.address || "",
      passportExpiryDate: defaultValues.passportExpiryDate,
      dateOfBirth: defaultValues.dateOfBirth,
    }
  });

  // Function to handle manual date input
  const handleManualDateInput = (value: string, fieldName: "passportExpiryDate" | "dateOfBirth") => {
    if (fieldName === "passportExpiryDate") {
      setPassportExpiryInputValue(value);
    } else {
      setDateOfBirthInputValue(value);
    }
    
    // Try to parse the date in multiple formats
    const formats = ["MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "yyyy.MM.dd"];
    
    for (const dateFormat of formats) {
      const parsedDate = parse(value, dateFormat, new Date());
      if (isValid(parsedDate)) {
        form.setValue(fieldName, parsedDate);
        return;
      }
    }
  };

  // Update input values when form values change
  useEffect(() => {
    const passportDate = form.watch("passportExpiryDate");
    if (passportDate && isValid(passportDate)) {
      setPassportExpiryInputValue(format(passportDate, "MM/dd/yyyy"));
    }
    
    const birthDate = form.watch("dateOfBirth");
    if (birthDate && isValid(birthDate)) {
      setDateOfBirthInputValue(format(birthDate, "MM/dd/yyyy"));
    }
  }, [form.watch("passportExpiryDate"), form.watch("dateOfBirth")]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <p className="text-muted-foreground mt-2">Please provide your personal information as it appears on your official documents.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Country selection - keep existing code */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Citizenship</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <div className="relative">
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <Flag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone number - keep existing code but fix controlled input */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      className="pl-10" 
                      {...field} 
                      value={field.value || ""}
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Passport number - keep existing code but fix controlled input */}
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
                      className="pl-10" 
                      {...field} 
                      value={field.value || ""}
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Your passport information is securely stored and used only for visa verification.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passport expiry date - fixing date handling */}
            <FormField
              control={form.control}
              name="passportExpiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Passport Expiry Date</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={passportExpiryInputValue}
                      onChange={(e) => handleManualDateInput(e.target.value, "passportExpiryDate")}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" type="button">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) {
                              setPassportExpiryInputValue(format(date, "MM/dd/yyyy"));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date of birth - fixing date handling */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={dateOfBirthInputValue}
                      onChange={(e) => handleManualDateInput(e.target.value, "dateOfBirth")}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" type="button">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) {
                              setDateOfBirthInputValue(format(date, "MM/dd/yyyy"));
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Address - keep existing code but fix controlled input */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>U.S. Residential Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your full U.S. address" 
                      className="pl-10" 
                      {...field} 
                      value={field.value || ""}
                    />
                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Required for SEVIS reporting purposes. Must match your U.S. address on file.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit button - keep existing code */}
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
