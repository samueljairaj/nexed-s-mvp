
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, Mail, Flag, GraduationCap, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    country: currentUser?.country || "",
    visaType: currentUser?.visaType || "",
    university: currentUser?.university || "",
    courseStartDate: currentUser?.courseStartDate ? new Date(currentUser.courseStartDate).toISOString().split('T')[0] : "",
    usEntryDate: currentUser?.usEntryDate ? new Date(currentUser.usEntryDate).toISOString().split('T')[0] : "",
    employmentStartDate: currentUser?.employmentStartDate ? new Date(currentUser.employmentStartDate).toISOString().split('T')[0] : "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({
      name: formData.name,
      country: formData.country,
      visaType: formData.visaType as any,
      university: formData.university,
      courseStartDate: formData.courseStartDate ? new Date(formData.courseStartDate) : undefined,
      usEntryDate: formData.usEntryDate ? new Date(formData.usEntryDate) : undefined,
      employmentStartDate: formData.employmentStartDate ? new Date(formData.employmentStartDate) : undefined,
    });
    
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-600 mt-2">
          View and update your personal information
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="nexed-card md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Profile Overview</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-nexed-100 flex items-center justify-center">
                <User size={40} className="text-nexed-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{currentUser?.name || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Flag className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Country of Origin</p>
                  <p className="font-medium">{currentUser?.country || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Visa Type</p>
                  <div>
                    {currentUser?.visaType === "F1" && <span className="font-medium">F-1 Student Visa</span>}
                    {currentUser?.visaType === "OPT" && <span className="font-medium">Optional Practical Training (OPT)</span>}
                    {currentUser?.visaType === "H1B" && <span className="font-medium">H-1B Work Visa</span>}
                    {(!currentUser?.visaType || currentUser.visaType === "Other") && <span className="font-medium">Other Visa Type</span>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details / Edit Form */}
        <Card className="nexed-card md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Profile Details</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country of Origin</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="India"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type</Label>
                  {isEditing ? (
                    <Select
                      value={formData.visaType}
                      onValueChange={(value) => handleSelectChange("visaType", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F1">F-1 Student Visa</SelectItem>
                        <SelectItem value="OPT">Optional Practical Training (OPT)</SelectItem>
                        <SelectItem value="H1B">H-1B Work Visa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="visaType"
                      value={
                        formData.visaType === "F1" ? "F-1 Student Visa" :
                        formData.visaType === "OPT" ? "Optional Practical Training (OPT)" :
                        formData.visaType === "H1B" ? "H-1B Work Visa" :
                        "Other Visa Type"
                      }
                      disabled
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="university">University/School</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Harvard University"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseStartDate">Course Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="courseStartDate"
                      name="courseStartDate"
                      type="date"
                      value={formData.courseStartDate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="usEntryDate">U.S. Entry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="usEntryDate"
                      name="usEntryDate"
                      type="date"
                      value={formData.usEntryDate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                {(formData.visaType === "OPT" || formData.visaType === "H1B") && (
                  <div className="space-y-2">
                    <Label htmlFor="employmentStartDate">
                      {formData.visaType === "OPT" ? "OPT Start Date" : "H-1B Start Date"}
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="employmentStartDate"
                        name="employmentStartDate"
                        type="date"
                        value={formData.employmentStartDate}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="nexed-gradient">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Additional Settings or Information */}
        <Card className="nexed-card md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-2">Notification Preferences</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Control how you receive notifications and reminders.
                  </p>
                  <Button variant="outline">Manage Notifications</Button>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-2">Data & Privacy</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    View and adjust how your data is used within the platform.
                  </p>
                  <Button variant="outline">Privacy Settings</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
