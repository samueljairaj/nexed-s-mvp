
import { useState, useEffect } from "react";
import { useAuth, VisaType } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries } from "@/types/onboarding";

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    visaType: "" as VisaType,
    university: "",
    courseStartDate: null as Date | null,
    usEntryDate: null as Date | null,
    employmentStartDate: null as Date | null,
  });

  // Fetch current user data
  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        country: currentUser.country || "",
        visaType: currentUser.visaType || null,
        university: currentUser.university || "",
        courseStartDate: currentUser.courseStartDate || null,
        usEntryDate: currentUser.usEntryDate || null,
        employmentStartDate: currentUser.employmentStartDate || null,
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setForm((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const getRequiredDocuments = () => {
    const docs = ["Valid Passport", "Visa Document"];

    if (form.visaType === "F1") {
      docs.push("I-20 Form", "SEVIS Fee Receipt", "I-94 Arrival Record");
    } else if (form.visaType === "J1") {
      docs.push("DS-2019 Form", "SEVIS Fee Receipt", "I-94 Arrival Record", "Health Insurance Documentation");
    } else if (form.visaType === "H1B") {
      docs.push("I-797 Approval Notice", "Labor Condition Application", "Employment Verification Letter");
    }

    return docs;
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Origin</Label>
                    <Select
                      value={form.country}
                      onValueChange={(value) =>
                        handleSelectChange("country", value)
                      }
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visaType">Visa Type</Label>
                    <Select
                      value={form.visaType || ""}
                      onValueChange={(value) =>
                        handleSelectChange("visaType", value as VisaType)
                      }
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    name="university"
                    value={form.university || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Course Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.courseStartDate && "text-muted-foreground"
                          )}
                        >
                          {form.courseStartDate ? (
                            format(new Date(form.courseStartDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            form.courseStartDate
                              ? new Date(form.courseStartDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleDateChange("courseStartDate", date)
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>US Entry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.usEntryDate && "text-muted-foreground"
                          )}
                        >
                          {form.usEntryDate ? (
                            format(new Date(form.usEntryDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            form.usEntryDate
                              ? new Date(form.usEntryDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleDateChange("usEntryDate", date)
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.employmentStartDate && "text-muted-foreground"
                          )}
                        >
                          {form.employmentStartDate ? (
                            format(new Date(form.employmentStartDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            form.employmentStartDate
                              ? new Date(form.employmentStartDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleDateChange("employmentStartDate", date)
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="nexed-gradient-button">
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Document Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Based on your visa type, ensure you have the following documents:
              </p>
              <ul className="space-y-2">
                {getRequiredDocuments().map((doc, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-nexed-600 mr-2"></div>
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visa Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Current Status:</span>
                  <p className="font-medium">{form.visaType || "Not specified"}</p>
                </div>
                
                {form.visaType === "F1" && (
                  <div className="p-3 bg-amber-50 rounded-md">
                    <p className="text-amber-800 text-sm">Remember to maintain full-time enrollment</p>
                  </div>
                )}
                
                {form.visaType === "J1" && (
                  <div className="p-3 bg-amber-50 rounded-md">
                    <p className="text-amber-800 text-sm">Health insurance is mandatory</p>
                  </div>
                )}
                
                {form.visaType === "H1B" && (
                  <div className="p-3 bg-amber-50 rounded-md">
                    <p className="text-amber-800 text-sm">Employment limited to sponsoring employer</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
