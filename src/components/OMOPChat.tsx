
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Loader } from 'lucide-react';
import { useCredentials } from '@/hooks/use-credentials';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/components/ChatMessage';
import { sendOMOPChatMessage } from '@/utils/azureOpenAIClient';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isError?: boolean;
}

export function OMOPChat() {
  const { credentials } = useCredentials();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if Azure credentials are available
  const hasCredentials = () => {
    return !!(
      credentials.azure.apiKey &&
      credentials.azure.endpoint &&
      credentials.azure.deploymentName
    );
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isProcessing) return;
    
    if (!hasCredentials()) {
      toast({
        title: "API Credentials Required",
        description: "Please configure your Azure OpenAI credentials in the Settings page",
        variant: "destructive"
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Send message to Azure OpenAI
      const response = await sendOMOPChatMessage(credentials.azure, inputMessage.trim());
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Failed to communicate with OMOP assistant'}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Communication Error",
        description: "Failed to get a response from the OMOP assistant. Please check your connection and API credentials.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          OMOP Assistant Chat
        </CardTitle>
        <CardDescription>
          Ask questions about OMOP CDM structure, medical concepts, and healthcare data modeling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-1">No messages yet</p>
              <p className="text-sm">Ask a question about OMOP or medical data modeling</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  isError={message.isError}
                />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about OMOP CDM structure, medical concepts, or data modeling..."
            className="resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputMessage.trim() || isProcessing}
            className="h-10 w-10"
          >
            {isProcessing ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        {!hasCredentials() && (
          <p className="text-destructive text-xs mt-2">
            Please configure your Azure OpenAI credentials in the Settings page to use the OMOP assistant.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
