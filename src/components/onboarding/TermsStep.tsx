
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { termsSchema } from "@/types/onboarding";
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

interface TermsStepProps {
  defaultValues: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    dataUsage: boolean;
    legalDisclaimer: boolean;
  };
  onSubmit: (data: any) => void;
}

export function TermsStep({ defaultValues, onSubmit }: TermsStepProps) {
  const form = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="termsOfService"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the Terms of Service
                </FormLabel>
                <FormDescription>
                  By checking this box, you agree to our <a href="#" className="text-nexed-600 underline">Terms of Service</a>
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="privacyPolicy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the Privacy Policy
                </FormLabel>
                <FormDescription>
                  By checking this box, you agree to our <a href="#" className="text-nexed-600 underline">Privacy Policy</a>
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dataUsage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I allow my anonymized data to be used to improve services
                </FormLabel>
                <FormDescription>
                  This is optional. We use anonymized data to improve our recommendations.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="legalDisclaimer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I acknowledge this platform does not provide legal advice
                </FormLabel>
                <FormDescription>
                  neXed helps manage documentation and compliance but is not a substitute for professional legal advice.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
