import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { visaStatusSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { ArrowLeft } from "lucide-react"; // Added import
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

interface VisaStatusStepProps {
  defaultValues: {
    visaType: string;
    visaExpiryDate: Date | null;
    hasDS2019?: boolean;
    hasDependents?: boolean;
    sevisId?: string;
    i20ExpiryDate?: Date | null;
  };
  onSubmit: (data: any) => void;
  onVisaTypeChange: (visaType: string) => void;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void; // Added prop
}

export function VisaStatusStep({ 
  defaultValues, 
  onSubmit, 
  onVisaTypeChange,
  isSubmitting = false,
  handleBackToLogin // Added prop
}: VisaStatusStepProps) {
  const form = useForm({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      visaType: defaultValues.visaType || "",
      visaExpiryDate: defaultValues.visaExpiryDate || null,
      hasDS2019: defaultValues.hasDS2019 || false,
      hasDependents: defaultValues.hasDependents || false,
      sevisId: defaultValues.sevisId || "",
      i20ExpiryDate: defaultValues.i20ExpiryDate || null,
    },
  });

  // Watch visa type to update form fields and validation
  const visaType = form.watch("visaType");

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormDatePicker
                name="i20ExpiryDate"
                label="I-20 Expiration Date"
                placeholder="Select I-20 expiration date"
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
                            <input
                              type="checkbox"
                              className="focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
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
                      label="Visa Expiry Date"
                      placeholder="Select visa expiry date"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {visaType === "H1B" && (
            <FormDatePicker
              name="visaExpiryDate"
              label="Visa Expiry Date"
              placeholder="Select visa expiry date"
            />
          )}

          {visaType === "Other" && (
            <FormDatePicker
              name="visaExpiryDate"
              label="Visa Expiry Date"
              placeholder="Select visa expiry date"
            />
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
