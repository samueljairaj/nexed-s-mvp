
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const visaStatusSchema = z.object({
  visaType: z.enum(["F-1", "J-1", "H-1B", "Other"]),
  currentStatus: z.string().min(1, "Please select your current status"),
  sevisId: z.string().optional(),
  i797Number: z.string().optional(),
  entryDate: z.date().optional(),
  visaExpirationDate: z.date().optional(),
  i94ExpirationDate: z.date().optional(),
  programStartDate: z.date().optional(),
  programEndDate: z.date().optional(),
});

export type VisaStatusFormData = z.infer<typeof visaStatusSchema>;

interface VisaStatusStepProps {
  defaultValues: Partial<VisaStatusFormData>;
  onSubmit: (data: VisaStatusFormData) => void;
  onVisaTypeChange: (visaType: string) => void;
  isSubmitting?: boolean;
}

export function VisaStatusStep({ 
  defaultValues,
  onSubmit,
  onVisaTypeChange,
  isSubmitting = false 
}: VisaStatusStepProps) {
  const form = useForm<VisaStatusFormData>({
    resolver: zodResolver(visaStatusSchema),
    defaultValues: {
      visaType: "F-1",
      currentStatus: "",
      ...defaultValues
    }
  });

  // Get the current visa type value
  const visaType = form.watch("visaType");

  // Status options based on visa type
  const getStatusOptions = () => {
    switch (visaType) {
      case "F-1":
        return [
          { value: "Active", label: "Active" },
          { value: "Initial", label: "Initial (Not yet in US)" },
          { value: "Terminated", label: "Terminated" },
          { value: "Completed", label: "Completed Program" },
          { value: "OPT", label: "Optional Practical Training (OPT)" },
          { value: "STEM_OPT", label: "STEM OPT Extension" },
        ];
      case "J-1":
        return [
          { value: "Active", label: "Active" },
          { value: "Initial", label: "Initial (Not yet in US)" },
          { value: "Terminated", label: "Terminated" },
          { value: "Academic_Training", label: "Academic Training" },
        ];
      case "H-1B":
        return [
          { value: "Active", label: "Active" },
          { value: "Approved", label: "Approved (Not yet in US)" },
          { value: "Transfer", label: "Transfer Pending" },
          { value: "Extension", label: "Extension Pending" },
        ];
      default:
        return [
          { value: "Active", label: "Active" },
          { value: "Initial", label: "Initial (Not yet in US)" },
          { value: "Other", label: "Other" },
        ];
    }
  };
  
  // Handle visa type change
  const handleVisaTypeChange = (value: string) => {
    form.setValue("currentStatus", "");
    onVisaTypeChange(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Visa & Status Information</h2>
        <p className="text-muted-foreground mt-2">Please provide details about your current visa status and related information.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="visaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visa Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleVisaTypeChange(value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="F-1" 
                          id="visa-f1" 
                          className="peer sr-only" 
                        />
                      </FormControl>
                      <FormLabel 
                        htmlFor="visa-f1"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xl font-bold">F-1</span>
                        <span className="text-sm text-muted-foreground">Student Visa</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="J-1" 
                          id="visa-j1" 
                          className="peer sr-only" 
                        />
                      </FormControl>
                      <FormLabel 
                        htmlFor="visa-j1"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xl font-bold">J-1</span>
                        <span className="text-sm text-muted-foreground">Exchange Visitor</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="H-1B" 
                          id="visa-h1b" 
                          className="peer sr-only" 
                        />
                      </FormControl>
                      <FormLabel 
                        htmlFor="visa-h1b"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xl font-bold">H-1B</span>
                        <span className="text-sm text-muted-foreground">Work Visa</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="Other" 
                          id="visa-other" 
                          className="peer sr-only" 
                        />
                      </FormControl>
                      <FormLabel 
                        htmlFor="visa-other"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xl font-bold">Other</span>
                        <span className="text-sm text-muted-foreground">Other Visa Type</span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getStatusOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {(visaType === "F-1" || visaType === "J-1") && (
            <FormField
              control={form.control}
              name="sevisId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEVIS ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="N00xxxxxxxx" 
                        className="pl-10" 
                        {...field} 
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {visaType === "H-1B" && (
            <FormField
              control={form.control}
              name="i797Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I-797 Receipt Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="WAC-XX-XXX-XXXXX" 
                        className="pl-10" 
                        {...field} 
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Most Recent U.S. Entry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-10 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          <div className="relative w-full">
                            <Calendar className="absolute left-0 top-0.5 h-4 w-4 text-muted-foreground" />
                            <span className="pl-2">
                              {field.value ? format(field.value, "PPP") : "Select entry date"}
                            </span>
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                          variant="outline"
                          className={`w-full pl-10 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          <div className="relative w-full">
                            <Calendar className="absolute left-0 top-0.5 h-4 w-4 text-muted-foreground" />
                            <span className="pl-2">
                              {field.value ? format(field.value, "PPP") : "Select expiration date"}
                            </span>
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
              control={form.control}
              name="i94ExpirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>I-94 Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-10 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          <div className="relative w-full">
                            <Calendar className="absolute left-0 top-0.5 h-4 w-4 text-muted-foreground" />
                            <span className="pl-2">
                              {field.value ? format(field.value, "PPP") : "Select I-94 expiration date"}
                            </span>
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          {(visaType === "F-1" || visaType === "J-1") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="programStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{visaType === "F-1" ? "I-20" : "DS-2019"} Program Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-10 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            <div className="relative w-full">
                              <Calendar className="absolute left-0 top-0.5 h-4 w-4 text-muted-foreground" />
                              <span className="pl-2">
                                {field.value ? format(field.value, "PPP") : "Select start date"}
                              </span>
                            </div>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="programEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{visaType === "F-1" ? "I-20" : "DS-2019"} Program End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-10 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            <div className="relative w-full">
                              <Calendar className="absolute left-0 top-0.5 h-4 w-4 text-muted-foreground" />
                              <span className="pl-2">
                                {field.value ? format(field.value, "PPP") : "Select end date"}
                              </span>
                            </div>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
