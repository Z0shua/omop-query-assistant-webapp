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
import { Brain, AlertTriangle, Database, Loader } from 'lucide-react';
import { convertNaturalLanguageToSQL } from '@/utils/nlToSqlConverter';

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
      // Check which database to use
      const usingDatabricks = credentials.databricks.host && credentials.databricks.token;
      
      // Convert natural language to SQL using the AI provider
      const nlToSqlResult = await convertNaturalLanguageToSQL(queryText, credentials);
      
      if (!nlToSqlResult.success) {
        toast({
          title: "Error generating SQL",
          description: nlToSqlResult.error || "Failed to convert natural language to SQL",
          variant: "destructive"
        });
        setProcessingQuery(false);
        return;
      }
      
      // Use the generated SQL to query the database
      // For demonstration, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate database query time
      const mockData = generateMockData(queryText);
      
      const mockMetrics = {
        rows: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
        execution_time_ms: Math.random() * 1000 + 200,
        database_type: usingDatabricks ? 'Databricks' : 'DuckDB',
        ai_provider: nlToSqlResult.provider || getProviderName(),
        cached: false
      };
      
      // Add to history
      const queryResult = {
        id: Date.now().toString(),
        query: queryText,
        sql: nlToSqlResult.sql || "",
        data: mockData,
        metrics: mockMetrics,
        timestamp: new Date().toISOString(),
        aiResponse: nlToSqlResult.explanation || ""
      };
      
      setQueryHistory(prev => [queryResult, ...prev]);
      toast({
        title: "Query processed successfully",
        description: `Found ${mockData.length} results using ${credentials.selectedProvider.toUpperCase()}.`,
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

  const handleExampleSelect = (example: string) => {
    setQuery(example);
    handleQuerySubmit(example);
  };

  const generateMockData = (query: string): any[] => {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('gender')) {
      return [
        { gender_concept_id: 8507, gender: 'Male', count: 357 },
        { gender_concept_id: 8532, gender: 'Female', count: 392 },
        { gender_concept_id: 8521, gender: 'Other', count: 12 },
      ];
    } else if (lowercaseQuery.includes('age')) {
      return [
        { age_group: '0-17', count: 120 },
        { age_group: '18-34', count: 210 },
        { age_group: '35-49', count: 185 },
        { age_group: '50-64', count: 156 },
        { age_group: '65+', count: 90 },
      ];
    } else if (lowercaseQuery.includes('diagnoses') || lowercaseQuery.includes('conditions')) {
      return [
        { diagnosis: 'Essential hypertension', count: 125 },
        { diagnosis: 'Hyperlipidemia', count: 98 },
        { diagnosis: 'Type 2 diabetes mellitus', count: 87 },
        { diagnosis: 'Acute bronchitis', count: 76 },
        { diagnosis: 'Low back pain', count: 72 },
        { diagnosis: 'Anxiety disorder', count: 68 },
        { diagnosis: 'Major depressive disorder', count: 56 },
        { diagnosis: 'Acute upper respiratory infection', count: 52 },
        { diagnosis: 'Gastroesophageal reflux disease', count: 49 },
        { diagnosis: 'Osteoarthritis', count: 43 },
      ];
    } else if (lowercaseQuery.includes('diabetes')) {
      return [
        { patient_count: 87 }
      ];
    } else if (lowercaseQuery.includes('medications') || lowercaseQuery.includes('drugs')) {
      return [
        { medication_name: 'Lisinopril', patient_count: 78 },
        { medication_name: 'Atorvastatin', patient_count: 65 },
        { medication_name: 'Metformin', patient_count: 59 },
        { medication_name: 'Amlodipine', patient_count: 52 },
        { medication_name: 'Omeprazole', patient_count: 48 },
        { medication_name: 'Levothyroxine', patient_count: 45 },
        { medication_name: 'Simvastatin', patient_count: 41 },
        { medication_name: 'Metoprolol', patient_count: 39 },
        { medication_name: 'Hydrochlorothiazide', patient_count: 35 },
        { medication_name: 'Ibuprofen', patient_count: 32 },
      ];
    } else {
      // Generic sample data for other queries
      return Array.from({ length: 10 }, (_, i) => ({
        person_id: 1000 + i,
        year_of_birth: Math.floor(Math.random() * 50) + 1950,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        condition_count: Math.floor(Math.random() * 15) + 1
      }));
    }
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
            <ScrollArea className="h-full max-h-[800px]">
              {queryHistory.map((item) => (
                <QueryResult
                  key={item.id}
                  sql={item.sql}
                  data={item.data}
                  metrics={item.metrics}
                  timestamp={item.timestamp}
                  aiResponse={item.aiResponse}
                />
              ))}
            </ScrollArea>
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
