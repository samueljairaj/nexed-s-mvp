import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { visaStatusSchema, VisaStatusFormValues } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { ArrowLeft, Calendar, FileText, FileIcon } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Export the form data type - use the schema-derived type
export type VisaStatusFormData = VisaStatusFormValues;

interface VisaStatusStepProps {
  defaultValues: Partial<VisaStatusFormValues>;
  onSubmit: (data: VisaStatusFormValues) => void;
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

  const form = useForm<VisaStatusFormValues>({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      ...defaultValues,
      visaType: initialVisaType || "F1",
      visaStatus: defaultValues.visaStatus || "",
      sevisId: defaultValues.sevisId || "",
      i94Number: defaultValues.i94Number || "",
    },
  });

  // Watch visa type to update form fields and validation
  const visaType = form.watch("visaType");
  const visaStatus = form.watch("visaStatus");
  const hadUnemploymentPeriods = form.watch("hadUnemploymentPeriods");
  
  // Handle submit to ensure data is properly typed
  const handleFormSubmit = (data: VisaStatusFormValues) => {
    console.log("VisaStatusStep submitting data:", data);
    onSubmit(data);
  };

  const getVisaStatusOptions = () => {
    switch(visaType) {
      case "F1":
        return [
          { value: "active", label: "Active Student" },
          { value: "cpt", label: "CPT" },
          { value: "opt", label: "OPT" },
          { value: "stem_opt", label: "STEM OPT" },
          { value: "grace_period", label: "Grace Period" }
        ];
      case "J1":
        return [
          { value: "active_program", label: "Active Program" },
          { value: "academic_training", label: "Academic Training" },
          { value: "grace_period", label: "Grace Period" }
        ];
      case "H1B":
        return [
          { value: "active_employment", label: "Active Employment" },
          { value: "portability", label: "Portability" }
        ];
      default:
        return [
          { value: "active", label: "Active" },
          { value: "pending", label: "Pending" },
          { value: "other", label: "Other" }
        ];
    }
  };

  // Check if the selected visa status is OPT or STEM OPT
  const isOptOrStemOpt = visaStatus === "opt" || visaStatus === "stem_opt";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Visa & Status Details</h2>
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
          {/* Main visa information section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="visaStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Visa Status</FormLabel>
                  <Select 
                    value={field.value || ""} 
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getVisaStatusOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Most Recent Entry to the U.S.</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker
                        name="entryDate"
                        placeholder="Select your most recent entry date"
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
              name="visaExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Stamp Expiration Date</FormLabel>
                  <FormDatePicker
                    name="visaExpiryDate"
                    placeholder="Select your visa expiration date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* We keep these fields for UI purposes but don't send them to the database */}
            <FormField
              control={form.control}
              name="sevisId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEVIS ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your SEVIS ID" 
                        {...field} 
                        value={field.value || ""} 
                        className="pl-10"
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your SEVIS ID starts with N00 and is found on your I-20 or DS-2019
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i94Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I-94 Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your I-94 number" 
                        {...field} 
                        value={field.value || ""}
                        className="pl-10"
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your I-94 number can be retrieved from the CBP website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* OPT Information section - only shown for OPT/STEM OPT */}
          {isOptOrStemOpt && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">OPT Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hadUnemploymentPeriods"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Have you had periods of unemployment?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        F-1 OPT allows a maximum of 90 days of unemployment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hadUnemploymentPeriods && (
                  <FormField
                    control={form.control}
                    name="totalUnemployedDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Days Unemployed</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter total days unemployed" 
                            {...field} 
                            type="number"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-amber-500">
                          Note: Exceeding 90 days of unemployment during OPT may violate your visa status
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Visa type specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visaType === "F1" && (
              <FormField
                control={form.control}
                name="i20ExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I-20 Expiration Date</FormLabel>
                    <FormDatePicker
                      name="i20ExpiryDate"
                      placeholder="Select I-20 expiration date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {visaType === "J1" && (
              <FormField
                control={form.control}
                name="hasDS2019"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you have a DS-2019 form?</FormLabel>
                      <FormDescription>
                        If you are a J-1 Exchange Visitor, you should have a DS-2019 form
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="hasDependents"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Do you have dependents?</FormLabel>
                    <FormDescription>
                      Check this if your spouse or children are in the US as your dependents
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="programStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Start Date</FormLabel>
                <FormDatePicker
                  name="programStartDate"
                  placeholder="Select program start date"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-blue-50 p-4 rounded-md mt-6">
            <h4 className="font-medium text-blue-800">Important Note About Visa Status</h4>
            <p className="text-sm text-blue-700 mt-1">
              Maintaining proper visa status is critical. Always ensure all your immigration documents are up to date and report any changes to your DSO or immigration advisor promptly.
            </p>
          </div>
          
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
