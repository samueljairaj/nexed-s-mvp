
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, MapPin, School, Info, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const universityInfoSchema = z.object({
  // Basic Institution Information
  universityName: z.string().min(2, "University name must be at least 2 characters"),
  universityType: z.string().min(2, "Please select a university type"),
  yearFounded: z.string().optional(),
  accreditation: z.string().optional(),
  universityWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  
  // Location Information
  country: z.string().min(2, "Country is required"),
  mainCampusAddress: z.string().min(5, "Main campus address is required"),
  hasSatelliteCampuses: z.boolean().optional(),
  satelliteCampuses: z.string().optional(),
  
  // International Student Program Information
  sevisId: z.string().min(5, "SEVIS School Code is required"),
  internationalStudentCount: z.string().optional(),
  programTypes: z.string().min(2, "Program types are required"),
  
  // Primary DSO Contact Information
  primaryDsoName: z.string().min(2, "Primary DSO name is required"),
  primaryDsoTitle: z.string().min(2, "Primary DSO title is required"),
  primaryDsoEmail: z.string().email("Please enter a valid email"),
  primaryDsoPhone: z.string().min(7, "Phone number must be at least 7 digits"),
  
  // Secondary DSO Contact (Optional)
  hasSecondaryDso: z.boolean().optional(),
  secondaryDsoName: z.string().optional(),
  secondaryDsoTitle: z.string().optional(),
  secondaryDsoEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  secondaryDsoPhone: z.string().optional(),
  
  // International Office Information
  internationalOfficeLocation: z.string().min(2, "Office location is required"),
  officeHours: z.string().min(2, "Office hours are required"),
  additionalResources: z.string().optional(),
});

export type UniversityInfoFormData = z.infer<typeof universityInfoSchema>;

interface UniversityInfoStepProps {
  defaultValues?: Partial<UniversityInfoFormData>;
  onSubmit: (data: UniversityInfoFormData) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function UniversityInfoStep({ 
  defaultValues = {},
  onSubmit,
  isSubmitting = false 
}: UniversityInfoStepProps) {
  const [hasSatelliteCampuses, setHasSatelliteCampuses] = useState(defaultValues.hasSatelliteCampuses || false);
  const [hasSecondaryDso, setHasSecondaryDso] = useState(defaultValues.hasSecondaryDso || false);
  
  const form = useForm<UniversityInfoFormData>({
    resolver: zodResolver(universityInfoSchema),
    defaultValues: {
      universityName: defaultValues.universityName || "",
      universityType: defaultValues.universityType || "",
      yearFounded: defaultValues.yearFounded || "",
      accreditation: defaultValues.accreditation || "",
      universityWebsite: defaultValues.universityWebsite || "",
      
      country: defaultValues.country || "United States",
      mainCampusAddress: defaultValues.mainCampusAddress || "",
      hasSatelliteCampuses: defaultValues.hasSatelliteCampuses || false,
      satelliteCampuses: defaultValues.satelliteCampuses || "",
      
      sevisId: defaultValues.sevisId || "",
      internationalStudentCount: defaultValues.internationalStudentCount || "",
      programTypes: defaultValues.programTypes || "",
      
      primaryDsoName: defaultValues.primaryDsoName || "",
      primaryDsoTitle: defaultValues.primaryDsoTitle || "",
      primaryDsoEmail: defaultValues.primaryDsoEmail || "",
      primaryDsoPhone: defaultValues.primaryDsoPhone || "",
      
      hasSecondaryDso: defaultValues.hasSecondaryDso || false,
      secondaryDsoName: defaultValues.secondaryDsoName || "",
      secondaryDsoTitle: defaultValues.secondaryDsoTitle || "",
      secondaryDsoEmail: defaultValues.secondaryDsoEmail || "",
      secondaryDsoPhone: defaultValues.secondaryDsoPhone || "",
      
      internationalOfficeLocation: defaultValues.internationalOfficeLocation || "",
      officeHours: defaultValues.officeHours || "",
      additionalResources: defaultValues.additionalResources || "",
    }
  });

  // Handle checkbox changes
  const onSatelliteCampusesChange = (checked: boolean) => {
    setHasSatelliteCampuses(checked);
    form.setValue("hasSatelliteCampuses", checked);
  };
  
  const onSecondaryDsoChange = (checked: boolean) => {
    setHasSecondaryDso(checked);
    form.setValue("hasSecondaryDso", checked);
  };

  const universityTypes = [
    "Public Research University",
    "Private Research University",
    "Liberal Arts College",
    "Community College",
    "Technical/Vocational College",
    "State University",
    "Religious-Affiliated University",
    "For-Profit Institution",
    "Military Academy",
    "Art/Music/Design School",
    "Medical/Health Sciences School",
    "Law School",
    "Business School",
    "Other"
  ];
  
  const programTypeOptions = [
    "Undergraduate Degree Programs",
    "Graduate Degree Programs",
    "Doctoral Programs",
    "Professional Programs",
    "ESL/Language Programs",
    "Certificate Programs",
    "Exchange Programs",
    "Online Programs",
    "Continuing Education"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">University Information</h2>
        <p className="text-muted-foreground">
          Please provide details about your academic institution to help us set up your DSO profile.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic University Information Section */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <School className="h-5 w-5" />
              Basic Institution Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="universityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Harvard University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="universityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Type*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {universityTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearFounded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Founded</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="1636" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accreditation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accreditation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Regional, AACSB, ABET" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="universityWebsite"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>University Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="url" 
                          placeholder="https://www.university.edu" 
                          className="pl-10"
                          {...field} 
                        />
                        <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Location Information Section */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mainCampusAddress"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Main Campus Address*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="123 University Ave, Cambridge, MA 02138" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasSatelliteCampuses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          onSatelliteCampusesChange(checked === true);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This institution has satellite/branch campuses
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {hasSatelliteCampuses && (
                <FormField
                  control={form.control}
                  name="satelliteCampuses"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Satellite Campus Locations</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="New York Campus: 123 Broadway, New York, NY 10001&#10;London Campus: 45 Oxford St, London, UK" 
                          className="resize-none h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List each campus location on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
          
          {/* International Student Program Information */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Info className="h-5 w-5" />
              International Student Program
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sevisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEVIS School Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="BOS214F12345678" {...field} />
                    </FormControl>
                    <FormDescription>
                      The institution's SEVIS ID assigned by the Department of Homeland Security
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="internationalStudentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approximate International Student Count</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="1500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="programTypes"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Program Types Offered to International Students*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program types" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the primary program type offered to international students
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Primary DSO Information */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5" />
              Primary DSO Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryDsoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary DSO Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryDsoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Director of International Student Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryDsoEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="dso@university.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryDsoPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone*</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Secondary DSO Information (Optional) */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <FormField
                control={form.control}
                name="hasSecondaryDso"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          onSecondaryDsoChange(checked === true);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-lg font-medium">
                        Add Secondary DSO Contact
                      </FormLabel>
                      <FormDescription>
                        Add information for an additional DSO at your institution
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {hasSecondaryDso && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="secondaryDsoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary DSO Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryDsoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Assistant Director of International Student Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryDsoEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="dso2@university.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryDsoPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7891" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          {/* International Office Information */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5" />
              International Office Information
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="internationalOfficeLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="Student Center, Room 203" {...field} />
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
                    <FormLabel>Office Hours*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Monday-Friday: 9am-5pm&#10;Walk-in Hours: Tuesday & Thursday 1-3pm" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Resources</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any additional resources or support services available to international students" 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Information on orientation programs, cultural events, tutoring services, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
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
