
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { visaInfoSchema, countries } from "@/types/onboarding";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

interface VisaInfoStepProps {
  defaultValues: {
    visaType: any;
    otherVisaType: string;
    countryOfOrigin: string;
    visaStatus: any;
    visaExpirationDate: Date | null;
  };
  onSubmit: (data: any) => void;
  onVisaTypeChange: (value: string) => void;
  onVisaStatusChange: (value: string) => void;
}

export function VisaInfoStep({ defaultValues, onSubmit, onVisaTypeChange, onVisaStatusChange }: VisaInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(visaInfoSchema),
    defaultValues,
  });

  // Turn form submission into a string value for visa_type
  const handleSubmit = (data: any) => {
    // Make sure the visa type is a string that matches the database enum
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="F1">F-1 (Student)</SelectItem>
                  <SelectItem value="J1">J-1 (Exchange Visitor)</SelectItem>
                  <SelectItem value="H1B">H-1B (Work)</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("visaType") === "Other" && (
          <FormField
            control={form.control}
            name="otherVisaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specify Visa Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your visa type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="countryOfOrigin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Origin</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
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
              <FormLabel>Current Visa Status</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  onVisaStatusChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your visa status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Not Yet Obtained">Not Yet Obtained</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(form.watch("visaStatus") === "Active" || form.watch("visaStatus") === "Expiring Soon") ? (
          <FormField
            control={form.control}
            name="visaExpirationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Visa Expiration Date</FormLabel>
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
                          format(field.value, "PPP")
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
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        
        {form.watch("visaStatus") === "Expired" && (
          <div className="bg-red-50 p-4 rounded-md flex items-start">
            <AlertTriangle className="text-red-500 mr-2 mt-1" />
            <div>
              <h4 className="font-medium text-red-800">Visa Status Alert</h4>
              <p className="text-sm text-red-600">
                Your visa has expired. You should contact an immigration attorney immediately 
                to discuss your options. This app can help track documents and requirements,
                but cannot provide legal advice for expired visa situations.
              </p>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
