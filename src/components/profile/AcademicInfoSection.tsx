
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { dateUtils } from "@/lib/date-utils";
import { Checkbox } from "@/components/ui/checkbox";

const academicInfoSchema = z.object({
  university: z.string().min(1, "University is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  isSTEM: z.boolean().optional(),
  programStartDate: z.date().optional(),
  programCompletionDate: z.date().optional(),
  dsoName: z.string().optional(),
  dsoEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  dsoPhone: z.string().optional()
});

interface DSOContact {
  name?: string;
  email?: string;
  phone?: string;
}

export function AcademicInfoSection() {
  const { currentUser, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse dates from string to Date objects for the form
  const parseDate = (dateString: string | null | undefined) => {
    if (!dateString) return undefined;
    try {
      return new Date(dateString);
    } catch (e) {
      return undefined;
    }
  };

  // Handle DSO contact info if it exists in the user data
  // Use type assertion with a default empty object if dsoContact doesn't exist
  const dsoContact = (currentUser?.dsoContact as DSOContact) || { name: "", email: "", phone: "" };

  // Initialize form with current user data
  const form = useForm<z.infer<typeof academicInfoSchema>>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: currentUser?.university || "",
      degreeLevel: currentUser?.degreeLevel || "",
      fieldOfStudy: currentUser?.fieldOfStudy || "",
      isSTEM: currentUser?.isSTEM || false,
      programStartDate: parseDate(currentUser?.courseStartDate),
      programCompletionDate: parseDate(currentUser?.graduationDate || ""),
      dsoName: dsoContact.name || "",
      dsoEmail: dsoContact.email || "",
      dsoPhone: dsoContact.phone || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof academicInfoSchema>) => {
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const updateData: Record<string, any> = {
        university: data.university,
        degreeLevel: data.degreeLevel,
        fieldOfStudy: data.fieldOfStudy,
        isSTEM: data.isSTEM
      };
      
      // Format dates
      if (data.programStartDate) {
        updateData.courseStartDate = dateUtils.formatToYYYYMMDD(data.programStartDate);
      }
      
      if (data.programCompletionDate) {
        updateData.graduationDate = dateUtils.formatToYYYYMMDD(data.programCompletionDate);
      }
      
      // Create DSO contact object if any fields are filled
      if (data.dsoName || data.dsoEmail || data.dsoPhone) {
        updateData.dsoContact = {
          name: data.dsoName || "",
          email: data.dsoEmail || "",
          phone: data.dsoPhone || ""
        };
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
          <BookOpen className="mr-2 h-5 w-5 text-nexed-600" />
          Academic Information
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
                    <FormLabel>University</FormLabel>
                    <FormControl>
                      <Input placeholder="University name" {...field} />
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
                          <SelectValue placeholder="Select degree level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">PhD / Doctorate</SelectItem>
                        <SelectItem value="associate">Associate</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="Your major" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSTEM"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>STEM Designated Degree</FormLabel>
                      <FormDescription>
                        Check if your degree is on the STEM Designated Degree Program List
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="programStartDate"
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
                          disabled={(date) => date > new Date()}
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
                name="programCompletionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Completion Date</FormLabel>
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
            </div>
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium mb-2">DSO Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dsoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSO Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your DSO's name" {...field} />
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
                      <Input type="email" placeholder="dso@university.edu" {...field} />
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
                      <Input placeholder="+1 (123) 456-7890" {...field} />
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
