
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Clock, FileText, AlertTriangle, Info } from "lucide-react";

// Message interface
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// FAQ interface
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Pre-defined welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "👋 Hello! I'm your immigration assistant. How can I help you with your visa-related questions today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simulate assistant response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  // Generate mock AI response
  const generateResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let response = "";
    
    // Simple pattern matching for responses
    if (lowerQuery.includes("sevis")) {
      response = "SEVIS (Student and Exchange Visitor Information System) is the web-based system used to maintain information on international students and exchange visitors in the United States. Your DSO (Designated School Official) must register your information in SEVIS each semester to maintain your status. It's important to keep your information updated, especially your address, which must be updated within 10 days of any change.";
    } else if (lowerQuery.includes("opt")) {
      if (lowerQuery.includes("apply") || lowerQuery.includes("application")) {
        response = "To apply for OPT (Optional Practical Training):\n\n1. Request a recommendation from your DSO (they'll update your SEVIS record)\n2. Receive a new I-20 with OPT recommendation\n3. File Form I-765 with USCIS within 30 days\n4. Include required documents (photos, I-94, previous EADs, etc.)\n5. Pay the filing fee\n6. Wait for approval (2-3 months typically)\n\nYou can apply up to 90 days before your program end date and up to 60 days after.";
      } else if (lowerQuery.includes("stem") || lowerQuery.includes("extension")) {
        response = "The STEM OPT extension allows F-1 students with STEM degrees to extend their OPT period by an additional 24 months. To be eligible, you must have a degree in a STEM field and be working for an employer enrolled in E-Verify. You should apply for the extension before your current OPT period expires.";
      } else {
        response = "Optional Practical Training (OPT) is temporary employment authorization directly related to an F-1 student's major area of study. Standard OPT can last up to 12 months, while STEM OPT can extend it by an additional 24 months for qualifying students. You must maintain status during OPT by reporting employment changes to your DSO and not exceeding 90 days of unemployment.";
      }
    } else if (lowerQuery.includes("i-20") && (lowerQuery.includes("renew") || lowerQuery.includes("extension"))) {
      response = "You should renew your I-20 if:\n\n- You need more time to complete your program\n- Your funding information has changed\n- You're changing programs or degree levels\n\nContact your school's international student office at least 30 days before your I-20 expires. You'll need to provide financial documentation showing you can support yourself during the extension period.";
    } else if (lowerQuery.includes("h1b")) {
      response = "The H-1B is a work visa that allows U.S. employers to temporarily employ foreign workers in specialty occupations. The visa is initially valid for three years and can be extended for another three years. The application process is typically handled by employers and includes filing an LCA (Labor Condition Application) and Form I-129. There is an annual cap on H-1B visas, and they are often allocated via lottery.";
    } else if (lowerQuery.includes("travel") || lowerQuery.includes("leaving")) {
      response = "When traveling outside the US as an international student, make sure to:\n\n1. Have a valid passport (at least 6 months beyond your return date)\n2. Carry your valid F-1 visa (unless you're going only to Canada, Mexico, or adjacent islands for less than 30 days)\n3. Bring your current I-20 signed for travel by your DSO within the last year\n4. Carry proof of enrollment and financial documentation\n\nIf your visa is expired, you'll need to renew it at a US embassy or consulate before returning.";
    } else if (lowerQuery.includes("grace period")) {
      response = "F-1 students have a 60-day grace period after program completion or OPT end date. During this time, you can:\n\n- Prepare to depart the US\n- Transfer to another school\n- Change your education level (e.g., from Bachelor's to Master's)\n- Apply for a change of status\n\nYou cannot work during the grace period unless authorized under a new status. If you violate your status or are terminated from SEVIS, you may not be eligible for the full grace period.";
    } else if (lowerQuery.includes("address") && lowerQuery.includes("change")) {
      response = "When you change your address, you must report it within 10 days to maintain your legal status. For F-1 students, report the change to your DSO, who will update your information in SEVIS. H-1B visa holders should file Form AR-11 with USCIS within 10 days of moving.";
    } else if (lowerQuery.includes("document") && lowerQuery.includes("require")) {
      response = "Essential documents for international students include:\n\n- Passport (valid for at least 6 months into the future)\n- F-1 or J-1 visa\n- I-20 or DS-2019 form\n- I-94 record\n- Proof of enrollment (transcripts, enrollment verification)\n- Financial documents\n- Health insurance information\n\nFor OPT/employment: EAD card, job offer letter, and employment verification.\n\nKeep digital and physical copies of all these documents in a secure place.";
    } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      response = "Hello! I'm your immigration assistant. How can I help you with visa-related questions today? Feel free to ask about SEVIS, OPT, I-20 renewal, or any other visa compliance topics.";
    } else {
      response = "I understand you're asking about \"" + query + "\". While I don't have specific information on this exact query, I'd be happy to help with questions about:\n\n- F-1 student visa requirements\n- OPT application and maintenance\n- SEVIS registration\n- I-20 renewal process\n- Document requirements\n- Travel advisories\n- H-1B visa information\n\nCould you rephrase your question or ask about one of these topics?";
    }
    
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Suggest a question
  const suggestQuestion = (question: string) => {
    setInputValue(question);
  };

  // Filter FAQs by category
  const filteredFAQs = selectedCategory
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI Immigration Assistant</h1>
        <p className="text-gray-600 mt-2">
          Get answers to your visa and immigration questions
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <Card className="nexed-card lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex flex-col h-[600px]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className={`h-8 w-8 ${
                          message.role === "user" 
                            ? "ml-2 bg-nexed-100" 
                            : "mr-2 bg-nexed-600 text-white"
                        }`}>
                          {message.role === "user" ? "U" : "A"}
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-nexed-100 text-nexed-900"
                                : "bg-white border shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-line">{message.content}</p>
                          </div>
                          <div className={`text-xs text-gray-500 mt-1 ${
                            message.role === "user" ? "text-right" : ""
                          }`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex">
                        <Avatar className="h-8 w-8 mr-2 bg-nexed-600 text-white">
                          A
                        </Avatar>
                        <div className="rounded-lg p-4 bg-white border shadow-sm">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="h-2 w-2 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            <div className="h-2 w-2 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    placeholder="Type your question..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputValue.trim() || isLoading}
                    className="nexed-gradient"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-6">
          <Card className="nexed-card">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-nexed-600" />
                Common Questions
              </h2>

              <div className="flex overflow-x-auto pb-2 mb-2 scrollbar-thin">
                <Badge 
                  variant={selectedCategory === null ? "default" : "outline"} 
                  className="mr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                <Badge 
                  variant={selectedCategory === "F1" ? "default" : "outline"} 
                  className="mr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("F1")}
                >
                  F-1 Visa
                </Badge>
                <Badge 
                  variant={selectedCategory === "OPT" ? "default" : "outline"} 
                  className="mr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("OPT")}
                >
                  OPT
                </Badge>
                <Badge 
                  variant={selectedCategory === "H1B" ? "default" : "outline"} 
                  className="mr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("H1B")}
                >
                  H1B
                </Badge>
                <Badge 
                  variant={selectedCategory === "Travel" ? "default" : "outline"} 
                  className="mr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("Travel")}
                >
                  Travel
                </Badge>
              </div>

              <div className="space-y-2">
                {filteredFAQs.slice(0, 5).map(faq => (
                  <Button 
                    key={faq.id} 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => suggestQuestion(faq.question)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{faq.question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="nexed-card">
            <CardContent className="pt-6">
              <Tabs defaultValue="resources">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="resources" className="space-y-4 pt-4">
                  <h3 className="font-medium text-lg">Official Links</h3>
                  <div className="space-y-2">
                    <a href="https://www.uscis.gov/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-blue-600">USCIS Official Website</span>
                    </a>
                    <a href="https://studyinthestates.dhs.gov/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-blue-600">Study in the States (DHS)</span>
                    </a>
                    <a href="https://www.ice.gov/sevis" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-blue-600">SEVIS Information</span>
                    </a>
                  </div>
                </TabsContent>
                <TabsContent value="tips" className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mt-1 mr-2 text-nexed-600" />
                      <p className="text-sm">Always file applications well before deadlines to avoid status issues</p>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mt-1 mr-2 text-amber-500" />
                      <p className="text-sm">Keep digital and physical copies of all your immigration documents</p>
                    </div>
                    <div className="flex items-start">
                      <Info className="h-4 w-4 mt-1 mr-2 text-nexed-600" />
                      <p className="text-sm">Always consult with your DSO before making decisions that might affect your visa status</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              This AI assistant provides general guidance only. For official immigration advice, please consult with your university's international student office or a qualified immigration attorney.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock FAQ data
const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "What is a SEVIS report?",
    answer: "",
    category: "F1"
  },
  {
    id: "faq-2",
    question: "How do I apply for OPT?",
    answer: "",
    category: "OPT"
  },
  {
    id: "faq-3",
    question: "When should I renew my I-20?",
    answer: "",
    category: "F1"
  },
  {
    id: "faq-4",
    question: "Can I travel while on OPT?",
    answer: "",
    category: "Travel"
  },
  {
    id: "faq-5",
    question: "How long is the grace period after graduation?",
    answer: "",
    category: "F1"
  },
  {
    id: "faq-6",
    question: "What documents do I need for H1B application?",
    answer: "",
    category: "H1B"
  },
  {
    id: "faq-7",
    question: "How do I maintain status during OPT?",
    answer: "",
    category: "OPT"
  },
  {
    id: "faq-8",
    question: "What happens if my visa expires while I'm in the US?",
    answer: "",
    category: "Travel"
  }
];

export default Assistant;
