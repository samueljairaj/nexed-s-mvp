
// Since we cannot access this file directly, we'll create a type definition for it
// The actual implementation would need to accept the 'loading' prop

// Create a type definition file if it doesn't exist
<lov-write file_path="src/types/compliance.d.ts">
import { ReactNode } from 'react';
import { VisaType } from '@/contexts/AuthContext';

export interface ComplianceChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name: string;
    visaType: VisaType;
    university: string;
    fieldOfStudy: string;
    employer: string;
    email: string;
    country: string;
    courseStartDate: string | Date | null;
    usEntryDate: string | Date | null;
    employmentStartDate: string | Date | null;
    employmentStatus: string;
    optType: string;
    graduationDate: string | Date | null;
  };
  onContinue: () => Promise<void>;
  loading: boolean; // Ensure this prop is included
  sections: Array<{
    title: string;
    items: Array<{
      label: string;
      value: any;
      complete: boolean;
    }>;
  }>;
}
