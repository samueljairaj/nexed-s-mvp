
import { ReactNode } from 'react';
import { VisaType } from '@/contexts';

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
