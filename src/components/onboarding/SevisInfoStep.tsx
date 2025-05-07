
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { sevisInfoSchema } from "@/types/onboarding";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface SevisInfoStepProps {
  defaultValues: {
    sevisId: string;
    i20IssueDate: Date | null;
    i20ExpirationDate: Date | null;
    previousSevisIds: string[];
  };
  onSubmit: (data: any) => void;
  visaType: string;
}

export function SevisInfoStep({ defaultValues, onSubmit, visaType }: SevisInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(sevisInfoSchema),
    defaultValues,
  });

  // Add a previous SEVIS ID field
  const addPreviousSevisId = () => {
    const currentIds = form.getValues("previousSevisIds") || [];
    form.setValue("previousSevisIds", [...currentIds, ""]);
  };
  
  // Remove a previous SEVIS ID field
  const removePreviousSevisId = (index: number) => {
    const currentIds = form.getValues("previousSevisIds") || [];
    form.setValue("previousSevisIds", currentIds.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sevisId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEVIS ID</FormLabel>
              <FormControl>
                <Input placeholder="N00XXXXXXXX" {...field} />
              </FormControl>
              <FormDescription>
                Format: N00 followed by 8 digits
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="i20IssueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {visaType === "F-1" ? "I-20 Issue Date" : "DS-2019 Issue Date"}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="i20ExpirationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {visaType === "F-1" ? "I-20 Expiration Date" : "DS-2019 Expiration Date"}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
                {field.value && new Date(field.value) < new Date(new Date().setDate(new Date().getDate() + 60)) && (
                  <div className="mt-2 p-2 bg-amber-50 text-amber-800 text-sm rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Your {visaType === "F-1" ? "I-20" : "DS-2019"} expires within 60 days. Contact your DSO soon!
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Previous SEVIS IDs (if any)</FormLabel>
          <div className="space-y-2 mt-2">
            {form.watch("previousSevisIds")?.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  placeholder="N00XXXXXXXX"
                  value={form.watch(`previousSevisIds.${index}`)}
                  onChange={(e) => {
                    const newIds = [...form.getValues("previousSevisIds")];
                    newIds[index] = e.target.value;
                    form.setValue("previousSevisIds", newIds);
                  }}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removePreviousSevisId(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addPreviousSevisId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Previous SEVIS ID
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
