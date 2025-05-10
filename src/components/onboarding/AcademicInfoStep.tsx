
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { academicInfoSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { ArrowLeft, ArrowRight, Book, Calendar, Folder, GraduationCap, School } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
} from "@/components/ui/accordion";

// Export the form data type
export interface AcademicInfoFormData {
  university: string;
  fieldOfStudy: string;
  degreeLevel: string;
  programStartDate: Date;
  programCompletionDate: Date;
  isSTEM?: boolean;
  isTransferStudent?: boolean;
  previousUniversity?: string;
  transferStartDate?: Date | null;
  transferEndDate?: Date | null;
  transferReason?: string;
  dsoName?: string;
  dsoEmail?: string;
  dsoPhone?: string;
}

interface AcademicInfoStepProps {
  defaultValues: Partial<AcademicInfoFormData>;
  onSubmit: (data: AcademicInfoFormData) => void;
  isF1OrJ1: boolean;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void;
}

export function AcademicInfoStep({ 
  defaultValues, 
  onSubmit, 
  isF1OrJ1,
  isSubmitting = false,
  handleBackToLogin
}: AcademicInfoStepProps) {
  console.log("AcademicInfoStep - isF1OrJ1:", isF1OrJ1);
  
  const form = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: defaultValues.university || "",
      fieldOfStudy: defaultValues.fieldOfStudy || "",
      degreeLevel: defaultValues.degreeLevel || "",
      programStartDate: defaultValues.programStartDate || null,
      programCompletionDate: defaultValues.programCompletionDate || null,
      isTransferStudent: defaultValues.isTransferStudent || false,
      previousUniversity: defaultValues.previousUniversity || "",
      transferStartDate: defaultValues.transferStartDate || null,
      transferEndDate: defaultValues.transferEndDate || null,
      transferReason: defaultValues.transferReason || "",
      isSTEM: defaultValues.isSTEM || false,
      dsoName: defaultValues.dsoName || "",
      dsoEmail: defaultValues.dsoEmail || "",
      dsoPhone: defaultValues.dsoPhone || "",
    },
  });

  // Watch for relevant fields to conditionally show other fields
  const hasTransferred = form.watch("isTransferStudent");
  const fieldOfStudy = form.watch("fieldOfStudy");

  // List of common STEM fields
  const stemFields = [
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Data Science"
  ];

  // Check if current field of study might be STEM
  const mightBeSTEM = stemFields.some(field => 
    fieldOfStudy?.toLowerCase().includes(field.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Academic Information</h2>
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
      <p className="text-muted-foreground">Please provide your academic details.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current University / Institution Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your university name" 
                      {...field} 
                      className="pl-10"
                    />
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degreeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <div className="relative">
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select a degree level" />
                      </SelectTrigger>
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study / Major</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your field of study" 
                      {...field} 
                      className="pl-10"
                    />
                    <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="programStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Start Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker
                        name="programStartDate"
                        placeholder="Select start date"
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
              name="programCompletionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Completion Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FormDatePicker
                        name="programCompletionDate"
                        placeholder="Select completion date"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isF1OrJ1 && mightBeSTEM && (
            <FormField
              control={form.control}
              name="isSTEM"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>This is a STEM-designated program</FormLabel>
                    <FormDescription>
                      STEM-designated programs may qualify for extended OPT periods
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isTransferStudent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-1">
                    <span>Previous University Transfers?</span>
                    <ArrowRight className="h-4 w-4" />
                  </FormLabel>
                  <FormDescription>
                    Have you transferred from another university or institution?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasTransferred && (
            <div className="space-y-4 bg-muted/50 p-4 rounded-md">
              <FormField
                control={form.control}
                name="previousUniversity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous University Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter previous university name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transferStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormDatePicker
                        name="transferStartDate"
                        placeholder="Select start date"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transferEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormDatePicker
                        name="transferEndDate"
                        placeholder="Select end date"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="transferReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Transfer (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Why did you transfer?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dso-info">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  DSO Contact Information (optional)
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dsoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DSO Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter DSO name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dsoEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DSO Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter DSO email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dsoPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DSO Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter DSO phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {isF1OrJ1 && (
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <h4 className="font-medium text-blue-800">Academic Information and Visa Status</h4>
              <p className="text-sm text-blue-700 mt-1">
                It's important to ensure your academic information is accurate and up-to-date as any changes may impact your visa status. Remember to notify your DSO of any academic changes.
              </p>
            </div>
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
