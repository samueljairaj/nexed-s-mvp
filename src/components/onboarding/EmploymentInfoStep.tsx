
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { employmentInfoSchema } from "@/types/onboarding";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";

interface EmploymentInfoStepProps {
  defaultValues: {
    employmentStatus: any;
    employerName: string;
    jobTitle: string;
    employmentStartDate: Date | null;
    employmentEndDate: Date | null;
    isFieldRelated: boolean;
    optCptStartDate: Date | null;
    optCptEndDate: Date | null;
    eadNumber: string;
    stemEVerify: string;
    stemI983Date: Date | null;
  };
  onSubmit: (data: any) => void;
  visaType: string;
  onEmploymentStatusChange: (value: string) => void;
  isF1OrJ1: () => boolean;
  isEmployed: () => boolean;
  isOptOrCpt: () => boolean;
  isStemOpt: () => boolean;
}

export function EmploymentInfoStep({ 
  defaultValues, 
  onSubmit, 
  visaType, 
  onEmploymentStatusChange, 
  isF1OrJ1,
  isEmployed,
  isOptOrCpt,
  isStemOpt
}: EmploymentInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Employment Status</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  onEmploymentStatusChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not Employed">Not Employed</SelectItem>
                  {isF1OrJ1() && <SelectItem value="On-Campus Employment">On-Campus Employment</SelectItem>}
                  {visaType === "F1" && <SelectItem value="CPT">CPT (Curricular Practical Training)</SelectItem>}
                  {visaType === "F1" && <SelectItem value="OPT">OPT (Optional Practical Training)</SelectItem>}
                  {visaType === "F1" && <SelectItem value="STEM OPT Extension">STEM OPT Extension</SelectItem>}
                  <SelectItem value="H1B">H-1B</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isEmployed() && (
          <>
            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your employer name" {...field} />
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
                  <FormLabel>Position/Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employmentStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Employment Start Date</FormLabel>
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
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employmentEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Employment End Date (if applicable)</FormLabel>
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
                          disabled={(date) => 
                            form.watch("employmentStartDate") && 
                            date <= form.watch("employmentStartDate")
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
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
        
        {isOptOrCpt() && (
          <>
            <FormField
              control={form.control}
              name="isFieldRelated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      This position is related to my field of study
                    </FormLabel>
                    <FormDescription>
                      CPT/OPT employment must be directly related to your major field of study
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="optCptStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {form.watch("employmentStatus") === "CPT" 
                        ? "CPT Authorization Start Date" 
                        : "OPT Authorization Start Date"}
                    </FormLabel>
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
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="optCptEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {form.watch("employmentStatus") === "CPT" 
                        ? "CPT Authorization End Date" 
                        : "OPT Authorization End Date"}
                    </FormLabel>
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
                          disabled={(date) => 
                            form.watch("optCptStartDate") && 
                            date <= form.watch("optCptStartDate")
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(form.watch("employmentStatus") === "OPT" || form.watch("employmentStatus") === "STEM OPT Extension") && (
              <FormField
                control={form.control}
                name="eadNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAD Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your EAD card number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        
        {isStemOpt() && (
          <>
            <FormField
              control={form.control}
              name="stemEVerify"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer E-Verify Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter employer's E-Verify number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stemI983Date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>I-983 Training Plan Submission Date</FormLabel>
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
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
