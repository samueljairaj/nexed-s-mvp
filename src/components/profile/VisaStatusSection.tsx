
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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { dateUtils } from "@/lib/date-utils";

const visaStatusSchema = z.object({
  visaType: z.string().min(1, "Visa type is required"),
  visaStatus: z.string().optional(),
  sevisId: z.string().optional(),
  i94Number: z.string().optional(),
  entryDate: z.date().optional(),
  visaExpiryDate: z.date().optional(),
});

export function VisaStatusSection() {
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

  const form = useForm<z.infer<typeof visaStatusSchema>>({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      visaType: currentUser?.visaType || "",
      visaStatus: currentUser?.visa_status || "",
      sevisId: currentUser?.sevis_id || "",
      i94Number: currentUser?.i94_number || "",
      entryDate: parseDate(currentUser?.usEntryDate),
      visaExpiryDate: parseDate(currentUser?.visa_expiry_date),
    },
  });

  const onSubmit = async (data: z.infer<typeof visaStatusSchema>) => {
    setIsSubmitting(true);
    try {
      const updateData: Record<string, any> = {
        visaType: data.visaType,
        visa_status: data.visaStatus,
        sevis_id: data.sevisId,
        i94_number: data.i94Number,
      };
      
      // Format dates as YYYY-MM-DD strings
      if (data.entryDate) {
        updateData.usEntryDate = dateUtils.formatToYYYYMMDD(data.entryDate);
      }
      
      if (data.visaExpiryDate) {
        updateData.visa_expiry_date = dateUtils.formatToYYYYMMDD(data.visaExpiryDate);
      }
      
      await updateProfile(updateData);
      toast.success("Visa information updated successfully!");
    } catch (error) {
      console.error("Error updating visa information:", error);
      toast.error("Failed to update visa information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-nexed-600 mr-2">Visa Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visa Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="F1">F-1 Student</SelectItem>
                        <SelectItem value="J1">J-1 Exchange Visitor</SelectItem>
                        <SelectItem value="H1B">H-1B Work Visa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visaStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="OPT">On OPT</SelectItem>
                        <SelectItem value="STEM OPT">STEM OPT Extension</SelectItem>
                        <SelectItem value="Grace Period">Grace Period</SelectItem>
                        <SelectItem value="Transfer Pending">Transfer Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sevisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEVIS ID</FormLabel>
                    <FormControl>
                      <Input placeholder="N00XXXXXXXX" {...field} />
                    </FormControl>
                    <FormDescription>Format: N00 followed by 8 digits</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="i94Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I-94 Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter I-94 number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Last U.S. Entry Date</FormLabel>
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
                    <FormDescription>When you last entered the United States</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visaExpiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Visa Expiry Date</FormLabel>
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
                    <FormDescription>When your visa expires</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Visa Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
