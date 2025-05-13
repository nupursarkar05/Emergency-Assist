
"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { analyzeEmergencyRisk, type AnalyzeEmergencyRiskOutput } from "@/ai/flows/analyze-emergency-risk";
import { translateEmergencyAdvice, type TranslateEmergencyAdviceOutput } from "@/ai/flows/translate-emergency-advice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, BotMessageSquare, Languages, Loader2, ShieldAlert, Lightbulb, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "zh", label: "中文 (Chinese)" },
];

const emergencyFormSchema = z.object({
  emergencyDescription: z.string().min(10, { message: "Please describe the emergency in at least 10 characters." }),
  language: z.string().optional(),
});

type EmergencyFormValues = z.infer<typeof emergencyFormSchema>;

interface ChatMessage {
  type: "user" | "ai" | "error";
  content: string | AnalyzeEmergencyRiskOutput;
  language?: string;
}

const AIChatbotPage: NextPage = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      emergencyDescription: "",
      language: "en",
    },
  });

  const onSubmit: SubmitHandler<EmergencyFormValues> = async (data) => {
    setIsLoading(true);
    setChatHistory(prev => [...prev, { type: "user", content: data.emergencyDescription, language: data.language }]);

    try {
      const analysisResult = await analyzeEmergencyRisk({
        emergencyDescription: data.emergencyDescription,
        language: data.language || "en",
      });

      if (data.language && data.language !== "en") {
        // For simplicity, we are translating the main fields. 
        // A more robust solution might translate the entire structured response or have the AI generate in the target language directly if supported.
        const translatedSolutionsPromises = analysisResult.suggestedSolutions.map(solution => 
          translateEmergencyAdvice({ advice: solution, language: data.language! })
        );
        const translatedSolutionsResults = await Promise.all(translatedSolutionsPromises);
        
        const translatedReason = await translateEmergencyAdvice({ advice: analysisResult.reason, language: data.language!});

        const translatedResult: AnalyzeEmergencyRiskOutput = {
          ...analysisResult,
          suggestedSolutions: translatedSolutionsResults.map(r => r.translatedAdvice),
          reason: translatedReason.translatedAdvice,
        };
        setChatHistory(prev => [...prev, { type: "ai", content: translatedResult, language: data.language }]);
      } else {
        setChatHistory(prev => [...prev, { type: "ai", content: analysisResult, language: data.language }]);
      }

    } catch (error) {
      console.error("Error analyzing emergency:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatHistory(prev => [...prev, { type: "error", content: `Failed to get analysis: ${errorMessage}` }]);
      toast({
        title: "Error",
        description: "Could not get emergency analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      form.reset({emergencyDescription: '', language: data.language}); // Clear only description
    }
  };
  
  // Effect to scroll to the bottom of chat history when new messages are added
  useEffect(() => {
    const scrollArea = document.getElementById('chat-scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [chatHistory]);


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] max-w-3xl mx-auto">
      <Card className="flex-grow flex flex-col shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center space-x-3">
            <BotMessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">AI Emergency Assistant</CardTitle>
              <CardDescription>Describe the medical emergency below. I'll analyze the risk and suggest solutions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea id="chat-scroll-area" className="flex-grow p-6 space-y-6 bg-background">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <HelpCircle className="h-16 w-16 mb-4" />
              <p className="text-lg">How can I help you today?</p>
              <p>Describe the situation, and I'll provide guidance.</p>
            </div>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'user' && typeof msg.content === 'string' && (
                <Card className="bg-primary text-primary-foreground max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow">
                  <p>{msg.content}</p>
                </Card>
              )}
              {msg.type === 'ai' && typeof msg.content === 'object' && (
                <Card className="bg-card border-primary border-2 max-w-xs md:max-w-md lg:max-w-lg p-0 rounded-xl shadow-lg">
                  <CardHeader className="bg-primary/10 p-4">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg text-primary">Risk Assessment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <p className="font-semibold text-lg">
                      Risk Level: <span className={`font-bold ${
                        msg.content.riskLevel.toLowerCase() === 'high' ? 'text-destructive' :
                        msg.content.riskLevel.toLowerCase() === 'medium' ? 'text-accent' :
                        'text-green-600'
                      }`}>{msg.content.riskLevel}</span>
                    </p>
                    <div>
                      <h4 className="font-semibold text-md mb-1 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-accent" />Suggested Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {msg.content.suggestedSolutions.map((solution, i) => (
                          <li key={i}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                     <div>
                      <h4 className="font-semibold text-md mb-1">Reasoning:</h4>
                      <p className="text-sm text-muted-foreground">{msg.content.reason}</p>
                    </div>
                    {msg.language && msg.language !== "en" && (
                        <p className="text-xs text-muted-foreground italic mt-2">Translated to {languages.find(l => l.value === msg.language)?.label || msg.language}.</p>
                    )}
                  </CardContent>
                </Card>
              )}
              {msg.type === 'error' && typeof msg.content === 'string' && (
                 <Alert variant="destructive" className="max-w-xs md:max-w-md lg:max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{msg.content}</AlertDescription>
                  </Alert>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing...</p>
              </Card>
            </div>
          )}
        </ScrollArea>

        <CardFooter className="p-4 border-t bg-muted/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 w-full items-start">
              <div className="flex-grow space-y-2">
                <FormField
                  control={form.control}
                  name="emergencyDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="E.g., 'Someone is choking and can't breathe' or 'Heavy bleeding from a leg wound'"
                          className="min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-primary"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-auto">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full sm:w-[180px] focus:ring-1 focus:ring-primary">
                             <Languages className="h-4 w-4 mr-2 opacity-70" />
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-auto py-3 mt-[6px] self-start">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send"}
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChatbotPage;
