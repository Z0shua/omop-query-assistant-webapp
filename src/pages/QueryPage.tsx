
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
import { Brain, AlertTriangle, Database } from 'lucide-react';

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
          variant: "warning"
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
      
      // In a real implementation, we would make different API calls based on the selected AI provider and database
      // For demonstration purposes, we'll use the mock data generator
      
      // Simulate API call to the backend (would be a real API call in production)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful response
      const mockSql = generateMockSql(queryText);
      const mockData = generateMockData(queryText);
      const mockMetrics = {
        rows: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
        execution_time_ms: Math.random() * 1000 + 200,
        database_type: usingDatabricks ? 'Databricks' : 'DuckDB',
        ai_provider: credentials.selectedProvider
      };
      
      // Add to history
      const queryResult = {
        id: Date.now().toString(),
        query: queryText,
        sql: mockSql,
        data: mockData,
        metrics: mockMetrics,
        timestamp: new Date().toISOString()
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

  // Mock functions to generate sample data for demonstration
  const generateMockSql = (query: string): string => {
    if (query.toLowerCase().includes('gender')) {
      return `SELECT gender_concept_id, concept_name as gender, COUNT(*) as count
FROM person
JOIN concept ON person.gender_concept_id = concept.concept_id
GROUP BY gender_concept_id, concept_name
ORDER BY count DESC`;
    } else if (query.toLowerCase().includes('age')) {
      return `WITH age_calc AS (
  SELECT
    FLOOR((JULIANDAY('now') - JULIANDAY(birth_datetime)) / 365.25) as age
  FROM person
)
SELECT
  CASE
    WHEN age < 18 THEN '0-17'
    WHEN age BETWEEN 18 AND 34 THEN '18-34'
    WHEN age BETWEEN 35 AND 49 THEN '35-49'
    WHEN age BETWEEN 50 AND 64 THEN '50-64'
    WHEN age >= 65 THEN '65+'
  END as age_group,
  COUNT(*) as count
FROM age_calc
GROUP BY age_group
ORDER BY age_group`;
    } else if (query.toLowerCase().includes('diagnoses')) {
      return `SELECT c.concept_name as diagnosis, COUNT(*) as count
FROM condition_occurrence co
JOIN concept c ON co.condition_concept_id = c.concept_id
GROUP BY c.concept_name
ORDER BY count DESC
LIMIT 10`;
    } else {
      return `-- Generated SQL for: ${query}
SELECT 
  p.person_id,
  p.year_of_birth,
  c.concept_name as gender,
  COUNT(DISTINCT co.condition_occurrence_id) as condition_count
FROM 
  person p
JOIN 
  concept c ON p.gender_concept_id = c.concept_id
LEFT JOIN 
  condition_occurrence co ON p.person_id = co.person_id
GROUP BY 
  p.person_id, p.year_of_birth, c.concept_name
ORDER BY 
  condition_count DESC
LIMIT 20`;
    }
  };

  const generateMockData = (query: string): any[] => {
    if (query.toLowerCase().includes('gender')) {
      return [
        { gender_concept_id: 8507, gender: 'Male', count: 357 },
        { gender_concept_id: 8532, gender: 'Female', count: 392 },
        { gender_concept_id: 8521, gender: 'Other', count: 12 },
      ];
    } else if (query.toLowerCase().includes('age')) {
      return [
        { age_group: '0-17', count: 120 },
        { age_group: '18-34', count: 210 },
        { age_group: '35-49', count: 185 },
        { age_group: '50-64', count: 156 },
        { age_group: '65+', count: 90 },
      ];
    } else if (query.toLowerCase().includes('diagnoses')) {
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
    } else {
      // Generic sample data
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
  
  // Helper function to check credentials for the alert
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
  
  // Helper function to get friendly provider name
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
  
  // Helper function to get database type name
  function getDatabaseTypeName() {
    return (credentials.databricks.host && credentials.databricks.token) 
      ? 'Databricks SQL' 
      : 'Local DuckDB';
  }
  
  // Mock functions to generate sample data for demonstration
  function generateMockSql(query: string): string {
    if (query.toLowerCase().includes('gender')) {
      return `SELECT gender_concept_id, concept_name as gender, COUNT(*) as count
FROM person
JOIN concept ON person.gender_concept_id = concept.concept_id
GROUP BY gender_concept_id, concept_name
ORDER BY count DESC`;
    } else if (query.toLowerCase().includes('age')) {
      return `WITH age_calc AS (
  SELECT
    FLOOR((JULIANDAY('now') - JULIANDAY(birth_datetime)) / 365.25) as age
  FROM person
)
SELECT
  CASE
    WHEN age < 18 THEN '0-17'
    WHEN age BETWEEN 18 AND 34 THEN '18-34'
    WHEN age BETWEEN 35 AND 49 THEN '35-49'
    WHEN age BETWEEN 50 AND 64 THEN '50-64'
    WHEN age >= 65 THEN '65+'
  END as age_group,
  COUNT(*) as count
FROM age_calc
GROUP BY age_group
ORDER BY age_group`;
    } else if (query.toLowerCase().includes('diagnoses')) {
      return `SELECT c.concept_name as diagnosis, COUNT(*) as count
FROM condition_occurrence co
JOIN concept c ON co.condition_concept_id = c.concept_id
GROUP BY c.concept_name
ORDER BY count DESC
LIMIT 10`;
    } else {
      return `-- Generated SQL for: ${query}
-- Using ${getProviderName()} and ${getDatabaseTypeName()}
SELECT 
  p.person_id,
  p.year_of_birth,
  c.concept_name as gender,
  COUNT(DISTINCT co.condition_occurrence_id) as condition_count
FROM 
  person p
JOIN 
  concept c ON p.gender_concept_id = c.concept_id
LEFT JOIN 
  condition_occurrence co ON p.person_id = co.person_id
GROUP BY 
  p.person_id, p.year_of_birth, c.concept_name
ORDER BY 
  condition_count DESC
LIMIT 20`;
    }
  }

  function generateMockData(query: string): any[] {
    if (query.toLowerCase().includes('gender')) {
      return [
        { gender_concept_id: 8507, gender: 'Male', count: 357 },
        { gender_concept_id: 8532, gender: 'Female', count: 392 },
        { gender_concept_id: 8521, gender: 'Other', count: 12 },
      ];
    } else if (query.toLowerCase().includes('age')) {
      return [
        { age_group: '0-17', count: 120 },
        { age_group: '18-34', count: 210 },
        { age_group: '35-49', count: 185 },
        { age_group: '50-64', count: 156 },
        { age_group: '65+', count: 90 },
      ];
    } else if (query.toLowerCase().includes('diagnoses')) {
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
    } else {
      // Generic sample data
      return Array.from({ length: 10 }, (_, i) => ({
        person_id: 1000 + i,
        year_of_birth: Math.floor(Math.random() * 50) + 1950,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        condition_count: Math.floor(Math.random() * 15) + 1
      }));
    }
  }
}
