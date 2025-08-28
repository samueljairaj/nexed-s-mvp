
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { educationalInfoSchema } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import {
  Form,
  FormControl,
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

interface EducationalInfoStepProps {
  defaultValues: {
    university: string;
    programDegree: any;
    fieldOfStudy: string;
    programStartDate: Date | null;
    programEndDate: Date | null;
  };
  onSubmit: (data: any) => void;
  isF1OrJ1: boolean;
}

export function EducationalInfoStep({ defaultValues, onSubmit, isF1OrJ1 }: EducationalInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(educationalInfoSchema),
    defaultValues,
  });

  return (
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
        
        {isF1OrJ1 && (
          <>
            <FormField
              control={form.control}
              name="programDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program/Degree</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your program/degree" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Exchange Program">Exchange Program</SelectItem>
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
                  <FormLabel>Major/Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your field of study" {...field} />
                  </FormControl>
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
                name="programEndDate"
                label="Expected Completion Date"
                placeholder="Select end date"
                disabledDates={(date) => 
                  form.watch("programStartDate") && 
                  date <= form.watch("programStartDate")
                }
              />
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
