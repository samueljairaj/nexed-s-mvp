import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Building2, MapPin, FileText, Plus } from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Use the correct interface name from useUniversityInfo
export interface UniversityInfoFormData {
  action: "create" | "join";
  name: string;
  location: string;
  sevisId: string;
  existingUniversityId?: string;
}

const universityInfoSchema = z.object({
  action: z.enum(["create", "join"]),
  name: z.string().min(2, "University name must be at least 2 characters").optional(),
  location: z.string().min(2, "Location must be at least 2 characters").optional(),
  sevisId: z.string().min(3, "SEVIS ID must be at least 3 characters").optional(),
  existingUniversityId: z.string().optional(),
}).refine(data => {
  if (data.action === "create") {
    return !!data.name && !!data.location && !!data.sevisId;
  }
  return !!data.existingUniversityId;
}, {
  message: "Please fill out all required fields",
  path: ["action"]
});

interface UniversityInfoStepProps {
  defaultValues: Partial<UniversityInfoFormData>;
  onSubmit: (data: UniversityInfoFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export const UniversityInfoStep = ({
  defaultValues,
  onSubmit,
  isSubmitting
}: UniversityInfoStepProps) => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUniversities, setFilteredUniversities] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof universityInfoSchema>>({
    resolver: zodResolver(universityInfoSchema),
    defaultValues: {
      action: defaultValues.action || "create",
      name: defaultValues.name || "",
      location: defaultValues.location || "",
      sevisId: defaultValues.sevisId || "",
      existingUniversityId: defaultValues.existingUniversityId || "",
    }
  });
  
  const selectedAction = form.watch("action");
  const selectedUniversityId = form.watch("existingUniversityId");
  
  useEffect(() => {
    // Fetch universities
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/universities');
        const data = await response.json();
        setUniversities(data || []);
      } catch (error) {
        console.error("Failed to fetch universities", error);
        // Fallback mock data for demo
        setUniversities([
          { id: "1", name: "University of California, Berkeley", country: "United States", sevis_id: "SFR214F12345000" },
          { id: "2", name: "Stanford University", country: "United States", sevis_id: "SFR214F12345001" },
          { id: "3", name: "Harvard University", country: "United States", sevis_id: "SFR214F12345002" },
          { id: "4", name: "Massachusetts Institute of Technology", country: "United States", sevis_id: "SFR214F12345003" },
          { id: "5", name: "Yale University", country: "United States", sevis_id: "SFR214F12345004" },
        ]);
      }
    };
    
    fetchUniversities();
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const filtered = universities.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities(universities);
    }
  }, [searchQuery, universities]);
  
  // If a university is selected, populate name and SEVIS ID for reference
  useEffect(() => {
    if (selectedAction === "join" && selectedUniversityId) {
      const selectedUniversity = universities.find(u => u.id === selectedUniversityId);
      if (selectedUniversity) {
        form.setValue("name", selectedUniversity.name);
        form.setValue("location", selectedUniversity.country);
        form.setValue("sevisId", selectedUniversity.sevis_id);
      }
    }
  }, [selectedUniversityId, selectedAction, universities, form]);
  
  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onSubmit({
      action: data.action,
      name: data.name || "",
      location: data.location || "",
      sevisId: data.sevisId || "",
      existingUniversityId: data.existingUniversityId
    });
    
    if (result) {
      // Form submission successful, handled by parent component
      console.log("University setup complete");
    }
  });
  
  const selectUniversity = (universityId: string) => {
    form.setValue("existingUniversityId", universityId);
    setIsSearchOpen(false);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">University Setup</CardTitle>
        <CardDescription>
          Create a new university profile or join an existing one
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs 
              defaultValue="create" 
              value={selectedAction}
              onValueChange={(value) => form.setValue("action", value as "create" | "join")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Create New</span>
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <Building2 size={16} />
                  <span>Join Existing</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="University of California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Berkeley, CA, United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sevisId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEVIS School Code<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="SFR214F12345000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="join" className="space-y-4">
                <FormField
                  control={form.control}
                  name="existingUniversityId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Find University<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              role="combobox" 
                              className="justify-between w-full"
                            >
                              {field.value ? universities.find(u => u.id === field.value)?.name || "Search universities..." : "Search universities..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Search universities..." 
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                              />
                              <CommandList>
                                <CommandEmpty>No universities found.</CommandEmpty>
                                <CommandGroup>
                                  {filteredUniversities.map((university) => (
                                    <CommandItem
                                      key={university.id}
                                      value={university.id}
                                      onSelect={() => selectUniversity(university.id)}
                                    >
                                      <Building2 className="mr-2 h-4 w-4" />
                                      {university.name}
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({university.country})
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedUniversityId && (
                  <div className="border rounded-md p-4 bg-muted/30 space-y-2">
                    <h3 className="font-medium">Selected University Details</h3>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{form.getValues("name")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{form.getValues("location")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>SEVIS ID: {form.getValues("sevisId")}</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : selectedAction === "create" ? "Create University" : "Request to Join"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UniversityInfoStep;
