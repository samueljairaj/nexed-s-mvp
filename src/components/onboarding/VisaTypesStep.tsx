
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { VisaTypeConfigFormData } from "@/hooks/onboarding/useVisaTypeConfig";

// Available visa types
const VISA_TYPES = [
  { id: "F1", label: "F-1 Student Visa" },
  { id: "CPT", label: "Curricular Practical Training (CPT)" },
  { id: "OPT", label: "Optional Practical Training (OPT)" },
  { id: "STEM_OPT", label: "STEM OPT Extension" },
  { id: "H1B", label: "H-1B Work Visa" },
  { id: "J1", label: "J-1 Exchange Visitor" },
];

const visaTypeSchema = z.object({
  visaTypes: z.array(z.string()).min(1, "Select at least one visa type")
});

interface VisaTypesStepProps {
  defaultValues: Partial<VisaTypeConfigFormData>;
  onSubmit: (data: VisaTypeConfigFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export const VisaTypesStep = ({
  defaultValues,
  onSubmit,
  isSubmitting
}: VisaTypesStepProps) => {
  const form = useForm<z.infer<typeof visaTypeSchema>>({
    resolver: zodResolver(visaTypeSchema),
    defaultValues: {
      visaTypes: defaultValues.visaTypes || ["F1"]
    }
  });
  
  // Make sure at least F1 is selected by default
  useEffect(() => {
    const currentVisaTypes = form.getValues("visaTypes");
    if (!currentVisaTypes || currentVisaTypes.length === 0) {
      form.setValue("visaTypes", ["F1"]);
    }
  }, [form]);
  
  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onSubmit({
      visaTypes: data.visaTypes
    });
    
    if (result) {
      // Form submission successful, handled by parent component
      console.log("Visa types configured");
    }
  });
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          Configure Supported Visa Types
        </CardTitle>
        <CardDescription>
          Select all visa types that your university supports and manages
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="visaTypes"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VISA_TYPES.map((visaType) => (
                      <FormField
                        key={visaType.id}
                        control={form.control}
                        name="visaTypes"
                        render={({ field }) => {
                          // Special handling for F1 visa which is always required
                          const isF1 = visaType.id === "F1";
                          
                          return (
                            <FormItem
                              key={visaType.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(visaType.id)}
                                  disabled={isF1} // F1 is always required
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValues, visaType.id])
                                      : field.onChange(
                                          currentValues.filter((value) => value !== visaType.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-medium">
                                  {visaType.label}
                                  {isF1 && <span className="ml-2 text-xs text-primary">(Required)</span>}
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : "Save & Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VisaTypesStep;
