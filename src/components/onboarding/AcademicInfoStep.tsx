
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { academicInfoSchema, AcademicInfoFormValues } from "@/types/onboarding";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, CalendarRange, BookOpen, User, Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface AcademicInfoStepProps {
  defaultValues: Partial<AcademicInfoFormValues>;
  onSubmit: (data: AcademicInfoFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  isF1OrJ1: boolean;
  handleBackToLogin?: () => void;
}

export function AcademicInfoStep({
  defaultValues,
  onSubmit,
  isSubmitting,
  isF1OrJ1,
  handleBackToLogin,
}: AcademicInfoStepProps) {
  const form = useForm<AcademicInfoFormValues>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      ...defaultValues,
      university: defaultValues.university || "",
      degreeLevel: defaultValues.degreeLevel || "",
      fieldOfStudy: defaultValues.fieldOfStudy || "",
      isSTEM: defaultValues.isSTEM || false,
      isTransferStudent: defaultValues.isTransferStudent || false,
      transferHistory: defaultValues.transferHistory || [],
      dsoName: defaultValues.dsoName || "",
      dsoEmail: defaultValues.dsoEmail || "",
      dsoPhone: defaultValues.dsoPhone || "",
    },
  });

  // For managing the transfer history array
  const { fields, append, remove } = useFieldArray({
    name: "transferHistory",
    control: form.control,
  });

  // Watch fields for conditional rendering
  const isTransferStudent = form.watch("isTransferStudent");
  const isSTEM = form.watch("isSTEM");
  const fieldOfStudy = form.watch("fieldOfStudy");

  // Check if field of study is likely STEM
  const checkIfStemField = (field: string) => {
    const stemKeywords = [
      "engineering", "computer", "science", "technology", "mathematics",
      "physics", "chemistry", "biology", "statistics", "data science",
      "information technology", "aerospace", "electrical", "mechanical"
    ];
    
    return stemKeywords.some(keyword => 
      field.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Handle form submission
  const handleFormSubmit = (data: AcademicInfoFormValues) => {
    console.log("Academic info submitted:", data);
    onSubmit(data);
  };

  // Add a new transfer record
  const addTransferRecord = () => {
    append({
      universityName: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: ""
    });
  };

  // Auto-detect STEM field when field of study changes
  const handleFieldOfStudyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("fieldOfStudy", value);
    
    if (checkIfStemField(value) && !isSTEM) {
      form.setValue("isSTEM", true);
      toast.info("We detected your field of study may be STEM eligible");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Academic Information</h2>
        <p className="text-muted-foreground">Please provide details about your academic program.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* University Name */}
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University/Institution Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your university name" 
                        {...field}
                        className="pl-10"
                      />
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Degree Level */}
            <FormField
              control={form.control}
              name="degreeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree Level <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your degree level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Field of Study */}
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study/Major <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your field of study" 
                        {...field} 
                        onChange={handleFieldOfStudyChange}
                        className="pl-10"
                      />
                      <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* STEM Designation */}
            <FormField
              control={form.control}
              name="isSTEM"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>STEM Designated Program</FormLabel>
                    <FormDescription>
                      Check if your program is STEM designated (eligible for STEM OPT extension)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Program Start Date */}
            <FormField
              control={form.control}
              name="programStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Start Date <span className="text-destructive">*</span></FormLabel>
                  <FormDatePicker
                    name="programStartDate"
                    placeholder="Select start date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Program Completion Date */}
            <FormField
              control={form.control}
              name="programCompletionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Program Completion Date <span className="text-destructive">*</span></FormLabel>
                  <FormDatePicker
                    name="programCompletionDate"
                    placeholder="Select completion date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Transfer Student Information */}
          <div className="space-y-4">
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
                    <FormLabel>Transfer Student</FormLabel>
                    <FormDescription>
                      Check this if you transferred from another institution in the U.S.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {isTransferStudent && (
              <Card className="border border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Previous Institutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-3 border-b pb-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Transfer #{index + 1}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button" 
                            onClick={() => remove(index)}
                          >
                            <X size={16} className="text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`transferHistory.${index}.universityName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Previous Institution</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter university name" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`transferHistory.${index}.startDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormDatePicker
                                    name={`transferHistory.${index}.startDate`}
                                    placeholder="Start date"
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`transferHistory.${index}.endDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormDatePicker
                                    name={`transferHistory.${index}.endDate`}
                                    placeholder="End date"
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`transferHistory.${index}.reason`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Reason for Transfer (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Optional reason for transfer" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addTransferRecord}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Another Transfer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* DSO Contact Information */}
          <Collapsible className="border rounded-md p-3">
            <CollapsibleTrigger className="flex items-center w-full justify-between">
              <div className="font-medium flex items-center">
                <User className="mr-2 h-4 w-4" />
                DSO Contact Information (Optional)
              </div>
              <Button variant="ghost" size="sm" type="button">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dsoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DSO Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter DSO name" 
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Enter DSO email" 
                          type="email"
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Enter DSO phone" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

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

// ChevronDown component for the collapsible trigger
function ChevronDown(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
