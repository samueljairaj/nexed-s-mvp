
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Clock, MapPin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const dsoProfileSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  officeLocation: z.string().min(2, "Office location must be at least 2 characters"),
  officeHours: z.string().min(2, "Office hours must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(7, "Phone number must be at least 7 digits"),
});

export type DsoProfileFormData = z.infer<typeof dsoProfileSchema>;

interface DsoProfileStepProps {
  defaultValues?: Partial<DsoProfileFormData>;
  onSubmit: (data: DsoProfileFormData) => void;
  isSubmitting?: boolean;
}

export function DsoProfileStep({ 
  defaultValues = {},
  onSubmit,
  isSubmitting = false 
}: DsoProfileStepProps) {
  const { currentUser } = useAuth();
  
  const form = useForm<DsoProfileFormData>({
    resolver: zodResolver(dsoProfileSchema),
    defaultValues: {
      title: currentUser?.dsoProfile?.title || defaultValues.title || "",
      department: currentUser?.dsoProfile?.department || defaultValues.department || "",
      officeLocation: currentUser?.dsoProfile?.officeLocation || defaultValues.officeLocation || "",
      officeHours: currentUser?.dsoProfile?.officeHours || defaultValues.officeHours || "",
      contactEmail: currentUser?.dsoProfile?.contactEmail || defaultValues.contactEmail || "",
      contactPhone: currentUser?.dsoProfile?.contactPhone || defaultValues.contactPhone || "",
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Set Up Your DSO Profile</h2>
        <p className="text-muted-foreground">
          This information will be visible to students to help them reach out to you when needed.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Title</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. International Student Advisor"
                        className="pl-10" 
                        {...field} 
                      />
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. Office of International Education"
                        className="pl-10" 
                        {...field} 
                      />
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="email" 
                        placeholder="dso@university.edu" 
                        className="pl-10" 
                        {...field} 
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
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="tel" 
                        placeholder="(123) 456-7890" 
                        className="pl-10" 
                        {...field} 
                      />
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="officeLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. International Center, Room 204" 
                      className="pl-10" 
                      {...field} 
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="officeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Hours</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="e.g. Monday-Friday: 9AM-5PM, Walk-in hours: Tuesday 1-3PM" 
                      className="pl-10 pt-8" 
                      {...field} 
                    />
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
              "Save & Continue"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
