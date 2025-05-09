import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Plus, Trash2, Mail } from "lucide-react";

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
import { Database } from "@/integrations/supabase/types";

const teamInviteSchema = z.object({
  invites: z.array(z.object({
    email: z.string().email("Must be a valid email").or(z.string().length(0)),
    role: z.enum(["dso_admin", "dso_viewer"]),
  })),
});

interface TeamInviteStepProps {
  defaultValues: Partial<TeamInviteFormData>;
  onSubmit: (data: TeamInviteFormData) => Promise<boolean>;
  isSubmitting: boolean;
  addInviteField: () => void;
  removeInviteField: (index: number) => void;
  updateInviteField: (index: number, field: keyof TeamMemberInvite, value: any) => void;
}

export const TeamInviteStep = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  addInviteField,
  removeInviteField,
  updateInviteField,
}: TeamInviteStepProps) => {
  const form = useForm<z.infer<typeof teamInviteSchema>>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: {
      invites: defaultValues.invites || [{ email: "", role: "dso_viewer" }],
    }
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onSubmit({
      invites: data.invites as TeamMemberInvite[],
    });
    
    if (result) {
      // Form submission successful, handled by parent component
      console.log("Team invites sent");
    }
  });
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Invite DSO Team Members
        </CardTitle>
        <CardDescription>
          Invite additional team members to join your university's DSO team (optional)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addInviteField}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Person
                </Button>
              </div>
              
              {form.watch("invites").map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`invites.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="colleague@university.edu"
                                  className="pl-8" 
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateInviteField(index, "email", e.target.value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="w-[140px]">
                      <FormField
                        control={form.control}
                        name={`invites.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              Role
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value: Database["public"]["Enums"]["dso_role"]) => {
                                field.onChange(value);
                                updateInviteField(index, "role", value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInviteField(index)}
                    disabled={form.watch("invites").length <= 1}
                    className="h-9 w-9 p-0 mt-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Sending Invites...
                  </>
                ) : "Send Invites & Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeamInviteStep;
