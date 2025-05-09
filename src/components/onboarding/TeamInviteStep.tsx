
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersRound, Plus, Trash2, Mail } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamInviteFormData, TeamMemberInvite } from "@/hooks/onboarding/useDsoTeamInvite";

// Define schema for team member invitation
const teamMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["dso_admin", "dso_viewer"]),
});

// Define schema for the form
const teamInviteSchema = z.object({
  invites: z.array(teamMemberSchema),
});

interface TeamInviteStepProps {
  defaultValues: TeamInviteFormData;
  onSubmit: (data: TeamInviteFormData) => Promise<boolean>;
  isSubmitting: boolean;
  addInviteField: () => void;
  removeInviteField: (index: number) => void;
  updateInviteField: (index: number, field: string, value: string) => void;
}

export const TeamInviteStep = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  addInviteField,
  removeInviteField,
  updateInviteField,
}: TeamInviteStepProps) => {
  // We use form to validate, but invites are managed by the parent component
  const form = useForm<z.infer<typeof teamInviteSchema>>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: {
      invites: defaultValues.invites,
    },
    mode: "onBlur",
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onSubmit(data);
    
    if (result) {
      // Form submission successful, handled by parent component
      console.log("Team invites configured");
    }
  });
  
  // Add invite field wrapper to ensure validation state updates
  const handleAddInvite = () => {
    addInviteField();
    // Update form validation state with new empty field
    const currentInvites = form.getValues("invites") || [];
    form.setValue("invites", [
      ...currentInvites,
      { email: "", role: "dso_viewer" }
    ]);
  };
  
  // Remove invite field wrapper
  const handleRemoveInvite = (index: number) => {
    removeInviteField(index);
    // Update form validation state
    const currentInvites = form.getValues("invites");
    form.setValue(
      "invites",
      currentInvites.filter((_, i) => i !== index)
    );
  };
  
  // Update invite field wrapper
  const handleFieldChange = (index: number, field: string, value: string) => {
    updateInviteField(index, field, value);
    // Also update form state
    form.setValue(`invites.${index}.${field}`, value as any);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          Invite DSO Team Members
        </CardTitle>
        <CardDescription>
          Invite additional staff members to your DSO team
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <p className="text-sm text-muted-foreground">
                    Administrators can manage all settings, while viewers have read-only access
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddInvite}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              <div className="space-y-4">
                {form.watch("invites")?.map((invite, index) => (
                  <div key={index} className="border rounded-md p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`invites.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="colleague@university.edu" 
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => handleFieldChange(index, "email", e.target.value)}
                                />
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="w-full sm:w-40">
                      <FormField
                        control={form.control}
                        name={`invites.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => handleFieldChange(index, "role", value as "dso_admin" | "dso_viewer")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dso_admin">Admin</SelectItem>
                                <SelectItem value="dso_viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInvite(index)}
                      disabled={form.watch("invites").length <= 1}
                      className="h-10 w-10 shrink-0 text-destructive mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                You can skip this step and invite team members later if needed.
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : "Save & Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeamInviteStep;
