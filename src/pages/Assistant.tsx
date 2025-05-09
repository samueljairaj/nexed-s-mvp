
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfileProperty } from "@/utils/propertyMapping";

const Assistant = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generalPrompt = "Provide concise and accurate information.";
    const initialPrompt = `You are a helpful assistant specialized in international student immigration compliance. ${currentUser ? `The user has a ${getProfileProperty(currentUser, 'visa_type')} visa. ` : ''}${generalPrompt}`;
    setPrompt(initialPrompt);
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.response.content);
    } catch (error) {
      console.error("Error fetching assistant response:", error);
      setResponse("An error occurred while fetching the response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Immigration Compliance Assistant</h1>
      <p className="text-muted-foreground mb-4">
        Ask questions about immigration compliance, visa requirements, and more.
      </p>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Question</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            value={prompt}
            onChange={handleInputChange}
            placeholder="Enter your question here..."
            className="w-full mb-4"
          />
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Loading..." : "Get Answer"}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Answer</h2>
        </CardHeader>
        <CardContent>
          <p>{response}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assistant;
