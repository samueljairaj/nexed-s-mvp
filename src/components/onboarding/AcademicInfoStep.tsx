import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { academicInfoSchema } from "@/types/onboarding";
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
import { Checkbox } from "@/components/ui/checkbox";

interface AcademicInfoStepProps {
  defaultValues: {
    university: string;
    fieldOfStudy: string;
    degreeLevel: string;
    courseStartDate: Date | null;
    graduationDate: Date | null;
    hasTransferred: boolean;
    previousUniversity?: string;
  };
  onSubmit: (data: any) => void;
  isF1OrJ1: boolean;
  isSubmitting?: boolean;
  handleBackToLogin?: () => void; // Added prop
}

export function AcademicInfoStep({ 
  defaultValues, 
  onSubmit, 
  isF1OrJ1,
  isSubmitting = false,
  handleBackToLogin // Added prop
}: AcademicInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: defaultValues.university || "",
      fieldOfStudy: defaultValues.fieldOfStudy || "",
      degreeLevel: defaultValues.degreeLevel || "",
      courseStartDate: defaultValues.courseStartDate || null,
      graduationDate: defaultValues.graduationDate || null,
      hasTransferred: defaultValues.hasTransferred || false,
      previousUniversity: defaultValues.previousUniversity || "",
    },
  });

  // Watch for hasTransferred to conditionally show previous university field
  const hasTransferred = form.watch("hasTransferred");

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
              name="courseStartDate"
              label="Course Start Date"
              placeholder="Select start date"
            />

            <FormDatePicker
              name="graduationDate"
              label="Expected Graduation Date"
              placeholder="Select graduation date"
            />
          </div>

          <FormField
            control={form.control}
            name="hasTransferred"
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
