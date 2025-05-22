import { Task } from "@/hooks/useComplianceTasks";
import { DocumentCategory } from "@/types/document";

// Define a type for our baseline checklist items
export interface BaselineChecklistItem {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  priority: "low" | "medium" | "high";
  phase: string;
  isRecurring?: boolean;
  recurringInterval?: string;
}

// Baseline checklists organized by visa type and phase
export const baselineChecklists: Record<string, BaselineChecklistItem[]> = {
  "F1": [
    {
      id: "f1-passport",
      title: "Valid Passport",
      description: "Passport must be valid for at least 6 months beyond your intended period of stay",
      category: "immigration",
      priority: "high",
      phase: "F1"
    },
    {
      id: "f1-visa",
      title: "F-1 Visa",
      description: "Valid F-1 visa stamp in passport",
      category: "immigration",
      priority: "high",
      phase: "F1"
    },
    {
      id: "f1-i94",
      title: "I-94 Arrival Record",
      description: "Most recent electronic I-94 record showing F-1 status",
      category: "immigration",
      priority: "high",
      phase: "F1"
    },
    {
      id: "f1-i20",
      title: "Current I-20",
      description: "Form I-20 with valid travel signature (signed within last 12 months)",
      category: "immigration",
      priority: "high",
      phase: "F1",
      isRecurring: true,
      recurringInterval: "yearly"
    },
    {
      id: "f1-sevis-receipt",
      title: "SEVIS Fee Receipt",
      description: "Proof of payment for SEVIS I-901 fee",
      category: "immigration",
      priority: "medium",
      phase: "F1"
    },
    {
      id: "f1-admission-letter",
      title: "University Admission Letter",
      description: "Official admission letter from your educational institution",
      category: "education",
      priority: "medium",
      phase: "F1"
    }
  ],
  "OPT": [
    {
      id: "opt-i20",
      title: "OPT I-20",
      description: "Form I-20 with OPT recommendation from DSO",
      category: "immigration",
      priority: "high",
      phase: "OPT"
    },
    {
      id: "opt-ead",
      title: "OPT EAD Card",
      description: "Employment Authorization Document for OPT",
      category: "employment",
      priority: "high",
      phase: "OPT"
    },
    {
      id: "opt-employer-letter",
      title: "Employer Letter",
      description: "Letter from employer confirming employment related to field of study",
      category: "employment",
      priority: "high",
      phase: "OPT"
    },
    {
      id: "opt-sevp-portal",
      title: "SEVP Portal Registration",
      description: "Confirmation of SEVP Portal account setup",
      category: "immigration",
      priority: "medium",
      phase: "OPT"
    }
  ],
  "STEM OPT": [
    {
      id: "stem-i20",
      title: "STEM OPT I-20",
      description: "Form I-20 with STEM OPT recommendation from DSO",
      category: "immigration",
      priority: "high",
      phase: "STEM OPT"
    },
    {
      id: "stem-i983",
      title: "Form I-983 Training Plan",
      description: "Completed and signed Form I-983 training plan",
      category: "employment",
      priority: "high",
      phase: "STEM OPT"
    },
    {
      id: "stem-ead",
      title: "STEM OPT EAD Card",
      description: "Employment Authorization Document for STEM OPT extension",
      category: "employment",
      priority: "high",
      phase: "STEM OPT"
    },
    {
      id: "stem-employer-letter",
      title: "Employer Letter",
      description: "Letter from E-Verify employer confirming employment related to STEM field",
      category: "employment",
      priority: "high",
      phase: "STEM OPT"
    },
    {
      id: "stem-eval-12",
      title: "12-Month Self-Evaluation",
      description: "Mandatory 12-month self-evaluation for STEM OPT",
      category: "employment",
      priority: "medium",
      phase: "STEM OPT",
      isRecurring: true,
      recurringInterval: "yearly"
    },
    {
      id: "stem-eval-24",
      title: "24-Month Final Evaluation",
      description: "Final evaluation at the conclusion of STEM OPT period",
      category: "employment",
      priority: "medium",
      phase: "STEM OPT"
    }
  ],
  "J1": [
    {
      id: "j1-ds2019",
      title: "Form DS-2019",
      description: "Certificate of Eligibility for Exchange Visitor (J-1) Status",
      category: "immigration",
      priority: "high",
      phase: "J1"
    },
    {
      id: "j1-sponsor-letter",
      title: "Sponsor Letter",
      description: "Official letter from your J-1 sponsor organization",
      category: "immigration",
      priority: "medium",
      phase: "J1"
    },
    {
      id: "j1-funding",
      title: "Proof of Funding",
      description: "Documentation showing sufficient financial resources",
      category: "financial",
      priority: "high",
      phase: "J1"
    },
    {
      id: "j1-insurance",
      title: "Health Insurance",
      description: "Proof of health insurance meeting J-1 requirements",
      category: "personal",
      priority: "high",
      phase: "J1",
      isRecurring: true,
      recurringInterval: "yearly"
    }
  ],
  "H1B": [
    {
      id: "h1b-i797",
      title: "Form I-797 Approval Notice",
      description: "H-1B petition approval notice from USCIS",
      category: "immigration",
      priority: "high",
      phase: "H1B"
    },
    {
      id: "h1b-i94",
      title: "H-1B I-94",
      description: "Most recent I-94 showing H-1B status",
      category: "immigration",
      priority: "high",
      phase: "H1B"
    },
    {
      id: "h1b-employer-letter",
      title: "Employer Support Letter",
      description: "Letter from employer confirming current H-1B employment",
      category: "employment",
      priority: "high",
      phase: "H1B"
    },
    {
      id: "h1b-resume",
      title: "Updated Resume/CV",
      description: "Current resume showing qualifications for specialty occupation",
      category: "employment",
      priority: "medium",
      phase: "H1B"
    }
  ]
};

// Helper function to get baseline checklist by visa type and optionally phase
export function getBaselineChecklist(visaType: string | null | undefined, phase?: string): BaselineChecklistItem[] {
  if (!visaType) return [];
  
  // Normalize visa type
  const normalizedVisaType = visaType.toUpperCase();
  let result: BaselineChecklistItem[] = [];
  
  // Handle different F1 phases
  if (normalizedVisaType === "F1") {
    // Add base F1 documents
    result = [...baselineChecklists["F1"]];
    
    // Add phase-specific documents if applicable
    if (phase) {
      const normalizedPhase = phase.toUpperCase();
      
      if (normalizedPhase === "OPT" && baselineChecklists["OPT"]) {
        result = [...result, ...baselineChecklists["OPT"]];
      } else if (normalizedPhase === "STEM OPT" && baselineChecklists["STEM OPT"]) {
        result = [...result, ...baselineChecklists["OPT"], ...baselineChecklists["STEM OPT"]];
      }
    }
  } 
  // For other visa types, just return their specific checklist
  else if (baselineChecklists[normalizedVisaType]) {
    result = [...baselineChecklists[normalizedVisaType]];
  }
  
  return result;
}

// Function to convert baseline items to Task format
export function baselineItemsToAITasks(items: BaselineChecklistItem[]): Task[] {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    dueDate: calculateDueDate(item.priority, item.isRecurring),
    deadline: new Date(calculateDueDate(item.priority, item.isRecurring)),
    category: item.category,
    completed: false,
    priority: item.priority,
    phase: item.phase,
    isRecurring: item.isRecurring || false,
    recurringInterval: item.recurringInterval,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

// Helper function to calculate a due date based on priority and recurring status
function calculateDueDate(priority: "low" | "medium" | "high", isRecurring?: boolean): string {
  const today = new Date();
  let daysToAdd = 0;
  
  if (isRecurring) {
    // For recurring tasks, set due date to 30 days from now
    daysToAdd = 30;
  } else {
    switch (priority) {
      case "high":
        daysToAdd = 7;
        break;
      case "medium":
        daysToAdd = 30;
        break;
      case "low":
        daysToAdd = 90;
        break;
    }
  }
  
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  
  return dueDate.toISOString().split('T')[0];
}