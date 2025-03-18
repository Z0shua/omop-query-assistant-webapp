
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderSettings } from '@/components/AIProviderSettings';
import { DatabaseSettings } from '@/components/DatabaseSettings';
import { useCredentials } from '@/hooks/use-credentials';
import { useToast } from '@/hooks/use-toast';
import { testProviderConnection } from '@/utils/nlToSqlConverter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function SettingsPage() {
  const { credentials, setCredentials } = useCredentials();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ai-providers");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const testAIProviderConnection = async (provider: string, providerCredentials: any) => {
    try {
      console.log(`Testing connection to ${provider}...`);
      
      // Reset any previous debug info
      setDebugInfo(null);
      
      // Call the actual connection test function
      const result = await testProviderConnection(provider, providerCredentials);
      
      if (result.success) {
        console.log(`Successfully connected to ${provider}`);
        return true;
      } else {
        console.error(`Failed to connect to ${provider}`);
        // Store debug info for display
        if (result.debugInfo) {
          setDebugInfo(result.debugInfo);
        }
        return false;
      }
    } catch (error) {
      console.error('Error in test connection:', error);
      setDebugInfo(error instanceof Error 
        ? `${error.name}: ${error.message}\n${error.stack}` 
        : `Unknown error: ${JSON.stringify(error)}`);
      return false;
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your AI providers and database connections
        </p>
      </div>

      {debugInfo && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle className="flex items-center justify-between">
            <span>Connection Error Debug Information</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDebugInfo(null)}
              className="h-5 w-5 -my-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription>
            <div className="bg-muted p-2 rounded-md mt-2 overflow-auto max-h-[300px]">
              <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            </div>
            <div className="mt-2 text-sm">
              This information can help diagnose API connection issues. Please check your 
              credentials, network connectivity, and API service status.
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-providers" className="space-y-4">
          <AIProviderSettings 
            initialValues={credentials}
            onSave={setCredentials}
            onTestConnection={testAIProviderConnection}
          />
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <DatabaseSettings 
            onSave={(config) => {
              // Update the databricks credentials when database settings are saved
              setCredentials({ 
                databricks: { 
                  host: config.duckdbPath || '', 
                  token: credentials.databricks?.token || '',
                  catalog: config.logDbPath || '',
                  schema: credentials.databricks?.schema || '',
                  warehouse: credentials.databricks?.warehouse || ''
                } 
              });
              // Using toast from useToast hook correctly
              toast({
                title: "Success",
                description: "Database settings saved successfully"
              });
            }}
            initialValues={{
              duckdbPath: credentials.databricks?.host || '',
              logDbPath: credentials.databricks?.catalog || ''
            }}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
