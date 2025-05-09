
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Clock, FileText, AlertTriangle, Info, Loader2, BellPlus } from "lucide-react";
import { useAIAssistant, Message } from "@/hooks/useAIAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Assistant = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { sendMessage, isLoading, lastCreatedReminder } = useAIAssistant();
  
  // Pre-defined welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `👋 Hello${currentUser?.name ? ` ${currentUser.name}` : ''}! I'm your immigration assistant. How can I help you with your ${currentUser?.visaType || "visa"}-related questions today?\n\nYou can also ask me to create reminders for important tasks by saying something like "remind me to renew my I-20 in 30 days" or "create a task to submit my OPT progress report by April 15".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentUser]);

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
      setMessages(prev => [...prev, {
        ...responseMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
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
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-6">
          {/* New Reminder Examples Card */}
          <Card className="nexed-card bg-nexed-50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <BellPlus className="h-5 w-5 mr-2 text-nexed-600" />
                Create Reminders
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Try asking me to create reminders for your important tasks:
              </p>
              <div className="space-y-2">
                {reminderExamples.map((example, index) => (
                  <Button 
                    key={`reminder-${index}`} 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-2 px-3 border-nexed-200"
                    onClick={() => suggestQuestion(example)}
                  >
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-nexed-600" />
                    <span className="truncate">{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

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
