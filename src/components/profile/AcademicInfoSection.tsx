
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { dateUtils } from "@/lib/date-utils";

const academicInfoSchema = z.object({
  university: z.string().min(1, "University name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  degreeLevel: z.string().optional(),
  courseStartDate: z.date().optional(),
  graduationDate: z.date().optional(),
  isSTEM: z.boolean().optional(),
  dsoName: z.string().optional(),
  dsoEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export function AcademicInfoSection() {
  const { currentUser, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse dates from string to Date objects for the form
  const parseDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return undefined;
    try {
      return typeof dateString === 'string' ? new Date(dateString) : dateString;
    } catch (e) {
      return undefined;
    }
  };

  // Extract DSO contact information safely
  const dsoContact = currentUser?.dsoContact || { name: '', email: '' };

  const form = useForm<z.infer<typeof academicInfoSchema>>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: currentUser?.university || "",
      fieldOfStudy: currentUser?.fieldOfStudy || "",
      degreeLevel: currentUser?.degreeLevel || "",
      courseStartDate: parseDate(currentUser?.courseStartDate),
      graduationDate: parseDate(currentUser?.graduationDate),
      isSTEM: currentUser?.isSTEM || false,
      dsoName: dsoContact.name || "",
      dsoEmail: dsoContact.email || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof academicInfoSchema>) => {
    setIsSubmitting(true);
    try {
      const updateData: Record<string, string | boolean | { name: string; email: string }> = {
        university: data.university,
        fieldOfStudy: data.fieldOfStudy,
        degreeLevel: data.degreeLevel,
        isSTEM: data.isSTEM,
        dsoContact: {
          name: data.dsoName,
          email: data.dsoEmail,
        }
      };
      
      // Format dates as YYYY-MM-DD strings
      if (data.courseStartDate) {
        updateData.courseStartDate = dateUtils.formatToYYYYMMDD(data.courseStartDate);
      }
      
      if (data.graduationDate) {
        updateData.graduationDate = dateUtils.formatToYYYYMMDD(data.graduationDate);
      }
      
      await updateProfile(updateData);
      toast.success("Academic information updated successfully!");
    } catch (error) {
      console.error("Error updating academic information:", error);
      toast.error("Failed to update academic information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-nexed-600 mr-2">Academic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University / School</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter university name" {...field} />
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
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your major" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Level</FormLabel>
                    <FormControl>
                      <Input placeholder="Bachelor's, Master's, PhD, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isSTEM"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-nexed-600 focus:ring-nexed-500 border-gray-300 rounded"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>This is a STEM designated program</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Program Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="graduationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Graduation Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dsoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSO Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Designated School Official name" {...field} />
                    </FormControl>
                    <FormDescription>Your primary DSO contact</FormDescription>
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
                      <Input placeholder="dso@university.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Academic Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
