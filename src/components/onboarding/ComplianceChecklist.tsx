
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileCheck, Upload, User, Briefcase, GraduationCap, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComplianceChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
}

export function ComplianceChecklist({ open, onOpenChange, userData }: ComplianceChecklistProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all-documents");
  
  // Mock data based on user profile
  const studentInfo = {
    university: userData.university || "Stanford University",
    program: userData.fieldOfStudy || "Master of Science in Computer Science",
    optStartDate: "March 15, 2025",
    optEndDate: "March 14, 2026",
    recentUSEntry: "February 5, 2025",
    i20EndDate: "December 15, 2024",
    visaExpiration: "June 15, 2025",
    employer: userData.employer || "Tech Company Inc.",
  };

  // Mock document categories
  const documents = {
    immigration: [
      {
        id: "i20",
        title: "Form I-20 (with OPT endorsement)",
        description: "Your current I-20 should have OPT endorsement from your DSO. Ensure the dates match your approved OPT period.",
        required: true,
        uploaded: false
      },
      {
        id: "ead",
        title: "EAD Card (Form I-766)",
        description: `Your Employment Authorization Document showing validity from ${studentInfo.optStartDate} to ${studentInfo.optEndDate}.`,
        required: true,
        uploaded: false
      },
      {
        id: "visa",
        title: "F-1 Visa",
        description: `Your visa stamp showing expiration on ${studentInfo.visaExpiration}. Note: You can remain in the US with an expired visa, but will need renewal for re-entry.`,
        required: true,
        uploaded: false
      },
      {
        id: "i94",
        title: "Most Recent I-94 Record",
        description: `Confirming entry on ${studentInfo.recentUSEntry} with correct visa type (student or F-1) as admission period.`,
        required: true,
        uploaded: false
      },
      {
        id: "optreceipt",
        title: "OPT Application Receipt (I-797C)",
        description: "USCIS receipt notice for your Form I-765 OPT application.",
        required: false,
        uploaded: false
      }
    ],
    employment: [
      {
        id: "offer-letter",
        title: `Job Offer Letter from ${studentInfo.employer}`,
        description: "Official job offer letter showing position, start date, and confirmation that the role relates to your Computer Science degree.",
        required: true,
        uploaded: false
      },
      {
        id: "verification",
        title: "Employment Verification Letter",
        description: "Letter from your employer confirming your current employment and that the work is related to your field of study.",
        required: false,
        uploaded: false
      },
      {
        id: "paystubs",
        title: "Recent Pay Stubs",
        description: "Evidence of ongoing employment which may be requested during any status verification.",
        required: false,
        uploaded: false
      }
    ],
    educational: [
      {
        id: "diploma",
        title: "Diploma/Degree Certificate",
        description: "Copy of your most recent degree certificate from your academic institution.",
        required: true,
        uploaded: false
      },
      {
        id: "transcript",
        title: "Academic Transcript",
        description: "Official transcript showing completion of your academic program.",
        required: false,
        uploaded: false
      }
    ],
    personal: [
      {
        id: "passport",
        title: "Valid Passport",
        description: "Ensuring it remains valid for at least 6 months beyond your intended period of stay.",
        required: true,
        uploaded: false
      },
      {
        id: "insurance",
        title: "Health Insurance Documentation",
        description: "Proof of active health insurance coverage while in the United States.",
        required: false,
        uploaded: false
      }
    ]
  };

  // Count documents
  const totalDocuments = [
    ...documents.immigration,
    ...documents.employment,
    ...documents.educational,
    ...documents.personal
  ].length;
  
  const requiredDocuments = [
    ...documents.immigration,
    ...documents.employment,
    ...documents.educational,
    ...documents.personal
  ].filter(doc => doc.required).length;

  // Insights based on user data
  const insights = [
    `Submit your SEVIS address update by ${new Date(new Date(studentInfo.optStartDate).getTime() + 10*24*60*60*1000).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} (within 10 days of your OPT start date)`,
    `Request an employment verification letter that specifically mentions how your role at ${studentInfo.employer} relates to your ${studentInfo.program} degree`,
    `Start visa renewal planning by ${new Date(new Date(studentInfo.visaExpiration).getTime() - 60*24*60*60*1000).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} (2 months before expiration) if you intend to travel internationally`,
    `Consider that you'll be eligible for 24-month STEM OPT extension after your initial OPT period`,
    `Based on your I-94 entry date of ${studentInfo.recentUSEntry}, you must maintain continuous employment with no more than 90 cumulative days of unemployment`
  ];

  const renderDocumentList = (category: keyof typeof documents) => {
    return documents[category].map((doc) => (
      <div key={doc.id} className="border rounded-lg p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox id={doc.id} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <label htmlFor={doc.id} className="font-medium text-gray-900 block mb-1">
                {doc.title}
              </label>
              <span className={`text-xs px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {doc.required ? 'Required' : 'Recommended'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
            <Button variant="default" size="sm" className="gap-1">
              <Upload size={16} />
              Upload
            </Button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Your Personalized Document Checklist</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          {/* AI Analysis Banner */}
          <div className="bg-blue-50 p-4 rounded-md flex items-center mb-4">
            <div className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-blue-700 font-medium">
                neXed AI has analyzed your F-1 OPT status and created a tailored compliance plan based on your specific details.
              </p>
              <div className="flex items-center text-blue-600 text-sm mt-1">
                <div className="flex space-x-1 mr-2">
                  {[1, 2, 3].map(dot => (
                    <div key={dot} className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  ))}
                </div>
                <span>Updating in real-time</span>
              </div>
            </div>
          </div>

          {/* Student Info Section */}
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">F-1 Student on OPT (Post-Completion)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600">University</p>
                <p className="font-medium">{studentInfo.university}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Program</p>
                <p className="font-medium">{studentInfo.program}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">OPT Start Date</p>
                <p className="font-medium">{studentInfo.optStartDate}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">OPT End Date</p>
                <p className="font-medium">{studentInfo.optEndDate}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Most Recent US Entry</p>
                <p className="font-medium">{studentInfo.recentUSEntry}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">I-20 Program End Date</p>
                <p className="font-medium">{studentInfo.i20EndDate}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Visa Expiration</p>
                <p className="font-medium">{studentInfo.visaExpiration}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Employer</p>
                <p className="font-medium">{studentInfo.employer}</p>
              </div>
            </div>
          </div>

          {/* Time-Sensitive Alert */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4 flex">
            <AlertTriangle className="text-amber-500 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-amber-800">Time-Sensitive Requirements:</p>
              <p className="text-amber-700">
                Your visa expires in 90 days ({studentInfo.visaExpiration}) which falls during your OPT period. 
                You should plan to either renew your visa if traveling internationally or prepare for status 
                adjustment if applicable.
              </p>
            </div>
          </div>

          {/* Document Tabs */}
          <Tabs defaultValue="all-documents" className="w-full" value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all-documents">All Documents</TabsTrigger>
              <TabsTrigger value="immigration">Immigration</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="educational">Educational</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-documents" className="space-y-4">
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <FileCheck className="mr-2 text-blue-600" size={20} />
                  Immigration Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.immigration.length} documents
                  </span>
                </h3>
                {renderDocumentList('immigration')}
              </div>
              
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <Briefcase className="mr-2 text-blue-600" size={20} />
                  Employment Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.employment.length} documents
                  </span>
                </h3>
                {renderDocumentList('employment')}
              </div>
              
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <GraduationCap className="mr-2 text-blue-600" size={20} />
                  Educational Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.educational.length} documents
                  </span>
                </h3>
                {renderDocumentList('educational')}
              </div>
              
              <div>
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <User className="mr-2 text-blue-600" size={20} />
                  Personal Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.personal.length} documents
                  </span>
                </h3>
                {renderDocumentList('personal')}
              </div>
            </TabsContent>
            
            <TabsContent value="immigration">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <FileCheck className="mr-2 text-blue-600" size={20} />
                Immigration Documents
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {documents.immigration.length} documents
                </span>
              </h3>
              {renderDocumentList('immigration')}
            </TabsContent>
            
            <TabsContent value="employment">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <Briefcase className="mr-2 text-blue-600" size={20} />
                Employment Documents
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {documents.employment.length} documents
                </span>
              </h3>
              {renderDocumentList('employment')}
            </TabsContent>
            
            <TabsContent value="educational">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <GraduationCap className="mr-2 text-blue-600" size={20} />
                Educational Documents
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {documents.educational.length} documents
                </span>
              </h3>
              {renderDocumentList('educational')}
            </TabsContent>
            
            <TabsContent value="personal">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <User className="mr-2 text-blue-600" size={20} />
                Personal Documents
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {documents.personal.length} documents
                </span>
              </h3>
              {renderDocumentList('personal')}
            </TabsContent>
          </Tabs>

          {/* Personalized Insights */}
          <div className="bg-green-50 p-4 rounded-md mt-6">
            <h3 className="flex items-center text-lg font-medium text-green-800 mb-3">
              <Info className="mr-2 text-green-600" size={20} />
              Personalized Insights for Your Situation
            </h3>
            <p className="mb-3 text-green-700">
              Based on your specific profile ({studentInfo.university} Computer Science graduate with OPT starting {studentInfo.optStartDate}, and visa expiring during OPT period), we recommend:
            </p>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-green-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">0 of {totalDocuments}</span> documents uploaded
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Do This Later
            </Button>
            <Button onClick={() => {
              onOpenChange(false);
              navigate("/app/dashboard");
            }}>
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
