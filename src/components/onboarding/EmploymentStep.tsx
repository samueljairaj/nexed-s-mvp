
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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

const employmentSchema = z.object({
  employmentStatus: z.string().min(1, "Please select your employment status"),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  workStartDate: z.date().optional(),
  workEndDate: z.date().optional(),
  isRelatedToField: z.enum(["yes", "no", "unknown"]).optional(),
  authorizationStartDate: z.date().optional(),
  authorizationEndDate: z.date().optional(),
  unemploymentDays: z.string().optional(),
  eadCardNumber: z.string().optional(),
  eVerifyNumber: z.string().optional(),
});

export type EmploymentFormData = z.infer<typeof employmentSchema>;

interface EmploymentStepProps {
  defaultValues: Partial<EmploymentFormData>;
  onSubmit: (data: EmploymentFormData) => void;
  visaType: string;
  onEmploymentStatusChange: (status: string) => void;
  employmentStatus: string;
  isSubmitting?: boolean;
}

export function EmploymentStep({ 
  defaultValues,
  onSubmit,
  visaType,
  onEmploymentStatusChange,
  employmentStatus,
  isSubmitting = false 
}: EmploymentStepProps) {
  const form = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employmentStatus: "",
      ...defaultValues
    }
  });

  // Determine if showing employment details is needed based on status
  const showEmploymentDetails = employmentStatus && employmentStatus !== "Not_Employed";
  
  // Determine if we need to show OPT/CPT specific fields
  const isOptCpt = employmentStatus === "OPT" || employmentStatus === "STEM_OPT" || employmentStatus === "CPT";
  
  // Determine status options based on visa type
  const getStatusOptions = () => {
    if (visaType === "F-1") {
      return [
        { value: "Not_Employed", label: "Not Currently Employed" },
        { value: "On_Campus", label: "On-Campus Employment" },
        { value: "CPT", label: "Curricular Practical Training (CPT)" },
        { value: "OPT", label: "Optional Practical Training (OPT)" },
        { value: "STEM_OPT", label: "STEM OPT Extension" },
      ];
    } else if (visaType === "J-1") {
      return [
        { value: "Not_Employed", label: "Not Currently Employed" },
        { value: "Academic_Training", label: "Academic Training" },
        { value: "On_Campus", label: "On-Campus Employment" },
      ];
    } else if (visaType === "H-1B") {
      return [
        { value: "H1B_Employed", label: "H-1B Employment" },
        { value: "H1B_Between_Jobs", label: "Between H-1B Jobs" },
      ];
    } else {
      return [
        { value: "Not_Employed", label: "Not Currently Employed" },
        { value: "Employed", label: "Employed" },
      ];
    }
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    onEmploymentStatusChange(value);
    form.reset({
      ...form.getValues(),
      employmentStatus: value,
      // Clear employment fields if not employed
      ...(!value || value === "Not_Employed" ? {
        employer: "",
        jobTitle: "",
        workStartDate: undefined,
        workEndDate: undefined,
        isRelatedToField: undefined,
      } : {}),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Employment Status</h2>
        <p className="text-muted-foreground mt-2">Please provide details about your current employment status in the United States.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Employment Status</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleStatusChange(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your employment status" />
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
          
          {showEmploymentDetails && (
            <>
              <FormField
                control={form.control}
                name="employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your employer's name" 
                          className="pl-10" 
                          {...field} 
                          value={field.value || ""}
                        />
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title/Position</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your job title" 
                          className="pl-10" 
                          {...field} 
                          value={field.value || ""}
                        />
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Employment Start Date</FormLabel>
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
                  name="workEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Employment End Date (if applicable)</FormLabel>
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
                                  {field.value ? format(field.value, "PPP") : "Select end date (if applicable)"}
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
                      <FormDescription>
                        Leave blank if currently employed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {isOptCpt && (
                <>
                  <FormField
                    control={form.control}
                    name="isRelatedToField"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Is this position related to your field of study?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Yes
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                No
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="unknown" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Not sure
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="authorizationStartDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{employmentStatus} Authorization Start Date</FormLabel>
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
                                      {field.value ? format(field.value, "PPP") : "Select authorization start date"}
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
                      name="authorizationEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{employmentStatus} Authorization End Date</FormLabel>
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
                                      {field.value ? format(field.value, "PPP") : "Select authorization end date"}
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
                </>
              )}
              
              {(employmentStatus === "OPT" || employmentStatus === "STEM_OPT") && (
                <>
                  <FormField
                    control={form.control}
                    name="unemploymentDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unemployment Days Used (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 30" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {employmentStatus === "OPT" ? 
                            "Regular OPT allows up to 90 days of unemployment." : 
                            "STEM OPT allows up to 150 days of unemployment (including days used during regular OPT)."
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eadCardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAD Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your EAD card number" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {employmentStatus === "STEM_OPT" && (
                <FormField
                  control={form.control}
                  name="eVerifyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer E-Verify Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter employer E-Verify number" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Required for STEM OPT extension. Your employer must be enrolled in E-Verify.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
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
              "Complete Onboarding"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
