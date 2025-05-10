
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { academicInfoSchema } from "@/types/onboarding";
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
import { Checkbox } from "@/components/ui/checkbox";

// Export the form data type
export interface AcademicInfoFormData {
  university: string;
  fieldOfStudy: string;
  degreeLevel: string;
  programStartDate?: Date | null;
  expectedGraduationDate?: Date | null;
  isTransferStudent?: boolean;
  previousUniversity?: string;
  isSTEM?: boolean;
}

interface AcademicInfoStepProps {
  defaultValues: {
    university: string;
    fieldOfStudy: string;
    degreeLevel: string;
    programStartDate?: Date | null;
    expectedGraduationDate?: Date | null;
    isTransferStudent?: boolean;
    previousUniversity?: string;
  };
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
  console.log("AcademicInfoStep - handleBackToLogin:", !!handleBackToLogin);
  
  const form = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: defaultValues.university || "",
      fieldOfStudy: defaultValues.fieldOfStudy || "",
      degreeLevel: defaultValues.degreeLevel || "",
      programStartDate: defaultValues.programStartDate || null,
      expectedGraduationDate: defaultValues.expectedGraduationDate || null,
      isTransferStudent: defaultValues.isTransferStudent || false,
      previousUniversity: defaultValues.previousUniversity || "",
      isSTEM: false,
    },
  });

  // Watch for relevant fields to conditionally show other fields
  const hasTransferred = form.watch("isTransferStudent");
  const degreeLevel = form.watch("degreeLevel");
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
                <FormLabel>University/Institution Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your university name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Major/Field of Study</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your field of study" {...field} />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select a degree" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="Doctorate">Doctorate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormDatePicker
              name="programStartDate"
              label="Program Start Date"
              placeholder="Select start date"
            />

            <FormDatePicker
              name="expectedGraduationDate"
              label="Expected Graduation Date"
              placeholder="Select graduation date"
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
                  <FormLabel>Have you transferred from another university?</FormLabel>
                  <FormDescription>
                    If yes, please provide the name of the previous university.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasTransferred && (
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
          )}
          
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
