import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Clock, FileText, AlertTriangle, Info, Loader2, BellPlus } from "lucide-react";
import { useAIAssistant, Message } from "@/hooks/useAIAssistant";
import { useAuth } from "@/contexts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Assistant = () => {
  const { currentUser } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { sendMessage, isLoading, lastCreatedReminder, messages, setMessages } = useAIAssistant();
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    try {
      // Send message to AI - filter out messages with roles other than "user" or "assistant"
      const responseMessage = await sendMessage(
        inputValue, 
        messages.filter(m => m.role === "user" || m.role === "assistant")
      );
      
      // Add AI response to messages
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
    }
  };

  // Suggest a question
  const suggestQuestion = (question: string) => {
    setInputValue(question);
  };

  // Filter FAQs by category
  const filteredFAQs = selectedCategory
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  // Sample reminder examples
  const reminderExamples = [
    "Remind me to renew my I-20 in 30 days",
    "Create a task to submit my OPT progress report by April 15",
    "Set a reminder to update my address with USCIS before next week",
    "Remind me to get my travel documents ready 15 days before my flight"
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">AI Immigration Assistant</h1>
        <p className="text-gray-600 text-sm">
          Get answers to your visa and immigration questions
        </p>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <Card className="flex flex-col flex-1 shadow-sm overflow-hidden">
            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${
                      message.role === "user" 
                        ? "ml-3 bg-nexed-100 text-nexed-600 ring-2 ring-nexed-200" 
                        : "mr-3 bg-nexed-600 text-white ring-2 ring-nexed-300"
                    }`}>
                      <span className="text-xs font-medium">
                        {message.role === "user" ? currentUser?.name?.charAt(0) || "U" : "A"}
                      </span>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-xl p-4 ${
                          message.role === "user"
                            ? "bg-nexed-500 text-white"
                            : "bg-white border shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1.5 ${
                        message.role === "user" ? "text-right mr-1" : "ml-1"
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
                    <Avatar className="h-8 w-8 mr-3 bg-nexed-600 text-white ring-2 ring-nexed-300">
                      <span className="text-xs font-medium">A</span>
                    </Avatar>
                    <div className="rounded-xl p-4 bg-white border shadow-sm">
                      <div className="flex space-x-2">
                        <div className="h-2.5 w-2.5 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2.5 w-2.5 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="h-2.5 w-2.5 bg-nexed-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  placeholder="Type your question..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-1 shadow-sm focus-visible:ring-nexed-500"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-br from-nexed-500 to-nexed-700 hover:shadow-md transition-all duration-200"
                >
                  {isLoading ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Send className="h-4 w-4" />
                  }
                </Button>
              </form>
            </div>
          </Card>

          <div className="mt-4">
            <Card className="bg-blue-50 border-blue-200 p-3 flex items-center shadow-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-3 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                This AI assistant provides general guidance only. For official immigration advice, please consult with your university's international student office or a qualified immigration attorney.
              </p>
            </Card>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-64 lg:w-80 shrink-0 hidden lg:flex flex-col gap-4 overflow-auto">
          {/* Reminder Examples Card */}
          <Card className="shadow-sm hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center">
                <BellPlus className="h-4 w-4 mr-2 text-nexed-600" />
                Create Reminders
              </h3>
              <div className="space-y-2">
                {reminderExamples.map((example, index) => (
                  <Button 
                    key={`reminder-${index}`} 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-2.5 px-3 border-nexed-200 hover:bg-nexed-50 hover:border-nexed-300 transition-colors"
                    onClick={() => suggestQuestion(example)}
                  >
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-nexed-600" />
                    <span className="truncate text-xs">{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Questions Card */}
          <Card className="shadow-sm hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-nexed-600" />
                Common Questions
              </h3>
              <div className="flex overflow-x-auto pb-2 mb-2 scrollbar-thin gap-2">
                <Badge 
                  variant={selectedCategory === null ? "default" : "outline"} 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                <Badge 
                  variant={selectedCategory === "F1" ? "default" : "outline"} 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("F1")}
                >
                  F-1 Visa
                </Badge>
                <Badge 
                  variant={selectedCategory === "OPT" ? "default" : "outline"} 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("OPT")}
                >
                  OPT
                </Badge>
                <Badge 
                  variant={selectedCategory === "H1B" ? "default" : "outline"} 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory("H1B")}
                >
                  H1B
                </Badge>
                <Badge 
                  variant={selectedCategory === "Travel" ? "default" : "outline"} 
                  className="cursor-pointer whitespace-nowrap"
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
                    className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-nexed-50 hover:border-nexed-300 transition-colors"
                    onClick={() => suggestQuestion(faq.question)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0 text-nexed-600" />
                    <span className="truncate text-xs">{faq.question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Resources & Tips Card */}
          <Card className="shadow-sm hover:shadow-card-hover transition-shadow duration-300 flex-1 overflow-hidden">
            <Tabs defaultValue="resources" className="w-full h-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>
              <TabsContent value="resources" className="space-y-4 p-4 overflow-auto">
                <h3 className="font-medium text-sm text-nexed-800">Official Links</h3>
                <div className="space-y-2">
                  <a href="https://www.uscis.gov/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center p-2.5 hover:bg-nexed-50 rounded-md border border-transparent hover:border-nexed-200 transition-colors">
                    <FileText className="h-4 w-4 mr-2 text-nexed-600" />
                    <span className="text-nexed-700 text-xs">USCIS Official Website</span>
                  </a>
                  <a href="https://studyinthestates.dhs.gov/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center p-2.5 hover:bg-nexed-50 rounded-md border border-transparent hover:border-nexed-200 transition-colors">
                    <FileText className="h-4 w-4 mr-2 text-nexed-600" />
                    <span className="text-nexed-700 text-xs">Study in the States (DHS)</span>
                  </a>
                  <a href="https://www.ice.gov/sevis" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center p-2.5 hover:bg-nexed-50 rounded-md border border-transparent hover:border-nexed-200 transition-colors">
                    <FileText className="h-4 w-4 mr-2 text-nexed-600" />
                    <span className="text-nexed-700 text-xs">SEVIS Information</span>
                  </a>
                </div>
              </TabsContent>
              <TabsContent value="tips" className="p-4 overflow-auto">
                <div className="space-y-4">
                  <div className="flex items-start bg-nexed-50 p-3 rounded-lg">
                    <Clock className="h-4 w-4 mt-1 mr-2 text-nexed-600" />
                    <p className="text-xs">Always file applications well before deadlines to avoid status issues</p>
                  </div>
                  <div className="flex items-start bg-amber-50 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 mt-1 mr-2 text-amber-500" />
                    <p className="text-xs">Keep digital and physical copies of all your immigration documents</p>
                  </div>
                  <div className="flex items-start bg-nexed-50 p-3 rounded-lg">
                    <Info className="h-4 w-4 mt-1 mr-2 text-nexed-600" />
                    <p className="text-xs">Always consult with your DSO before making decisions that might affect your visa status</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mock FAQ data
const faqs: {
  id: string;
  question: string;
  answer: string;
  category: string;
}[] = [
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
