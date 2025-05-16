
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VisaStatusFormValues, VisaType, visaStatusSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { FileText, Calendar, Id } from "lucide-react";
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

const VISA_TYPES = [
  { id: "F1", name: "F-1 Student Visa", description: "For academic students" },
  { id: "J1", name: "J-1 Exchange Visitor", description: "For exchange visitors" },
  { id: "H1B", name: "H-1B Work Visa", description: "For specialized workers" },
  { id: "OPT", name: "OPT (F-1 Status)", description: "Optional Practical Training" },
  { id: "CPT", name: "CPT (F-1 Status)", description: "Curricular Practical Training" },
];

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
  const [selectedVisaType, setSelectedVisaType] = useState<string>(defaultValues.visaType || "F1");

  const form = useForm<VisaStatusFormValues>({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      ...defaultValues,
      visaType: defaultValues.visaType || "F1",
      visaStatus: defaultValues.visaStatus || "",
      sevisId: defaultValues.sevisId || "",
      i94Number: defaultValues.i94Number || "",
    }
  });

  // Watch visa type changes to update UI
  const visaType = form.watch("visaType");

  // Handle visa type change
  const handleVisaTypeChange = (type: string) => {
    setSelectedVisaType(type);
    form.setValue('visaType', type as VisaType);
    onVisaTypeChange(type);
  };
  
  // Handle form submission
  const handleSubmit = (data: VisaStatusFormValues) => {
    onSubmit(data);
  };

  // Calculate min date for entry date (must be in the past)
  const maxEntryDate = new Date();
  
  // Calculate min date for visa expiry (must be in the future)
  const minExpiryDate = new Date();
  minExpiryDate.setDate(minExpiryDate.getDate() + 1);
  
  // Check if the selected visa type is F1 or J1
  const isF1OrJ1 = visaType === "F1" || visaType === "J1";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Visa Status Information</h2>
        <p className="text-muted-foreground">Please provide your visa details for compliance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

          {isF1OrJ1 ? (
            // F-1 and J-1 specific fields
            <>
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
                        <Id className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                {/* Entry Date */}
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>U.S. Entry Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="entryDate"
                            placeholder="Select entry date"
                            disabledDates={(date) => date > maxEntryDate}
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visa Expiry Date */}
                <FormField
                  control={form.control}
                  name="visaExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Expiry Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="visaExpiryDate"
                            placeholder="Select expiry date"
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form I-20 Expiry Date for F1 students */}
              {visaType === "F1" && (
                <FormField
                  control={form.control}
                  name="i20ExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form I-20 Expiry Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="i20ExpiryDate"
                            placeholder="Select I-20 expiry date"
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Form DS-2019 Expiry Date for J1 students */}
              {visaType === "J1" && (
                <FormField
                  control={form.control}
                  name="ds2019ExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form DS-2019 Expiry Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="ds2019ExpiryDate"
                            placeholder="Select DS-2019 expiry date"
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          ) : (
            // OPT/CPT/H1B fields
            <>
              {/* Visa Status */}
              <FormField
                control={form.control}
                name="visaStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visa Status <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your visa status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="grace_period">Grace Period</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entry Date */}
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>U.S. Entry Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="entryDate"
                            placeholder="Select entry date"
                            disabledDates={(date) => date > maxEntryDate}
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visa Expiry Date */}
                <FormField
                  control={form.control}
                  name="visaExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorization End Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker 
                            name="visaExpiryDate"
                            placeholder="Select end date"
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {visaType === "OPT" ? "OPT End Date" : 
                         visaType === "H1B" ? "H-1B Expiry Date" : 
                         "Authorization End Date"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
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
