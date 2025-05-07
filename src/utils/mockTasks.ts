
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: "immigration" | "academic" | "employment" | "personal";
  completed: boolean;
  priority: "low" | "medium" | "high";
}

// Generate mock tasks based on visa type
export const generateMockTasks = (visaType: string): Task[] => {
  const commonTasks: Task[] = [
    {
      id: "task-1",
      title: "Update Local Address in SEVIS",
      description: "You must update your address in SEVIS within 10 days of moving to a new location.",
      dueDate: "May 20, 2025",
      category: "immigration",
      completed: false,
      priority: "high"
    },
    {
      id: "task-2",
      title: "Health Insurance Renewal",
      description: "Renew your health insurance policy before it expires to maintain coverage.",
      dueDate: "June 15, 2025",
      category: "personal",
      completed: false,
      priority: "medium"
    },
    {
      id: "task-3",
      title: "Passport Validity Check",
      description: "Ensure your passport is valid for at least 6 months beyond your expected stay.",
      dueDate: "August 30, 2025",
      category: "immigration",
      completed: true,
      priority: "medium"
    },
    {
      id: "task-4",
      title: "Update Emergency Contact Information",
      description: "Keep your emergency contact information up to date with your school.",
      dueDate: "September 5, 2025",
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
        dueDate: "May 25, 2025",
        category: "academic",
        completed: false,
        priority: "high"
      },
      {
        id: "task-f1-2",
        title: "SEVIS Registration for Fall",
        description: "Your DSO must register you in SEVIS each semester.",
        dueDate: "September 15, 2025",
        category: "immigration",
        completed: false,
        priority: "high"
      },
      {
        id: "task-f1-3",
        title: "F-1 Visa Renewal Deadline",
        description: "Your F-1 visa stamp is expiring soon. Submit your renewal application at least 45 days before expiration.",
        dueDate: "April 5, 2025",
        category: "immigration",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-f1-4",
        title: "Verify On-Campus Employment Hours",
        description: "Ensure you're not working more than 20 hours per week during the semester.",
        dueDate: "Recurring",
        category: "employment",
        completed: true,
        priority: "medium"
      },
      {
        id: "task-f1-5",
        title: "OPT Application Window Opens",
        description: "You can apply for Optional Practical Training (OPT) up to 90 days before your program end date.",
        dueDate: "May 15, 2025",
        category: "employment",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-f1-6",
        title: "I-20 Extension Approved",
        description: "Your I-20 extension has been approved and is valid until December 15, 2025.",
        dueDate: "February 28, 2025",
        category: "immigration",
        completed: true,
        priority: "high"
      }
    ];
  } else if (visaType === "OPT") {
    specificTasks = [
      {
        id: "task-opt-1",
        title: "Submit Employment Updates",
        description: "Report any changes to employment within 10 days to your DSO.",
        dueDate: "Within 10 days of change",
        category: "employment",
        completed: false,
        priority: "high"
      },
      {
        id: "task-opt-2",
        title: "Track Unemployment Days",
        description: "Monitor your unemployment days (max 90 days permitted during OPT).",
        dueDate: "Ongoing",
        category: "employment",
        completed: false,
        priority: "high"
      },
      {
        id: "task-opt-3",
        title: "Submit 6-Month OPT Progress Report",
        description: "File a report on your OPT employment and activities.",
        dueDate: "July 15, 2025",
        category: "employment",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-opt-4",
        title: "Consider STEM OPT Extension",
        description: "Apply for STEM OPT extension 90 days before your current OPT expires (if eligible).",
        dueDate: "November 1, 2025",
        category: "immigration",
        completed: false,
        priority: "medium"
      }
    ];
  } else if (visaType === "H1B") {
    specificTasks = [
      {
        id: "task-h1b-1",
        title: "Verify Employer Records H-1B Compliance",
        description: "Ensure your employer maintains proper Public Access Files for your H-1B.",
        dueDate: "May 30, 2025",
        category: "employment",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-h1b-2",
        title: "Update Address with USCIS",
        description: "File Form AR-11 within 10 days if you change your residence address.",
        dueDate: "Within 10 days of moving",
        category: "immigration",
        completed: false,
        priority: "high"
      },
      {
        id: "task-h1b-3",
        title: "Confirm H-1B Expiration Date",
        description: "Review your H-1B expiration date and prepare for renewal 6 months in advance.",
        dueDate: "June 15, 2025",
        category: "immigration",
        completed: true,
        priority: "medium"
      },
      {
        id: "task-h1b-4",
        title: "Consult Attorney Before Travel",
        description: "Speak with an immigration attorney prior to international travel.",
        dueDate: "Before any travel",
        category: "immigration",
        completed: false,
        priority: "medium"
      }
    ];
  }

  return [...commonTasks, ...specificTasks];
};
