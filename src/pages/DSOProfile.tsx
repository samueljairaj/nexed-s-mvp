
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const dsoProfileSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  officeLocation: z.string().optional(),
  officeHours: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
});

type DSOProfileFormValues = z.infer<typeof dsoProfileSchema>;

const DSOProfile = () => {
  const { currentUser, dsoProfile, updateDSOProfile, isDSO } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<DSOProfileFormValues> = {
    title: dsoProfile?.title || "",
    department: dsoProfile?.department || "",
    officeLocation: dsoProfile?.officeLocation || "",
    officeHours: dsoProfile?.officeHours || "",
    contactEmail: dsoProfile?.contactEmail || currentUser?.email || "",
    contactPhone: dsoProfile?.contactPhone || currentUser?.phone || "",
  };

  const form = useForm<DSOProfileFormValues>({
    resolver: zodResolver(dsoProfileSchema),
    defaultValues,
  });

  const onSubmit = async (data: DSOProfileFormValues) => {
    if (!isDSO) {
      toast.error("Only DSO users can update their DSO profile");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDSOProfile(data);
      toast.success("DSO profile updated successfully");
    } catch (error) {
      console.error("Failed to update DSO profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDSO) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">You do not have DSO access.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">DSO Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your DSO information for {currentUser?.university || "your university"}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>DSO Information</CardTitle>
          <CardDescription>
            This information will be visible to students and other users in your university
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="International Student Advisor" {...field} />
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
                        <Input placeholder="Office of International Education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="officeLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Student Center, Room 203" {...field} />
                      </FormControl>
                      <FormDescription>Where students can find you in person</FormDescription>
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
                        <Textarea 
                          placeholder="Monday-Friday: 9am-4pm&#10;Walk-in hours: Tuesdays 1-3pm" 
                          className="h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                        <Input placeholder="+1 (123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DSOProfile;

