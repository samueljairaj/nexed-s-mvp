
import React, { useImperativeHandle, forwardRef, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { AcademicInfoFormValues } from "@/types/onboarding";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { School, Calendar, User, Mail, Phone } from "lucide-react";
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

// Create a schema for the academic info form
const academicInfoSchema = z.object({
  university: z.string().min(1, "University is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  isSTEM: z.boolean().default(false),
  programStartDate: z.date({
    required_error: "Program start date is required",
  }),
  programCompletionDate: z.date({
    required_error: "Program completion date is required",
  }),
  isTransferStudent: z.boolean().default(false),
  transferHistory: z.array(
    z.object({
      universityName: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      reason: z.string().optional(),
    })
  ).default([{ universityName: '', startDate: new Date(), endDate: new Date(), reason: '' }]),
  dsoName: z.string().optional(),
  dsoEmail: z.string().email("Please enter a valid email").optional(), // Made optional
  dsoPhone: z.string().optional(),
});

export interface AcademicInfoStepRef {
  submitForm: () => Promise<void>;
}

interface AcademicInfoStepProps {
  defaultValues: Partial<AcademicInfoFormValues>;
  onSubmit: (data: AcademicInfoFormValues) => Promise<boolean>;
  isSubmitting?: boolean;
  isF1OrJ1?: boolean;
  handleBackToLogin?: () => void;
}

export const AcademicInfoStep = forwardRef<AcademicInfoStepRef, AcademicInfoStepProps>(
  ({ defaultValues, onSubmit, isSubmitting = false, isF1OrJ1 = true, handleBackToLogin }, ref) => {
    // Create form with validation schema
    const form = useForm<AcademicInfoFormValues>({
      resolver: zodResolver(academicInfoSchema),
      defaultValues: {
        university: defaultValues?.university || "",
        degreeLevel: defaultValues?.degreeLevel || "",
        fieldOfStudy: defaultValues?.fieldOfStudy || "",
        isSTEM: defaultValues?.isSTEM || false,
        programStartDate: defaultValues?.programStartDate || undefined,
        programCompletionDate: defaultValues?.programCompletionDate || undefined,
        isTransferStudent: defaultValues?.isTransferStudent || false,
        transferHistory: defaultValues?.transferHistory || [{ universityName: '', startDate: new Date(), endDate: new Date(), reason: '' }],
        dsoName: defaultValues?.dsoName || "",
        dsoEmail: defaultValues?.dsoEmail || "", 
        dsoPhone: defaultValues?.dsoPhone || "",
      }
    });

    // Expose submit method via ref
    useImperativeHandle(ref, () => ({
      async submitForm() {
        return form.handleSubmit(async (data) => {
          console.log("Academic info submitted:", data);
          await onSubmit(data);
        })();
      }
    }));

    // Calculate min date for program completion (must be after program start)
    const startDate = form.watch("programStartDate");

    // Handle showing/hiding transfer student form
    const showTransferForm = form.watch("isTransferStudent");

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Academic Information</h2>
          <p className="text-muted-foreground">
            Please provide information about your educational program.
          </p>
        </div>

        <Form {...form}>
          <form id="academic-step-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select degree level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD / Doctoral</SelectItem>
                        <SelectItem value="associate">Associate's Degree</SelectItem>
                        <SelectItem value="certificate">Certificate Program</SelectItem>
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
                      <Input placeholder="E.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Program Start Date */}
              <FormField
                control={form.control}
                name="programStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Program Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FormDatePicker
                          name="programStartDate"
                          placeholder="Select start date"
                        />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Program Completion Date */}
              <FormField
                control={form.control}
                name="programCompletionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Program Completion Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FormDatePicker
                          name="programCompletionDate"
                          placeholder="Select completion date"
                          disabledDates={(date) => startDate && date < startDate}
                        />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* STEM Field Checkbox */}
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
                    <FormLabel>This is a STEM Field</FormLabel>
                    <FormDescription>
                      Select if your field of study is classified as Science, Technology, Engineering, or Mathematics.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Transfer Student */}
            <FormField
              control={form.control}
              name="isTransferStudent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I am a Transfer Student</FormLabel>
                    <FormDescription>
                      Select if you transferred from another university or institution.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Transfer History - Only show if isTransferStudent is true */}
            {showTransferForm && (
              <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                <h3 className="font-medium">Transfer Information</h3>
                
                <FormField
                  control={form.control}
                  name="transferHistory.0.universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous University/Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter previous university name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transferHistory.0.startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <FormDatePicker
                            name="transferHistory.0.startDate"
                            placeholder="Start date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transferHistory.0.endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <FormDatePicker
                            name="transferHistory.0.endDate"
                            placeholder="End date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="transferHistory.0.reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Transfer</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for transferring" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* DSO Contact Information */}
            {isF1OrJ1 && (
              <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                <h3 className="font-medium">Designated School Official (DSO) Contact Information</h3>
                <p className="text-sm text-muted-foreground">This is optional but helpful for communication purposes.</p>
                
                <FormField
                  control={form.control}
                  name="dsoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DSO Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter DSO name" 
                            {...field} 
                            className="pl-10"
                          />
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dsoEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DSO Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="email" 
                              placeholder="Enter DSO email" 
                              {...field} 
                              className="pl-10"
                            />
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
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
                          <div className="relative">
                            <Input 
                              type="tel" 
                              placeholder="Enter DSO phone" 
                              {...field} 
                              className="pl-10"
                            />
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    );
  }
);

AcademicInfoStep.displayName = "AcademicInfoStep";
