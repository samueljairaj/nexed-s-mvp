
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { visaStatusSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { ArrowLeft } from "lucide-react";
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// Export the form data type
export interface VisaStatusFormData {
  visaType: "F1" | "J1" | "H1B" | "Other";
  visaExpiryDate?: Date | null;
  hasDS2019?: boolean;
  hasDependents?: boolean;
  sevisId?: string;
  i20ExpiryDate?: Date | null;
  entryDate?: Date | null;
  currentStatus?: string;
  programStartDate?: Date | null;
}

interface VisaStatusStepProps {
  defaultValues: {
    visaType: string;
    visaExpiryDate: Date | null;
    hasDS2019?: boolean;
    hasDependents?: boolean;
    sevisId?: string;
    i20ExpiryDate?: Date | null;
  };
  onSubmit: (data: VisaStatusFormData) => void;
  onVisaTypeChange: (visaType: string) => void;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void;
}

export function VisaStatusStep({ 
  defaultValues, 
  onSubmit, 
  onVisaTypeChange,
  isSubmitting = false,
  handleBackToLogin
}: VisaStatusStepProps) {
  // Convert the string visa type to the enum type expected by the schema
  const initialVisaType = defaultValues.visaType as "F1" | "J1" | "H1B" | "Other";

  console.log("VisaStatusStep rendering with defaultValues:", defaultValues);
  console.log("VisaStatusStep isSubmitting:", isSubmitting);
  console.log("VisaStatusStep handleBackToLogin:", !!handleBackToLogin);

  const form = useForm({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      ...defaultValues,
      visaType: initialVisaType || "F1",
    },
  });

  // Watch visa type to update form fields and validation
  const visaType = form.watch("visaType");
  
  // Handle submit to ensure data is properly typed
  const handleFormSubmit = (data: any) => {
    console.log("VisaStatusStep submitting data:", data);
    // Ensure visaType is one of the allowed types
    const formattedData: VisaStatusFormData = {
      ...data,
      visaType: data.visaType as "F1" | "J1" | "H1B" | "Other"
    };
    
    onSubmit(formattedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Visa Information</h2>
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
      <p className="text-muted-foreground">Please provide your current visa status information.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="visaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visa Type</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onVisaTypeChange(value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your visa type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="F1">F-1 Student Visa</SelectItem>
                    <SelectItem value="J1">J-1 Exchange Visitor Visa</SelectItem>
                    <SelectItem value="H1B">H-1B Specialty Occupation Visa</SelectItem>
                    <SelectItem value="Other">Other Visa Type</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entry date field for all visa types */}
          <FormDatePicker
            name="entryDate"
            label="US Entry Date"
            placeholder="Select your entry date to the US"
          />

          {visaType === "F1" && (
            <>
              <FormField
                control={form.control}
                name="sevisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEVIS ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your SEVIS ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your SEVIS ID starts with N00 and is found on your I-20
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormDatePicker
                name="i20ExpiryDate"
                label="I-20 Expiration Date"
                placeholder="Select I-20 expiration date"
              />
              
              <FormField
                control={form.control}
                name="hasDependents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you have dependents on F-2 visas?</FormLabel>
                      <FormDescription>
                        Check this if your spouse or children are in the US on F-2 visas
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormDatePicker
                name="programStartDate"
                label="Program Start Date"
                placeholder="Select program start date"
              />
            </>
          )}

          {visaType === "J1" && (
            <>
              <FormField
                control={form.control}
                name="sevisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEVIS ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your SEVIS ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your SEVIS ID starts with N00 and is found on your DS-2019
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ds2019">
                  <AccordionTrigger>DS-2019 Information</AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="hasDS2019"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Do you have a DS-2019 form?</FormLabel>
                            <FormDescription>
                              If you are a J-1 Exchange Visitor, you should have a DS-2019 form.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormDatePicker
                      name="visaExpiryDate"
                      label="DS-2019 Expiry Date"
                      placeholder="Select DS-2019 expiry date"
                      className="mt-4"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <FormField
                control={form.control}
                name="hasDependents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you have dependents on J-2 visas?</FormLabel>
                      <FormDescription>
                        Check this if your spouse or children are in the US on J-2 visas
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormDatePicker
                name="programStartDate"
                label="Program Start Date"
                placeholder="Select program start date"
              />
            </>
          )}

          {visaType === "H1B" && (
            <>
              <FormDatePicker
                name="visaExpiryDate"
                label="H-1B Expiration Date"
                placeholder="Select visa expiry date"
              />
              
              <FormField
                control={form.control}
                name="currentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current H-1B Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="extension">Extension Filed</SelectItem>
                        <SelectItem value="transfer">Transfer Filed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {visaType === "Other" && (
            <>
              <FormDatePicker
                name="visaExpiryDate"
                label="Visa Expiration Date"
                placeholder="Select visa expiry date"
              />
              
              <FormField
                control={form.control}
                name="currentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Visa Type</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., O-1, TN, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
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
