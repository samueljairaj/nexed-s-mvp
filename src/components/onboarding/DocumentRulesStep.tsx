
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Plus, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { 
  DocumentRuleConfigFormData, 
  DocumentRequirement 
} from "@/hooks/onboarding/useDocumentRuleConfig";

// Available visa types - this should match what was selected in previous step
const VISA_TYPES = [
  { id: "F1", label: "F-1 Student Visa" },
  { id: "CPT", label: "Curricular Practical Training (CPT)" },
  { id: "OPT", label: "Optional Practical Training (OPT)" },
  { id: "STEM_OPT", label: "STEM OPT Extension" },
  { id: "H1B", label: "H-1B Work Visa" },
  { id: "J1", label: "J-1 Exchange Visitor" },
];

// Define schema for document requirement
const documentRequirementSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  name: z.string().min(2, "Document name is required"),
  required: z.boolean(),
  description: z.string().optional(),
});

// Define schema for the form
const documentRulesSchema = z.object({
  visaType: z.string().min(1, "Please select a visa type"),
  documentRequirements: z.array(documentRequirementSchema)
    .min(1, "At least one document is required"),
});

interface DocumentRulesStepProps {
  defaultValues: Partial<DocumentRuleConfigFormData>;
  onSubmit: (data: DocumentRuleConfigFormData) => Promise<boolean>;
  onVisaTypeChange: (visaType: string) => void;
  getDefaultDocuments: (visaType: string) => DocumentRequirement[];
  isSubmitting: boolean;
  availableVisaTypes?: string[]; // Visa types selected in previous step
}

export const DocumentRulesStep = ({
  defaultValues,
  onSubmit,
  onVisaTypeChange,
  getDefaultDocuments,
  isSubmitting,
  availableVisaTypes = ["F1"]
}: DocumentRulesStepProps) => {
  const [activeVisaType, setActiveVisaType] = useState(defaultValues.visaType || "F1");
  
  // Filter visa types based on what was selected in previous step
  const filteredVisaTypes = VISA_TYPES.filter(
    visaType => availableVisaTypes.includes(visaType.id)
  );

  // Ensure we have proper default values with required properties
  const getFormattedDefaultDocuments = (): DocumentRequirement[] => {
    if (defaultValues.documentRequirements && defaultValues.documentRequirements.length > 0) {
      return defaultValues.documentRequirements.map(doc => ({
        id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: doc.name || "", // Ensure name is always a string
        required: doc.required || false,
        description: doc.description
      }));
    }
    return getDefaultDocuments(defaultValues.visaType || "F1");
  };
  
  const form = useForm<z.infer<typeof documentRulesSchema>>({
    resolver: zodResolver(documentRulesSchema),
    defaultValues: {
      visaType: defaultValues.visaType || "F1",
      documentRequirements: getFormattedDefaultDocuments(),
    }
  });
  
  // Update documents when visa type changes
  useEffect(() => {
    if (activeVisaType !== form.getValues("visaType")) {
      const documents = getDefaultDocuments(activeVisaType);
      form.setValue("visaType", activeVisaType);
      form.setValue("documentRequirements", documents);
      onVisaTypeChange(activeVisaType);
    }
  }, [activeVisaType, form, getDefaultDocuments, onVisaTypeChange]);
  
  const handleSubmit = form.handleSubmit(async (data) => {
    // Ensure all documents have required properties
    const validDocuments = data.documentRequirements.map(doc => ({
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: doc.name, // name is already required by the schema
      required: doc.required,
      description: doc.description
    }));
    
    const result = await onSubmit({
      visaType: data.visaType,
      documentRequirements: validDocuments
    });
    
    if (result) {
      // Form submission successful, handled by parent component
      console.log("Document rules configured");
    }
  });
  
  const addDocument = () => {
    const currentDocs = form.getValues("documentRequirements") || [];
    const newDocument: DocumentRequirement = { 
      id: `custom_${Date.now()}`,
      name: "", 
      required: true,
      description: ""
    };
    
    form.setValue("documentRequirements", [...currentDocs, newDocument]);
  };
  
  const removeDocument = (index: number) => {
    const currentDocs = form.getValues("documentRequirements");
    if (currentDocs.length <= 1) return; // Don't remove the last document
    
    form.setValue(
      "documentRequirements", 
      currentDocs.filter((_, i) => i !== index)
    );
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Configure Document Requirements
        </CardTitle>
        <CardDescription>
          Define required documents for each visa type
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="visaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setActiveVisaType(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVisaTypes.map((visaType) => (
                        <SelectItem key={visaType.id} value={visaType.id}>
                          {visaType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Document Requirements</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addDocument}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
              
              <div>
                {form.watch("documentRequirements")?.map((_, index) => (
                  <div key={index} className="border rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Document #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        disabled={form.watch("documentRequirements").length <= 1}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name={`documentRequirements.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Name<span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., I-20, Passport, Visa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`documentRequirements.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter document description or instructions"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`documentRequirements.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Required Document
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`documentRequirements.${index}.id`}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
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

export default DocumentRulesStep;
