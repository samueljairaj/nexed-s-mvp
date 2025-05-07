
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const { updateProfile, completeOnboarding, currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    country: currentUser?.country || "",
    visaType: currentUser?.visaType || "F1",
    university: currentUser?.university || "",
    courseStartDate: currentUser?.courseStartDate ? new Date(currentUser.courseStartDate).toISOString().split('T')[0] : "",
    usEntryDate: currentUser?.usEntryDate ? new Date(currentUser.usEntryDate).toISOString().split('T')[0] : "",
    employmentStartDate: currentUser?.employmentStartDate ? new Date(currentUser.employmentStartDate).toISOString().split('T')[0] : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.country)) {
      toast.error("Please fill in your name and country");
      return;
    }
    if (step === 2 && !formData.visaType) {
      toast.error("Please select your visa type");
      return;
    }
    if (step === 3) {
      // For the last step, specific validation based on visa type
      if (formData.visaType === "F1" && !formData.university) {
        toast.error("Please enter your university");
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    updateProfile({
      name: formData.name,
      country: formData.country,
      visaType: formData.visaType as any,
      university: formData.university,
      courseStartDate: formData.courseStartDate ? new Date(formData.courseStartDate) : undefined,
      usEntryDate: formData.usEntryDate ? new Date(formData.usEntryDate) : undefined,
      employmentStartDate: formData.employmentStartDate ? new Date(formData.employmentStartDate) : undefined,
    });
    completeOnboarding();
    toast.success("Profile setup complete!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-md nexed-gradient" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to neXed</h1>
          <p className="text-gray-600">
            Let's set up your profile to provide a personalized experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex flex-col items-center ${
                  num !== 4 ? "w-1/3" : ""
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step >= num
                      ? "nexed-gradient text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > num ? <CheckCircle2 size={20} /> : num}
                </div>
                <div className="text-xs mt-2 text-center">
                  {num === 1 && "Personal Info"}
                  {num === 2 && "Visa Details"}
                  {num === 3 && "Academic Info"}
                  {num === 4 && "Finish"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative flex items-center w-full mt-2">
            <div className="h-1 bg-gray-200 w-full absolute">
              <div
                className="h-1 nexed-gradient transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What type of visa do you have?"}
              {step === 3 && "Academic & Entry Information"}
              {step === 4 && "You're all set!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country of Origin</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="India"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type</Label>
                  <Select
                    value={formData.visaType || undefined}
                    onValueChange={(value) => handleSelectChange("visaType", value)}
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
                </div>

                {formData.visaType && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-nexed-700 mb-2">
                      {formData.visaType === "F1" && "F-1 Student Visa"}
                      {formData.visaType === "OPT" && "Optional Practical Training (OPT)"}
                      {formData.visaType === "H1B" && "H-1B Work Visa"}
                      {formData.visaType === "Other" && "Other Visa Type"}
                    </h3>
                    <p className="text-nexed-600">
                      {formData.visaType === "F1" && 
                        "The F-1 visa allows you to enter the United States as a full-time student at an accredited college, university, or other academic institution."}
                      {formData.visaType === "OPT" && 
                        "OPT is temporary employment directly related to an F-1 student's major area of study. You can apply for up to 12 months of OPT."}
                      {formData.visaType === "H1B" && 
                        "The H-1B is a visa that allows U.S. employers to temporarily employ foreign workers in specialty occupations."}
                      {formData.visaType === "Other" && 
                        "We'll still help you manage your documentation and provide relevant information for your situation."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <Tabs defaultValue={formData.visaType?.toLowerCase() || "f1"}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="f1">F-1</TabsTrigger>
                    <TabsTrigger value="opt">OPT</TabsTrigger>
                    <TabsTrigger value="h1b">H-1B</TabsTrigger>
                  </TabsList>
                  <TabsContent value="f1" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University/School</Label>
                      <Input
                        id="university"
                        name="university"
                        placeholder="Harvard University"
                        value={formData.university}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseStartDate">Course Start Date</Label>
                      <Input
                        id="courseStartDate"
                        name="courseStartDate"
                        type="date"
                        value={formData.courseStartDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usEntryDate">U.S. Entry Date</Label>
                      <Input
                        id="usEntryDate"
                        name="usEntryDate"
                        type="date"
                        value={formData.usEntryDate}
                        onChange={handleChange}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="opt" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University/School</Label>
                      <Input
                        id="university"
                        name="university"
                        placeholder="Harvard University"
                        value={formData.university}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStartDate">OPT Start Date</Label>
                      <Input
                        id="employmentStartDate"
                        name="employmentStartDate"
                        type="date"
                        value={formData.employmentStartDate}
                        onChange={handleChange}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="h1b" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="employmentStartDate">H-1B Start Date</Label>
                      <Input
                        id="employmentStartDate"
                        name="employmentStartDate"
                        type="date"
                        value={formData.employmentStartDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usEntryDate">U.S. Entry Date</Label>
                      <Input
                        id="usEntryDate"
                        name="usEntryDate"
                        type="date"
                        value={formData.usEntryDate}
                        onChange={handleChange}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Profile Setup Complete!</h3>
                <p className="text-gray-600 mb-6">
                  We've personalized your experience based on your visa type and details. You're now ready to start managing your compliance and documents.
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={nextStep} className="nexed-gradient">
                {step === 4 ? "Go to Dashboard" : "Continue"} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
