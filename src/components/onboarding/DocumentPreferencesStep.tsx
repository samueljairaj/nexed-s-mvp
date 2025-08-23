
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Bell } from "lucide-react";
import { preferencesSchema } from "@/types/onboarding";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentPreferencesStepProps {
  defaultValues: {
    documentChecklist: string[];
    notificationPreferences: string[];
    communicationFrequency: string;
  };
  documentChecklist: string[];
  onSubmit: (data: { documentChecklist: string[]; notificationPreferences: string[]; communicationFrequency: string }) => void;
}

export function DocumentPreferencesStep({ 
  defaultValues, 
  documentChecklist, 
  onSubmit 
}: DocumentPreferencesStepProps) {
  const form = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      ...defaultValues,
      documentChecklist: documentChecklist
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="documentChecklist"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Required Documents</FormLabel>
                <FormDescription>
                  Based on your visa type and status, you will need to upload the following documents.
                  Check each to acknowledge:
                </FormDescription>
              </div>
              <div className="space-y-2">
                {documentChecklist.map((document) => (
                  <FormField
                    key={document}
                    control={form.control}
                    name="documentChecklist"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={document}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(document)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, document])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== document
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {document}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notificationPreferences"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Notification Preferences</FormLabel>
                <FormDescription>
                  Select how you'd like to be notified about important deadlines and updates:
                </FormDescription>
              </div>
              <div className="space-y-2">
                {[
                  {id: "Email", label: "Email", icon: <Mail className="h-4 w-4 mr-2" />},
                  {id: "SMS", label: "SMS (Coming soon)", icon: <MessageSquare className="h-4 w-4 mr-2" />},
                  {id: "In-app", label: "In-app", icon: <Bell className="h-4 w-4 mr-2" />},
                ].map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="notificationPreferences"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    )
                              }}
                              disabled={item.id === "SMS"} // SMS not yet available
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            {item.icon}
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="communicationFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Frequency</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Only for urgent matters">Only for urgent matters</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("communicationFrequency") === "Only for urgent matters" && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Urgent matters include:</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2">
              <li>Document expiration within 30 days</li>
              <li>Missed compliance deadlines</li>
              <li>Status violations requiring immediate attention</li>
              <li>Important regulatory changes affecting your visa status</li>
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
}
