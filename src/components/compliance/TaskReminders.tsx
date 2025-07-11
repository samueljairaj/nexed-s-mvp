
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell, Calendar, AlertTriangle, Check, FileText } from "lucide-react";
import { Task } from "@/hooks/useComplianceTasks";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { dateUtils } from "@/lib/date-utils";
import { useDocumentVault } from "@/hooks/useDocumentVault";
import { Document } from "@/types/document";

interface TaskRemindersProps {
  tasks: Task[];
  toggleTaskStatus: (id: string) => void;
  onAddCustomReminder: (title: string, date: string, priority: "low" | "medium" | "high") => void;
}

export function TaskReminders({ tasks, toggleTaskStatus, onAddCustomReminder }: TaskRemindersProps) {
  // Get documents from document vault
  const { documents } = useDocumentVault();
  const [expiringDocuments, setExpiringDocuments] = useState<Document[]>([]);
  
  // Filter documents with expiry dates that are either expired or expiring soon
  useEffect(() => {
    const docsWithExpiryIssues = documents.filter(doc => 
      doc.status === "expired" || doc.status === "expiring"
    );
    setExpiringDocuments(docsWithExpiryIssues);
  }, [documents]);
  
  // Combine tasks and document expiry reminders into unified reminders list
  const combinedReminders = [
    // Convert tasks to reminder format
    ...tasks
      .filter(task => !task.completed)
      .map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        type: 'task' as const,
        task
      })),
    
    // Convert expiring documents to reminder format
    ...expiringDocuments.map(doc => ({
      id: doc.id,
      title: `${doc.name} ${doc.status === "expired" ? "(Expired)" : "(Expiring soon)"}`,
      dueDate: doc.expiryDate || "",
      priority: doc.status === "expired" ? "high" as const : "medium" as const,
      type: 'document' as const,
      document: doc
    }))
  ];
  
  // Sort combined reminders by due date and priority
  const sortedReminders = combinedReminders
    .sort((a, b) => {
      // First compare by due date
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      
      // Then by priority (high > medium > low)
      const priorityValue = { high: 3, medium: 2, low: 1 };
      return priorityValue[b.priority] - priorityValue[a.priority];
    })
    .slice(0, 5); // Get top 5 reminders

  // State for custom reminder dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderPriority, setReminderPriority] = useState<"low" | "medium" | "high">("medium");

  // Handle creating a new custom reminder
  const handleCreateReminder = () => {
    if (reminderTitle.trim() && reminderDate) {
      onAddCustomReminder(reminderTitle, reminderDate, reminderPriority);
      setReminderTitle("");
      setReminderDate("");
      setReminderPriority("medium");
      setIsDialogOpen(false);
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="default">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  return (
    <Card className="nexed-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bell className="mr-2 h-5 w-5 text-nexed-600" />
          Important Reminders
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Reminder</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Reminder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="Reminder title"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Due Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={reminderPriority}
                  onChange={(e) => setReminderPriority(e.target.value as "low" | "medium" | "high")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReminder}>
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedReminders.length > 0 ? (
          <ul className="space-y-3">
            {sortedReminders.map((reminder) => (
              <li key={reminder.id} className="flex items-start group">
                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-200 mr-3">
                  {reminder.type === 'document' ? (
                    <FileText size={16} className={reminder.priority === "high" ? "text-red-500" : "text-nexed-600"} />
                  ) : reminder.priority === "high" ? (
                    <AlertTriangle size={16} className="text-red-500" />
                  ) : (
                    <Calendar size={16} className="text-nexed-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                    <div className="mt-1 sm:mt-0">
                      {getPriorityBadge(reminder.priority)}
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-600">
                      {reminder.type === 'document' ? 'Expires' : 'Due'}: {dateUtils.formatShort(new Date(reminder.dueDate))}
                    </p>
                    {reminder.type === 'task' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100" 
                        onClick={() => toggleTaskStatus(reminder.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Complete
                      </Button>
                    )}
                    {reminder.type === 'document' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => window.location.href = "/app/documents"}
                      >
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No pending reminders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
