
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { ExampleQueries } from '@/components/ExampleQueries';
import { QueryInput } from '@/components/QueryInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Brain, Search, Database, Settings, History, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCredentials } from '@/hooks/use-credentials';
import { OMOPChat } from '@/components/OMOPChat';

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credentials } = useCredentials();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle example query selection
  const handleSelectExample = (query: string) => {
    // Navigate to query page with the selected example
    navigate('/query', { state: { initialQuery: query } });
  };

  return (
    <Layout>
      <section className="py-10 text-center">
        <div className="mb-6 inline-block p-2 bg-primary/10 rounded-full text-primary animate-float">
          <Brain size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          OMOP Query Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Ask questions about your OMOP data in plain English and get instant results
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/query')}
          className="animate-glow shadow-lg"
        >
          <Search className="mr-2 h-5 w-5" />
          Start SQL Querying
        </Button>
      </section>

      {/* OMOP Chat Interface */}
      <section className="py-6 mb-12">
        <div className="w-full max-w-4xl mx-auto animate-slide-in">
          <OMOPChat />
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Natural Language Queries</CardTitle>
              <CardDescription>
                Ask questions in plain English without writing SQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Translate complex medical data questions into accurate SQL queries automatically
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/query')}
              >
                Try it out
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Database className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">OMOP CDM Compatible</CardTitle>
              <CardDescription>
                Designed specifically for OMOP Common Data Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Understands OMOP tables, relationships, and vocabulary concepts
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/database')}
              >
                View database schema
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <History className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Query History</CardTitle>
              <CardDescription>
                Save and revisit your previous queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All your queries are saved locally for easy reference and reuse
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/history')}
              >
                View history
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Settings className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Secure Configuration</CardTitle>
              <CardDescription>
                Safely manage your API keys and database settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your credentials are stored securely in your browser's local storage
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/settings')}
              >
                Configure settings
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-2 text-center">Example Queries</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get started with these example queries or create your own
        </p>
        
        <ExampleQueries onSelectExample={handleSelectExample} />
      </section>
    </Layout>
  );
}
