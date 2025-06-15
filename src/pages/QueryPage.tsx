import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { QueryInput } from '@/components/QueryInput';
import { QueryResult } from '@/components/QueryResult';
import { ExampleQueries } from '@/components/ExampleQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCredentials } from '@/hooks/use-credentials';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, AlertTriangle, Database, Loader, Trash2 } from 'lucide-react';
import { convertNaturalLanguageToSQL } from '@/utils/nlToSqlConverter';
import { Button } from '@/components/ui/button';
import { executeOMOPQuery } from '@/services/omopApiService';

export default function QueryPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [processingQuery, setProcessingQuery] = useState(false);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const { credentials } = useCredentials();

  // Check if we have a pre-filled query from navigation
  useEffect(() => {
    if (location.state?.initialQuery) {
      setQuery(location.state.initialQuery);
    }
  }, [location.state]);

  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing saved query history:', e);
        // If there's an error parsing, start with an empty history
      }
    }
  }, []);

  // Save query history to localStorage whenever it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  const checkCredentials = () => {
    const provider = credentials.selectedProvider;
    
    switch (provider) {
      case 'azure':
        if (!credentials.azure.apiKey || !credentials.azure.endpoint || !credentials.azure.deploymentName) {
          toast({
            title: "Missing Azure OpenAI Configuration",
            description: "Please configure your Azure OpenAI API credentials in Settings",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'anthropic':
        if (!credentials.anthropic.apiKey) {
          toast({
            title: "Missing Anthropic Configuration",
            description: "Please configure your Anthropic API credentials in Settings",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'google':
        if (!credentials.google.apiKey) {
          toast({
            title: "Missing Google AI Configuration",
            description: "Please configure your Google AI API credentials in Settings",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'deepseek':
        if (!credentials.deepseek.apiKey) {
          toast({
            title: "Missing Deepseek Configuration",
            description: "Please configure your Deepseek API credentials in Settings",
            variant: "destructive"
          });
          return false;
        }
        break;
      default:
        toast({
          title: "Invalid AI Provider",
          description: "Please select a valid AI provider in Settings",
          variant: "destructive"
        });
        return false;
    }
    
    // Check if Databricks credentials are available
    const usingDatabricks = credentials.databricks.host && credentials.databricks.token;
    if (!usingDatabricks) {
      // If not using Databricks, check for local database configuration
      const dbConfig = localStorage.getItem('databaseConfig');
      if (!dbConfig) {
        toast({
          title: "Missing Database Configuration",
          description: "Please configure either Databricks or a local database in Settings",
          variant: "default"
        });
        // We don't return false here because we'll fall back to mock data
      }
    }
    
    return true;
  };

  const handleQuerySubmit = async (queryText: string) => {
    if (!checkCredentials()) return;
    setProcessingQuery(true);
    try {
      // Convert natural language to SQL using the AI provider (handled by backend)
      const response = await executeOMOPQuery({ naturalLanguage: queryText });
      if (!response.success) {
        toast({
          title: "Error processing query",
          description: response.error || "Failed to process query",
          variant: "destructive"
        });
        setProcessingQuery(false);
        return;
      }
      // Use the returned data and metadata
      const metrics = {
        rows: response.data?.length || 0,
        columns: response.data && response.data.length > 0 ? Object.keys(response.data[0]) : [],
        execution_time_ms: response.execution_time_ms || 0,
        database_type: credentials.databricks.host && credentials.databricks.token ? 'Databricks' : 'DuckDB',
        ai_provider: credentials.selectedProvider,
        cached: response.metadata?.cached || false
      };
      const queryResult = {
        id: Date.now().toString(),
        query: queryText,
        sql: response.sql || "",
        data: response.data || [],
        metrics,
        timestamp: new Date().toISOString(),
        aiResponse: response.explanation || ""
      };
      setQueryHistory(prev => [queryResult, ...prev]);
      toast({
        title: "Query processed successfully",
        description: `Found ${metrics.rows} results using ${credentials.selectedProvider.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error processing query",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingQuery(false);
    }
  };

  const handleDeleteQuery = (id: string) => {
    setQueryHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Query deleted",
      description: "The query has been removed from your history",
    });
  };

  const handleExampleSelect = (example: string) => {
    setQuery(example);
    handleQuerySubmit(example);
  };

  const clearAllQueries = () => {
    setQueryHistory([]);
    localStorage.removeItem('queryHistory');
    toast({
      title: "History cleared",
      description: "All queries have been removed from your history",
    });
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Query Builder</h1>
        <p className="text-muted-foreground">
          Ask questions about your OMOP data in plain English
        </p>
      </div>

      {!checkCredentialsForAlert() && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            You need to configure your AI provider credentials in the Settings page 
            before you can use the Query Assistant.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Natural Language Query using {getProviderName()}
              </CardTitle>
              <CardDescription>
                Ask questions about patient demographics, conditions, medications, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QueryInput 
                onSubmit={handleQuerySubmit} 
                isProcessing={processingQuery}
                placeholder="e.g. How many patients have type 2 diabetes and hypertension?"
              />
            </CardContent>
          </Card>

          {queryHistory.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium">Query Results</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllQueries}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <ScrollArea className="h-full max-h-[800px]">
                {queryHistory.map((item) => (
                  <QueryResult
                    key={item.id}
                    id={item.id}
                    sql={item.sql}
                    data={item.data}
                    metrics={item.metrics}
                    timestamp={item.timestamp}
                    aiResponse={item.aiResponse}
                    onDelete={handleDeleteQuery}
                  />
                ))}
              </ScrollArea>
            </div>
          )}
        </div>

        <div>
          <Tabs defaultValue="examples">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="info">Database Info</TabsTrigger>
            </TabsList>
            <TabsContent value="examples" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Example Queries</CardTitle>
                  <CardDescription>
                    Try one of these example queries to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-4 pb-4">
                    <ul className="space-y-2 text-sm">
                      <li>
                        <button
                          onClick={() => handleExampleSelect("How many patients are in the database by gender?")}
                          className="text-left w-full p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          How many patients are in the database by gender?
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleExampleSelect("What is the age distribution of patients?")}
                          className="text-left w-full p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          What is the age distribution of patients?
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleExampleSelect("What are the top 10 most common diagnoses?")}
                          className="text-left w-full p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          What are the top 10 most common diagnoses?
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleExampleSelect("How many patients have type 2 diabetes mellitus?")}
                          className="text-left w-full p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          How many patients have type 2 diabetes mellitus?
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleExampleSelect("Show medications prescribed after heart surgery")}
                          className="text-left w-full p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          Show medications prescribed after heart surgery
                        </button>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Database className="mr-2 h-5 w-5 text-primary" />
                    OMOP Database Schema
                  </CardTitle>
                  <CardDescription>
                    Key tables available in this OMOP database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 text-sm">
                    <div className="font-medium">Using: {getDatabaseTypeName()}</div>
                    {credentials.databricks.host && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Connected to Databricks at {credentials.databricks.host}
                        {credentials.databricks.catalog && ` (Catalog: ${credentials.databricks.catalog})`}
                      </div>
                    )}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <div className="font-medium">person</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Demographics of patients including gender, birth date, race and ethnicity
                      </div>
                    </li>
                    <li>
                      <div className="font-medium">condition_occurrence</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Records of diagnoses or conditions
                      </div>
                    </li>
                    <li>
                      <div className="font-medium">drug_exposure</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Records of drugs prescribed, administered or dispensed
                      </div>
                    </li>
                    <li>
                      <div className="font-medium">procedure_occurrence</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Records of procedures or interventions performed
                      </div>
                    </li>
                    <li>
                      <div className="font-medium">measurement</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Records of clinical or laboratory measurements
                      </div>
                    </li>
                    <li>
                      <div className="font-medium">visit_occurrence</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Records of encounters with healthcare providers or facilities
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
  
  function checkCredentialsForAlert() {
    const provider = credentials.selectedProvider;
    
    switch (provider) {
      case 'azure':
        return !!(credentials.azure.apiKey && credentials.azure.endpoint && credentials.azure.deploymentName);
      case 'anthropic':
        return !!credentials.anthropic.apiKey;
      case 'google':
        return !!credentials.google.apiKey;
      case 'deepseek':
        return !!credentials.deepseek.apiKey;
      default:
        return false;
    }
  }
  
  function getProviderName() {
    const provider = credentials.selectedProvider;
    
    switch (provider) {
      case 'azure':
        return 'Azure OpenAI';
      case 'anthropic':
        return 'Anthropic Claude';
      case 'google':
        return 'Google AI';
      case 'deepseek':
        return 'Deepseek';
      default:
        return 'Unknown Provider';
    }
  }
  
  function getDatabaseTypeName() {
    return (credentials.databricks.host && credentials.databricks.token) 
      ? 'Databricks SQL' 
      : 'Local DuckDB';
  }
}
