
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AIResponseProps {
  response: string;
  provider: string;
}

export function AIResponse({ response, provider }: AIResponseProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success('AI response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy response');
    }
  };

  return (
    <Card className="mt-4 animate-slide-in">
      <CardHeader className="pb-3 bg-card border-b border-border">
        <CardTitle className="flex items-center text-lg">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Explanation
          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {provider}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show More
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        
        <div className={`prose prose-sm max-w-none dark:prose-invert ${isExpanded ? '' : 'max-h-[150px] overflow-hidden relative'}`}>
          <div dangerouslySetInnerHTML={{ __html: response }} />
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
