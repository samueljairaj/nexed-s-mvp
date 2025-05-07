
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Plus, School, User, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const academicInfoSchema = z.object({
  university: z.string().min(1, "Please enter your university/institution name"),
  degreeLevel: z.string().min(1, "Please select your degree level"),
  fieldOfStudy: z.string().min(1, "Please enter your field of study/major"),
  isSTEM: z.boolean().default(false),
  programStartDate: z.date({
    required_error: "Please select your program start date",
  }),
  programEndDate: z.date({
    required_error: "Please select your expected program end date",
  }),
  dsoName: z.string().optional(),
  dsoEmail: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  hasPreviousSchools: z.boolean().default(false),
}).refine(data => !data.programEndDate || data.programStartDate < data.programEndDate, {
  message: "Program end date must be after the start date",
  path: ["programEndDate"],
});

export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;

interface PreviousSchool {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface AcademicInfoStepProps {
  defaultValues: Partial<AcademicInfoFormData>;
  onSubmit: (data: AcademicInfoFormData) => void;
  isF1OrJ1: boolean;
  isSubmitting?: boolean;
}

export function AcademicInfoStep({ 
  defaultValues,
  onSubmit,
  isF1OrJ1 = true,
  isSubmitting = false 
}: AcademicInfoStepProps) {
  const [previousSchools, setPreviousSchools] = useState<PreviousSchool[]>([]);
  const [isTransfersOpen, setIsTransfersOpen] = useState(false);
  
  const form = useForm<AcademicInfoFormData>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      university: "",
      degreeLevel: "",
      fieldOfStudy: "",
      isSTEM: false,
      hasPreviousSchools: false,
      dsoName: "",
      dsoEmail: "",
      ...defaultValues
    }
  });
  
  const hasPreviousSchools = form.watch("hasPreviousSchools");
  
  const handleAddSchool = () => {
    setPreviousSchools([...previousSchools, { name: "", startDate: null, endDate: null }]);
    setIsTransfersOpen(true);
    form.setValue("hasPreviousSchools", true);
  };
  
  const handleRemoveSchool = (index: number) => {
    const updatedSchools = [...previousSchools];
    updatedSchools.splice(index, 1);
    setPreviousSchools(updatedSchools);
    
    if (updatedSchools.length === 0) {
      form.setValue("hasPreviousSchools", false);
    }
  };
  
  const updateSchool = (index: number, field: keyof PreviousSchool, value: any) => {
    const updatedSchools = [...previousSchools];
    updatedSchools[index] = { ...updatedSchools[index], [field]: value };
    setPreviousSchools(updatedSchools);
  };

  const handleFormSubmit = (data: AcademicInfoFormData) => {
    // We can include previousSchools in the data sent to the parent if needed
    onSubmit({
      ...data,
      hasPreviousSchools: previousSchools.length > 0
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Academic Information</h2>
        <p className="text-muted-foreground mt-2">Please provide details about your academic program in the United States.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University/Institution Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your university or institution name" 
                      className="pl-10" 
                      {...field} 
                    />
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="degreeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Associates">Associate's</SelectItem>
                      <SelectItem value="Bachelors">Bachelor's</SelectItem>
                      <SelectItem value="Masters">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Certificate">Certificate Program</SelectItem>
                      <SelectItem value="Language">Language Program</SelectItem>
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
                  <FormLabel>Field of Study/Major</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your major or field of study" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {isF1OrJ1 && (
            <FormField
              control={form.control}
              name="isSTEM"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">STEM Designated Program</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select if your program is officially designated as STEM (Science, Technology, Engineering, Mathematics).
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          
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
                  <FormLabel>Expected Program End Date</FormLabel>
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
          
          {isF1OrJ1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dsoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSO Name (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your DSO's name" 
                          className="pl-10" 
                          {...field} 
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
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
                    <FormLabel>DSO Email (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="email"
                          placeholder="Enter your DSO's email" 
                          className="pl-10" 
                          {...field} 
                          value={field.value || ""}
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {isF1OrJ1 && (
            <div className="space-y-4">
              <Collapsible 
                open={isTransfersOpen} 
                onOpenChange={setIsTransfersOpen}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Previous School Transfers</h3>
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        {isTransfersOpen ? "Hide" : "Show"} Transfers
                      </Button>
                    </CollapsibleTrigger>
                    <Button 
                      type="button" 
                      size="sm"
                      variant="outline"
                      onClick={handleAddSchool}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add School
                    </Button>
                  </div>
                </div>
                
                <CollapsibleContent className="mt-4 space-y-4">
                  {previousSchools.map((school, index) => (
                    <div key={index} className="border rounded-md p-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveSchool(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel>School Name</FormLabel>
                          <Input 
                            placeholder="Enter previous school name" 
                            value={school.name}
                            onChange={(e) => updateSchool(index, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full text-left ${!school.startDate && "text-muted-foreground"}`}
                                >
                                  {school.startDate ? format(school.startDate, "PPP") : "Select start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={school.startDate || undefined}
                                  onSelect={(date) => updateSchool(index, 'startDate', date)}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-2">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full text-left ${!school.endDate && "text-muted-foreground"}`}
                                >
                                  {school.endDate ? format(school.endDate, "PPP") : "Select end date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={school.endDate || undefined}
                                  onSelect={(date) => updateSchool(index, 'endDate', date)}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {previousSchools.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No previous schools added. Click "Add School" to include any prior institutions.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
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
