
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isProcessing: boolean;
  placeholder?: string;
}

export function QueryInput({ onSubmit, isProcessing, placeholder = "Ask a question about the OMOP data..." }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  // Function to handle speech recognition (with fallback notification)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
        toast.info('Listening for your query...');
      };
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setQuery(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Failed to start speech recognition');
      setIsRecording(false);
      setIsListening(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    onSubmit(query.trim());
    setQuery('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative glass-card p-2 sm:p-3 transition-all duration-300 ease-in-out"
    >
      <div className="flex items-end">
        <Textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="resize-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 bg-transparent min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isProcessing}
        />
        <div className="flex items-center space-x-2 pl-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleSpeechRecognition}
            disabled={isProcessing}
            className={`rounded-full transition-all ${isRecording ? 'bg-primary/10 text-primary animate-pulse-subtle' : ''}`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            type="submit"
            size="icon"
            disabled={!query.trim() || isProcessing}
            className="rounded-full"
          >
            {isProcessing ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
