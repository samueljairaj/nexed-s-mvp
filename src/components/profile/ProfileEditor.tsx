
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { countries } from "@/types/onboarding";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Database } from "@/integrations/supabase/types";

type VisaType = Database["public"]["Enums"]["visa_type"];

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  visaType: z.enum(["F1", "J1", "H1B", "CPT", "OPT", "STEM_OPT", "Other"]).nullable().optional(),
  university: z.string().optional(),
  degreeLevel: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  isSTEM: z.boolean().optional(),
  courseStartDate: z.date().nullable().optional(),
  usEntryDate: z.date().nullable().optional(),
  employmentStartDate: z.date().nullable().optional(),
  dateOfBirth: z.date().nullable().optional(),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.date().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileEditor = () => {
  const { currentUser, updateProfile } = useAuth();
  const [openSections, setOpenSections] = useState({
    personal: true,
    visa: false,
    academic: false,
    employment: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      country: currentUser?.country || "",
      address: currentUser?.address || "",
      phone: currentUser?.phone || "",
      visaType: currentUser?.visaType || null,
      university: currentUser?.university || "",
      degreeLevel: currentUser?.degreeLevel || "",
      fieldOfStudy: currentUser?.fieldOfStudy || "",
      isSTEM: currentUser?.isSTEM || false,
      courseStartDate: currentUser?.courseStartDate || null,
      usEntryDate: currentUser?.usEntryDate || null,
      employmentStartDate: currentUser?.employmentStartDate || null,
      dateOfBirth: currentUser?.dateOfBirth || null,
      passportNumber: currentUser?.passportNumber || "",
      passportExpiryDate: currentUser?.passportExpiryDate || null,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <Collapsible open={openSections.personal}>
            <CollapsibleTrigger asChild>
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSection("personal")}
              >
                <h2 className="text-lg font-semibold">Personal Information</h2>
                {openSections.personal ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <FormDatePicker
                          name="dateOfBirth"
                        />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Origin</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Visa Information */}
        <Card>
          <Collapsible open={openSections.visa}>
            <CollapsibleTrigger asChild>
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSection("visa")}
              >
                <h2 className="text-lg font-semibold">Visa Information</h2>
                {openSections.visa ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Type</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select visa type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="F1">F-1 (Student)</SelectItem>
                            <SelectItem value="J1">J-1 (Exchange Visitor)</SelectItem>
                            <SelectItem value="H1B">H-1B (Work)</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="usEntryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>US Entry Date</FormLabel>
                        <FormDatePicker 
                          name="usEntryDate"
                        />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passportExpiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Passport Expiry Date</FormLabel>
                        <FormDatePicker
                          name="passportExpiryDate"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Academic Information */}
        <Card>
          <Collapsible open={openSections.academic}>
            <CollapsibleTrigger asChild>
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSection("academic")}
              >
                <h2 className="text-lg font-semibold">Academic Information</h2>
                {openSections.academic ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/Institution</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="courseStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Course Start Date</FormLabel>
                        <FormDatePicker
                          name="courseStartDate"
                        />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="degreeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree Level</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Associates">Associate's</SelectItem>
                            <SelectItem value="Bachelors">Bachelor's</SelectItem>
                            <SelectItem value="Masters">Master's</SelectItem>
                            <SelectItem value="Doctoral">Doctoral</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isSTEM"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-nexed-600 focus:ring-nexed-500"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">STEM Designated Program</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Employment Information */}
        <Card>
          <Collapsible open={openSections.employment}>
            <CollapsibleTrigger asChild>
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSection("employment")}
              >
                <h2 className="text-lg font-semibold">Employment Information</h2>
                {openSections.employment ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employmentStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Employment Start Date</FormLabel>
                        <FormDatePicker
                          name="employmentStartDate"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" className="nexed-gradient-button">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
