
import { Brain, User } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Brain className="h-5 w-5" />
        </div>
      )}
      
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${isUser 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted/70'}`}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'OMOP Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs opacity-70">{formattedTime}</span>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert">
          {content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'h-3' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
