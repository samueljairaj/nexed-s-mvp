import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { employmentInfoSchema, EmploymentInfoFormValues } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, Calendar, MapPin, Plus, X, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EmploymentStepProps {
  defaultValues: Partial<EmploymentInfoFormValues>;
  onSubmit: (data: EmploymentInfoFormValues) => Promise<boolean>;
  onEmploymentStatusChange: (status: string) => void;
  isSubmitting: boolean;
  isOptOrCpt: boolean;
  isEmployed: boolean;
  isStemOpt: boolean;
  isF1OrJ1: boolean;
}

export function EmploymentStep({
  defaultValues,
  onSubmit,
  onEmploymentStatusChange,
  isSubmitting,
  isOptOrCpt,
  isEmployed,
  isStemOpt,
  isF1OrJ1,
}: EmploymentStepProps) {
  const form = useForm<EmploymentInfoFormValues>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      ...defaultValues,
      employmentStatus: defaultValues.employmentStatus || "Not Employed",
      employerName: defaultValues.employerName || "",
      jobTitle: defaultValues.jobTitle || "",
      jobLocation: defaultValues.jobLocation || "",
      previousEmployers: defaultValues.previousEmployers || [],
    },
  });

  // For managing the previous employers array
  const { fields, append, remove } = useFieldArray({
    name: "previousEmployers",
    control: form.control,
  });

  // Watch fields for conditional rendering
  const employmentStatus = form.watch("employmentStatus");
  const authorizationType = form.watch("authorizationType");

  // Handle form submission
  const handleFormSubmit = (data: EmploymentInfoFormValues) => {
    console.log("Employment info submitted:", data);
    onSubmit(data);
  };

  // Handle employment status change
  const handleStatusChange = (status: string) => {
    onEmploymentStatusChange(status);
    
    // Reset relevant fields when changing employment status
    if (status === "Not Employed") {
      form.reset({
        ...form.getValues(),
        employmentStatus: status,
        employerName: "",
        jobTitle: "",
        employmentStartDate: undefined,
        employmentEndDate: undefined,
        jobLocation: "",
        isFieldRelated: undefined
      });
    }
  };

  // Add a new previous employer
  const addPreviousEmployer = () => {
    append({
      employerName: "",
      jobTitle: "",
      startDate: new Date(),
      endDate: undefined,
      jobLocation: ""
    });
  };
  
  // Calculate the maximum days of unemployment allowed based on authorization type
  const getMaxUnemploymentDays = () => {
    if (authorizationType === "STEM OPT") return 150;
    if (authorizationType === "OPT") return 90;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Employment Information</h2>
        <p className="text-muted-foreground">Please provide details about your current and previous employment.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Employment Status */}
          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleStatusChange(value);
                    }}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Employed" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Employed</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Not Employed" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Not Employed</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Warning for F-1/J-1 students who are not employed */}
          {isF1OrJ1 && employmentStatus === "Not Employed" && (
            <Alert type="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                F-1 and J-1 students on OPT have limited unemployment time. Make sure you understand the restrictions.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Employment Information - Only show if employed */}
          {employmentStatus === "Employed" && (
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="font-medium">Current Employment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employer Name */}
                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter employer name" 
                            {...field}
                            value={field.value || ""}
                            className="pl-10"
                          />
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title/Position <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter job title" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Employment Start Date */}
                <FormField
                  control={form.control}
                  name="employmentStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Start Date <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FormDatePicker
                            name="employmentStartDate"
                            placeholder="Select start date"
                          />
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Employment End Date */}
                <FormField
                  control={form.control}
                  name="employmentEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job End Date</FormLabel>
                      <FormControl>
                        <FormDatePicker
                          name="employmentEndDate"
                          placeholder="Select end date (if applicable)"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank if this is your current job with no end date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Job Location */}
                <FormField
                  control={form.control}
                  name="jobLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Location <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="City, State or Remote" 
                            {...field}
                            value={field.value || ""}
                            className="pl-10"
                          />
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* CPT/OPT/STEM OPT Specific Fields */}
              {isOptOrCpt && (
                <div className="pt-4 border-t mt-4 space-y-4">
                  <h3 className="font-medium">Work Authorization Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Authorization Type */}
                    <FormField
                      control={form.control}
                      name="authorizationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization Type <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select authorization type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CPT">CPT</SelectItem>
                              <SelectItem value="OPT">OPT</SelectItem>
                              <SelectItem value="STEM OPT">STEM OPT Extension</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Is Job Related to Field of Study */}
                    <FormField
                      control={form.control}
                      name="isFieldRelated"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Job Related to Field of Study? <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Not Sure">Not Sure</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            CPT and OPT employment must be related to your field of study
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Authorization Start Date */}
                    <FormField
                      control={form.control}
                      name="authStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization Start Date <span className="text-destructive">*</span></FormLabel>
                          <FormDatePicker
                            name="authStartDate"
                            placeholder="Select start date"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Authorization End Date */}
                    <FormField
                      control={form.control}
                      name="authEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization End Date <span className="text-destructive">*</span></FormLabel>
                          <FormDatePicker
                            name="authEndDate"
                            placeholder="Select end date"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* EAD Card Number */}
                    <FormField
                      control={form.control}
                      name="eadNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EAD Card Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter EAD card number" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Unemployment Days Used */}
                    <FormField
                      control={form.control}
                      name="unemploymentDaysUsed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unemployment Days Used</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Total days of unemployment" 
                              type="number"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            You have used {field.value || "0"} of {getMaxUnemploymentDays()} allowed days
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* STEM OPT E-Verify Number */}
                    {isStemOpt && (
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
                              Required for employers of STEM OPT students
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Previous Employment Section */}
          {employmentStatus === "Employed" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Previous Employment</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPreviousEmployer}
                >
                  <Plus size={16} className="mr-2" /> Add Previous Employer
                </Button>
              </div>
              
              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No previous employment added</p>
              ) : (
                fields.map((field, index) => (
                  <Card key={field.id} className="overflow-hidden">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Previous Job #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => remove(index)}
                        className="h-8 px-2 text-red-500 hover:text-red-600"
                      >
                        <X size={16} />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Previous Employer Name */}
                        <FormField
                          control={form.control}
                          name={`previousEmployers.${index}.employerName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employer Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter employer name" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Previous Job Title */}
                        <FormField
                          control={form.control}
                          name={`previousEmployers.${index}.jobTitle`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter job title" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Previous Employment Start Date */}
                        <FormField
                          control={form.control}
                          name={`previousEmployers.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormDatePicker
                                name={`previousEmployers.${index}.startDate`}
                                placeholder="Select start date"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Previous Employment End Date */}
                        <FormField
                          control={form.control}
                          name={`previousEmployers.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormDatePicker
                                name={`previousEmployers.${index}.endDate`}
                                placeholder="Select end date"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Previous Job Location */}
                        <FormField
                          control={form.control}
                          name={`previousEmployers.${index}.jobLocation`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Job Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City, State or Remote" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
