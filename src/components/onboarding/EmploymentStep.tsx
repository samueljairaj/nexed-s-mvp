import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmploymentInfoFormValues, employmentInfoSchema } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FormDatePicker } from "@/components/ui/form-date-picker";

interface EmploymentStepProps {
  defaultValues: Partial<EmploymentInfoFormValues>;
  onSubmit: (data: EmploymentInfoFormValues) => Promise<boolean>;
  isSubmitting?: boolean;
  isF1?: boolean;
  isOptOrCpt?: boolean;
  isStemOpt?: boolean;
  isF1OrJ1?: boolean;
  isEmployed?: boolean;
  onEmploymentStatusChange?: (status: "Employed" | "Not Employed") => void;
}

export function EmploymentStep({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isF1 = true,
  isOptOrCpt = false,
  isStemOpt = false,
  isF1OrJ1 = true,
  isEmployed = false,
  onEmploymentStatusChange
}: EmploymentStepProps) {
  const form = useForm<EmploymentInfoFormValues>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      employmentStatus: defaultValues?.employmentStatus || "Not Employed",
      employerName: defaultValues?.employerName || "",
      jobTitle: defaultValues?.jobTitle || "",
      employmentStartDate: defaultValues?.employmentStartDate || undefined,
      employmentEndDate: defaultValues?.employmentEndDate || undefined,
      authorizationType: defaultValues?.authorizationType || "None",
      authStartDate: defaultValues?.authStartDate || undefined,
      authEndDate: defaultValues?.authEndDate || undefined,
      eadNumber: defaultValues?.eadNumber || "",
      eVerifyNumber: defaultValues?.eVerifyNumber || "",
      unemploymentDaysUsed: defaultValues?.unemploymentDaysUsed || "",
    },
  });

  // Get the current employment status value
  const employmentStatus = form.watch("employmentStatus");
  const authorizationType = form.watch("authorizationType");
  
  // Call the onEmploymentStatusChange callback when status changes
  useEffect(() => {
    if (onEmploymentStatusChange) {
      onEmploymentStatusChange(employmentStatus);
    }
  }, [employmentStatus, onEmploymentStatusChange]);

  return (
    <Form {...form}>
      <form id="step-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Employment Information</h2>
          <p className="text-muted-foreground">
            Please provide information about your current employment status.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onEmploymentStatusChange) {
                    onEmploymentStatusChange(value as "Employed" | "Not Employed");
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Not Employed">Not Employed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {employmentStatus === "Employed" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter employer name" />
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
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter job title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Employment Start Date */}
            <FormField
              control={form.control}
              name="employmentStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Employment Start Date</FormLabel>
                  <FormDatePicker
                    name="employmentStartDate"
                    placeholder="Select start date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isF1 && (
              <>
                <FormField
                  control={form.control}
                  name="authorizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Authorization</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work authorization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="CPT">CPT (Curricular Practical Training)</SelectItem>
                          <SelectItem value="OPT">OPT (Optional Practical Training)</SelectItem>
                          <SelectItem value="STEM OPT">STEM OPT Extension</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {authorizationType && authorizationType !== "None" && (
                  <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                    <h3 className="font-medium">{authorizationType} Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="authStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{authorizationType} Start Date</FormLabel>
                            <FormDatePicker
                              name="authStartDate"
                              placeholder="Select start date"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="authEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{authorizationType} End Date</FormLabel>
                            <FormDatePicker
                              name="authEndDate"
                              placeholder="Select end date"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {(authorizationType === "OPT" || authorizationType === "STEM OPT") && (
                      <>
                        <FormField
                          control={form.control}
                          name="eadNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>EAD Card Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter EAD card number" />
                              </FormControl>
                              <FormDescription>
                                Your Employment Authorization Document (EAD) card number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="unemploymentDaysUsed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unemployment Days Used</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter number of days" />
                              </FormControl>
                              <FormDescription>
                                OPT allows up to 90 days of unemployment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {authorizationType === "STEM OPT" && (
                      <FormField
                        control={form.control}
                        name="eVerifyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer E-Verify Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter E-Verify number" />
                            </FormControl>
                            <FormDescription>
                              Required for STEM OPT extension
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </form>
    </Form>
  );
}
