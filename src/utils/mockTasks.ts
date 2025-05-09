import { DocumentCategory } from "@/types/document";
import { Task } from "@/hooks/useComplianceTasks";

// Generate mock tasks based on visa type
export const generateMockTasks = (visaType: string): Task[] => {
  const commonTasks: Task[] = [
    {
      id: "task-1",
      title: "Update Local Address in SEVIS",
      description: "You must update your address in SEVIS within 10 days of moving to a new location.",
      dueDate: "2025-05-20",
      deadline: new Date("2025-05-20"),
      category: "immigration",
      completed: false,
      priority: "high"
    },
    {
      id: "task-2",
      title: "Health Insurance Renewal",
      description: "Renew your health insurance policy before it expires to maintain coverage.",
      dueDate: "2025-06-15",
      deadline: new Date("2025-06-15"),
      category: "personal",
      completed: false,
      priority: "medium"
    },
    {
      id: "task-3",
      title: "Passport Validity Check",
      description: "Ensure your passport is valid for at least 6 months beyond your expected stay.",
      dueDate: "2025-08-30",
      deadline: new Date("2025-08-30"),
      category: "immigration",
      completed: true,
      priority: "medium"
    },
    {
      id: "task-4",
      title: "Update Emergency Contact Information",
      description: "Keep your emergency contact information up to date with your school.",
      dueDate: "2025-09-05",
      deadline: new Date("2025-09-05"),
      category: "personal",
      completed: true,
      priority: "low"
    }
  ];

  // Visa-specific tasks
  let specificTasks: Task[] = [];

  if (visaType === "F1") {
    specificTasks = [
      {
        id: "task-f1-1",
        title: "Enroll in Full Course Load",
        description: "Maintain full-time enrollment (min. 12 credits for undergrad, 9 credits for graduate).",
        dueDate: "2025-05-25",
        deadline: new Date("2025-05-25"),
        category: "academic",
        completed: false,
        priority: "high",
        phase: "F1"
      },
      {
        id: "task-f1-2",
        title: "SEVIS Registration for Fall",
        description: "Your DSO must register you in SEVIS each semester.",
        dueDate: "2025-09-15",
        deadline: new Date("2025-09-15"),
        category: "immigration",
        completed: false,
        priority: "high",
        phase: "F1"
      },
      {
        id: "task-f1-3",
        title: "F-1 Visa Renewal Deadline",
        description: "Your F-1 visa stamp is expiring soon. Submit your renewal application at least 45 days before expiration.",
        dueDate: "2025-04-05",
        deadline: new Date("2025-04-05"),
        category: "immigration",
        completed: false,
        priority: "medium",
        phase: "F1"
      },
      {
        id: "task-f1-4",
        title: "Verify On-Campus Employment Hours",
        description: "Ensure you're not working more than 20 hours per week during the semester.",
        dueDate: "Recurring",
        deadline: new Date("2025-01-01"),
        category: "employment",
        completed: true,
        priority: "medium",
        phase: "F1"
      },
      {
        id: "task-f1-5",
        title: "OPT Application Window Opens",
        description: "You can apply for Optional Practical Training (OPT) up to 90 days before your program end date.",
        dueDate: "2025-05-15",
        deadline: new Date("2025-05-15"),
        category: "employment",
        completed: false,
        priority: "medium",
        phase: "F1"
      },
      {
        id: "task-f1-6",
        title: "I-20 Extension Approved",
        description: "Your I-20 extension has been approved and is valid until December 15, 2025.",
        dueDate: "2025-02-28",
        deadline: new Date("2025-02-28"),
        category: "immigration",
        completed: true,
        priority: "high",
        phase: "F1"
      }
    ];
  } else if (visaType === "OPT") {
    specificTasks = [
      {
        id: "task-opt-1",
        title: "Submit Employment Updates",
        description: "Report any changes to employment within 10 days to your DSO.",
        dueDate: "2025-06-10",
        deadline: new Date("2025-06-10"),
        category: "employment",
        completed: false,
        priority: "high",
        phase: "OPT"
      },
      {
        id: "task-opt-2",
        title: "Track Unemployment Days",
        description: "Monitor your unemployment days (max 90 days permitted during OPT).",
        dueDate: "Ongoing",
        deadline: new Date("2025-01-01"),
        category: "employment",
        completed: false,
        priority: "high",
        phase: "OPT"
      },
      {
        id: "task-opt-3",
        title: "Submit 6-Month OPT Progress Report",
        description: "File a report on your OPT employment and activities.",
        dueDate: "2025-07-15",
        deadline: new Date("2025-07-15"),
        category: "employment",
        completed: false,
        priority: "medium",
        phase: "OPT"
      },
      {
        id: "task-opt-4",
        title: "Consider STEM OPT Extension",
        description: "Apply for STEM OPT extension 90 days before your current OPT expires (if eligible).",
        dueDate: "2025-11-01",
        deadline: new Date("2025-11-01"),
        category: "immigration",
        completed: false,
        priority: "medium",
        phase: "OPT"
      }
    ];
  } else if (visaType === "H1B") {
    specificTasks = [
      {
        id: "task-h1b-1",
        title: "Verify Employer Records H-1B Compliance",
        description: "Ensure your employer maintains proper Public Access Files for your H-1B.",
        dueDate: "2025-05-30",
        deadline: new Date("2025-05-30"),
        category: "employment",
        completed: false,
        priority: "medium",
        phase: "H1B"
      },
      {
        id: "task-h1b-2",
        title: "Update Address with USCIS",
        description: "File Form AR-11 within 10 days if you change your residence address.",
        dueDate: "Within 10 days of moving",
        deadline: new Date("2025-01-01"),
        category: "immigration",
        completed: false,
        priority: "high",
        phase: "H1B"
      },
      {
        id: "task-h1b-3",
        title: "Confirm H-1B Expiration Date",
        description: "Review your H-1B expiration date and prepare for renewal 6 months in advance.",
        dueDate: "2025-06-15",
        deadline: new Date("2025-06-15"),
        category: "immigration",
        completed: true,
        priority: "medium",
        phase: "H1B"
      },
      {
        id: "task-h1b-4",
        title: "Consult Attorney Before Travel",
        description: "Speak with an immigration attorney prior to international travel.",
        dueDate: "Before any travel",
        deadline: new Date("2025-01-01"),
        category: "immigration",
        completed: false,
        priority: "medium",
        phase: "H1B"
      }
    ];
  }

  return [...commonTasks, ...specificTasks];
};
