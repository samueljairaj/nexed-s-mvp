
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";

const VISA_OPTIONS = [
  { value: "F1", label: "F-1 Student Visa" },
  { value: "J1", label: "J-1 Exchange Visitor" },
  { value: "H1B", label: "H-1B Work Visa" },
  { value: "CPT", label: "Curricular Practical Training (CPT)" },
  { value: "OPT", label: "Optional Practical Training (OPT)" },
  { value: "STEM_OPT", label: "STEM OPT Extension" },
  { value: "Other", label: "Other" }
];

const DEGREE_OPTIONS = [
  { value: "associates", label: "Associate's Degree" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "phd", label: "PhD / Doctorate" },
  { value: "certificate", label: "Certificate Program" },
  { value: "other", label: "Other" }
];

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  university: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  visaType: z.string().optional(),
  degreeLevel: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  isSTEM: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileEditor = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  // Dates
  const [courseStartDate, setCourseStartDate] = useState<Date | undefined>(
    currentUser?.courseStartDate ? new Date(currentUser.courseStartDate) : undefined
  );
  const [usEntryDate, setUsEntryDate] = useState<Date | undefined>(
    currentUser?.usEntryDate ? new Date(currentUser.usEntryDate) : undefined
  );
  const [employmentStartDate, setEmploymentStartDate] = useState<Date | undefined>(
    currentUser?.employmentStartDate ? new Date(currentUser.employmentStartDate) : undefined
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined
  );
  const [passportExpiryDate, setPassportExpiryDate] = useState<Date | undefined>(
    currentUser?.passportExpiryDate ? new Date(currentUser.passportExpiryDate) : undefined
  );

  const defaultValues: Partial<ProfileFormValues> = {
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    university: currentUser?.university || "",
    country: currentUser?.country || "",
    address: currentUser?.address || "",
    visaType: currentUser?.visaType || "F1",
    degreeLevel: currentUser?.degreeLevel || "",
    fieldOfStudy: currentUser?.fieldOfStudy || "",
    isSTEM: currentUser?.isSTEM || false,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: data.name,
        address: data.address,
        country: data.country,
        email: data.email,
        phone: data.phone,
        university: data.university,
        visaType: data.visaType as any,
        degreeLevel: data.degreeLevel,
        fieldOfStudy: data.fieldOfStudy,
        isSTEM: data.isSTEM,
        courseStartDate: courseStartDate ? courseStartDate.toISOString() : undefined,
        usEntryDate: usEntryDate ? usEntryDate.toISOString() : undefined,
        employmentStartDate: employmentStartDate ? employmentStartDate.toISOString() : undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        passportExpiryDate: passportExpiryDate ? passportExpiryDate.toISOString() : undefined,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and visa status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="visa">Visa & Academic</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="personal" className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 555-5555" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your current address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormLabel>Date of Birth</FormLabel>
                  <DatePicker
                    date={dateOfBirth}
                    onDateChange={setDateOfBirth}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <FormLabel>Passport Expiry Date</FormLabel>
                  <DatePicker
                    date={passportExpiryDate}
                    onDateChange={setPassportExpiryDate}
                    className="w-full"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="visa" className="space-y-6">
                <FormField
                  control={form.control}
                  name="visaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visa type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VISA_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormLabel>US Entry Date</FormLabel>
                  <DatePicker
                    date={usEntryDate}
                    onDateChange={setUsEntryDate}
                    className="w-full"
                  />
                </div>
                
                <Separator className="my-6" />
                
                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University / School</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your university name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {DEGREE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your major or field" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormLabel>Course Start Date</FormLabel>
                  <DatePicker
                    date={courseStartDate}
                    onDateChange={setCourseStartDate}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <FormLabel>Employment Start Date (if applicable)</FormLabel>
                  <DatePicker
                    date={employmentStartDate}
                    onDateChange={setEmploymentStartDate}
                    className="w-full"
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isSTEM"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">STEM Field</FormLabel>
                        <FormDescription>
                          Is your field of study a STEM field?
                        </FormDescription>
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
              </TabsContent>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};
