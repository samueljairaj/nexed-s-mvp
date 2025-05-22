
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VisaStatusFormValues, VisaType, visaStatusSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { FileText, Calendar, IdCard } from "lucide-react";
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
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const VISA_TYPES = [
  { id: "F1", name: "F-1 Student Visa", description: "For academic students" },
  { id: "J1", name: "J-1 Exchange Visitor", description: "For exchange visitors" },
  { id: "H1B", name: "H-1B Work Visa", description: "For specialized workers" },
  { id: "Other", name: "Other Visa Type", description: "Custom visa type" },
];

// Status options based on visa type
const VISA_STATUS_OPTIONS = {
  F1: [
    { value: "Active Student", label: "Active Student" },
    { value: "CPT", label: "CPT" },
    { value: "OPT", label: "OPT" },
    { value: "STEM OPT", label: "STEM OPT" },
    { value: "Grace Period", label: "Grace Period" },
  ],
  J1: [
    { value: "Active Program", label: "Active Program" },
    { value: "Academic Training", label: "Academic Training" },
    { value: "Grace Period", label: "Grace Period" },
  ],
  H1B: [
    { value: "Active Employment", label: "Active Employment" },
    { value: "Portability", label: "Portability" },
  ],
  Other: [
    { value: "Active", label: "Active" },
    { value: "Pending", label: "Pending" },
    { value: "Expired", label: "Expired" },
  ],
};

export function VisaStatusStep({ 
  defaultValues, 
  onSubmit,
  onVisaTypeChange,
  isSubmitting = false,
  handleBackToLogin,
}: { 
  defaultValues: Partial<VisaStatusFormValues>;
  onSubmit: (data: VisaStatusFormValues) => Promise<boolean>;
  onVisaTypeChange: (type: string) => void;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void;
}) {
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType>(defaultValues.visaType || "F1");
  const [otherVisaType, setOtherVisaType] = useState<string>(defaultValues.otherVisaType || "");
  const [hasUnemploymentPeriods, setHasUnemploymentPeriods] = useState<boolean>(
    defaultValues.hadUnemploymentPeriods || false
  );

  const form = useForm<VisaStatusFormValues>({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      ...defaultValues,
      visaType: defaultValues.visaType || "F1",
      visaStatus: defaultValues.visaStatus || "",
      sevisId: defaultValues.sevisId || "",
      i94Number: defaultValues.i94Number || "",
      otherVisaType: defaultValues.otherVisaType || "",
      hadUnemploymentPeriods: defaultValues.hadUnemploymentPeriods || false,
      totalUnemployedDays: defaultValues.totalUnemployedDays || "",
    }
  });

  // Watch visa type and status changes to update UI
  const visaType = form.watch("visaType");
  const visaStatus = form.watch("visaStatus");

  // Handle visa type change
  const handleVisaTypeChange = (type: string) => {
    setSelectedVisaType(type as VisaType); // Fix: Convert string to VisaType
    form.setValue('visaType', type as VisaType);
    form.setValue('visaStatus', ""); // Reset visa status when visa type changes
    onVisaTypeChange(type);
  };
  
  // Handle custom visa type input
  const handleOtherVisaTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherVisaType(e.target.value);
    form.setValue('otherVisaType', e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (data: VisaStatusFormValues) => {
    console.log("Visa status form submitted:", data);
    // If type is "Other", add the custom visa type to the data
    if (data.visaType === "Other" && otherVisaType) {
      data.otherVisaType = otherVisaType;
    }
    
    // Call the onSubmit function passed from the parent component
    return await onSubmit(data);
  };

  // Check if the selected status is OPT or STEM OPT
  const isOptOrStemOpt = visaStatus === "OPT" || visaStatus === "STEM OPT";

  // Calculate min date for entry date (must be in the past)
  const maxEntryDate = new Date();
  
  // Update hadUnemploymentPeriods when checkbox changes
  const handleUnemploymentChange = (checked: boolean) => {
    setHasUnemploymentPeriods(checked);
    form.setValue('hadUnemploymentPeriods', checked);
    
    // Clear unemployed days if unchecked
    if (!checked) {
      form.setValue('totalUnemployedDays', "");
    }
  };

  // Check if F1 or J1 visa type
  const isF1OrJ1 = visaType === "F1" || visaType === "J1";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Visa Status Information</h2>
        <p className="text-muted-foreground">Please provide your visa details for compliance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <RadioGroup 
          value={selectedVisaType}
          onValueChange={handleVisaTypeChange}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 contents"
        >
          {VISA_TYPES.map((visa) => (
            <Card 
              key={visa.id} 
              className={`cursor-pointer transition-all ${selectedVisaType === visa.id ? "bg-nexed-50 border-nexed-500" : "hover:bg-gray-50"}`}
              onClick={() => handleVisaTypeChange(visa.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={visa.id}
                    id={visa.id}
                    checked={selectedVisaType === visa.id}
                    className="data-[state=checked]:border-nexed-500 data-[state=checked]:bg-nexed-500"
                  />
                  <div>
                    <div className="font-medium">{visa.name}</div>
                    <div className="text-xs text-muted-foreground">{visa.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Custom visa type input for "Other" option */}
      {selectedVisaType === "Other" && (
        <FormField
          control={form.control}
          name="otherVisaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specify Visa Type <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your visa type" 
                  value={otherVisaType}
                  onChange={handleOtherVisaTypeChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Form {...form}>
        <form id="step-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Hidden field for visa type */}
          <FormField
            control={form.control}
            name="visaType"
            render={({ field }) => (
              <FormItem hidden>
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Visa Status dropdown with dynamic options */}
          <FormField
            control={form.control}
            name="visaStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Visa Status <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your visa status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VISA_STATUS_OPTIONS[visaType as keyof typeof VISA_STATUS_OPTIONS]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SEVIS ID */}
          <FormField
            control={form.control}
            name="sevisId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEVIS ID <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="N0000000000"
                      className="pl-10"
                      {...field} 
                    />
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Your Student and Exchange Visitor Information System ID, usually starting with N
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* I-94 Number */}
          <FormField
            control={form.control}
            name="i94Number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I-94 Number <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="00000000000"
                      className="pl-10"
                      {...field} 
                    />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Your Arrival/Departure Record number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* I-94 Admission Date (renamed from Entry Date) */}
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I-94 Admission Date <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker 
                        name="entryDate"
                        placeholder="Select admission date"
                        disabledDates={(date) => date > maxEntryDate}
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Date of most recent entry into the U.S. (I-94 admission date)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visa Stamp Expiry Date (optional) */}
            <FormField
              control={form.control}
              name="visaExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Stamp Expiry Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker 
                        name="visaExpiryDate"
                        placeholder="Select visa expiry date (optional)"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The expiration date on your visa stamp (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* OPT/STEM OPT specific questions */}
          {isOptOrStemOpt && (
            <div className="border p-4 rounded-md space-y-4 bg-nexed-50">
              <h3 className="font-medium">OPT/STEM OPT Information</h3>
              
              {/* Unemployment period checkbox */}
              <FormField
                control={form.control}
                name="hadUnemploymentPeriods"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          handleUnemploymentChange(checked === true);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Have you had unemployment periods?</FormLabel>
                      <FormDescription>
                        Select if you have had periods of unemployment during your OPT
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Show unemployment days field if checked */}
              {hasUnemploymentPeriods && (
                <FormField
                  control={form.control}
                  name="totalUnemployedDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Days Unemployed <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter number of days"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {visaStatus === "STEM OPT" ? 
                          "STEM OPT allows up to 150 days of unemployment" : 
                          "OPT allows up to 90 days of unemployment"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* Submit Button - Only shown if handleBackToLogin is not provided */}
          {!handleBackToLogin && (
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
          )}
        </form>
      </Form>
    </div>
  );
}
