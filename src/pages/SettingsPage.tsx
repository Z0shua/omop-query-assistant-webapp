
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderSettings } from '@/components/AIProviderSettings';
import { DatabaseSettings } from '@/components/DatabaseSettings';
import { DatabricksSettings } from '@/components/DatabricksSettings';
import { useCredentials } from '@/hooks/use-credentials';
import { useToast } from '@/hooks/use-toast';
import { testProviderConnection } from '@/utils/nlToSqlConverter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Info, AlertCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { credentials, setCredentials } = useCredentials();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ai-providers");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'timeout' | 'unknown' | null>(null);

  const testAIProviderConnection = async (provider: string, providerCredentials: any) => {
    try {
      console.log(`Testing connection to ${provider}...`);
      
      // Reset any previous debug info and error type
      setDebugInfo(null);
      setErrorType(null);
      
      // Call the actual connection test function
      const result = await testProviderConnection(provider, providerCredentials);
      
      if (result.success) {
        console.log(`Successfully connected to ${provider}`);
        return true;
      } else {
        console.error(`Failed to connect to ${provider}`);
        
        // Determine error type based on debug info
        if (result.debugInfo) {
          setDebugInfo(result.debugInfo);
          
          // Set the error type based on the error message
          if (result.debugInfo.includes('Failed to fetch') || 
              result.debugInfo.includes('network') || 
              result.debugInfo.includes('CORS')) {
            setErrorType('network');
          } else if (result.debugInfo.includes('Authentication') || 
                    result.debugInfo.includes('Unauthorized') || 
                    result.debugInfo.includes('API key') || 
                    result.debugInfo.includes('token')) {
            setErrorType('auth');
          } else if (result.debugInfo.includes('timeout') || 
                    result.debugInfo.includes('timed out')) {
            setErrorType('timeout');
          } else {
            setErrorType('unknown');
          }
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error in test connection:', error);
      setDebugInfo(error instanceof Error 
        ? `${error.name}: ${error.message}\n${error.stack}` 
        : `Unknown error: ${JSON.stringify(error)}`);
      setErrorType('unknown');
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
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Connection Error Debug Information</span>
            </div>
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
            
            {errorType === 'network' && (
              <Alert variant="default" className="mt-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Network Connection Issue</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">This appears to be a network connectivity issue. Try these steps:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Check if your internet connection is working properly</li>
                    <li>Verify that you're not behind a restrictive firewall or VPN</li>
                    <li>Ensure the API endpoint URL is correct and accessible</li>
                    <li>Check if the API service is operational</li>
                    <li>Try using a different browser or device</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    <strong>CORS errors:</strong> If you're seeing "Failed to fetch" errors, this could be due to 
                    Cross-Origin Resource Sharing (CORS) restrictions. These typically can't be fixed from your side 
                    but may require using a different endpoint or API provider.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            {errorType === 'auth' && (
              <Alert variant="default" className="mt-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Authentication Issue</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">This appears to be an authentication issue. Try these steps:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Verify that your API key or token is correct and not expired</li>
                    <li>Check if you have copied the full API key without extra spaces</li>
                    <li>Ensure your account has the necessary permissions for the selected service</li>
                    <li>Try generating a new API key if possible</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {errorType === 'timeout' && (
              <Alert variant="default" className="mt-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Connection Timeout</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">The connection to the API timed out. Try these steps:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Check if your internet connection is stable and fast enough</li>
                    <li>The API service might be experiencing high load or outages</li>
                    <li>Try again later or use a different API provider</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {errorType === 'unknown' && (
              <Alert variant="default" className="mt-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Troubleshooting Suggestions</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">Try these general troubleshooting steps:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Verify all your credentials and settings</li>
                    <li>Check if the service you're trying to connect to is operational</li>
                    <li>Ensure you're using the correct endpoint URLs and API versions</li>
                    <li>Try using a different browser or clearing your browser cache</li>
                    <li>Check the service's status page or documentation for known issues</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.open('https://platform.openai.com/status', '_blank')}>
                <ExternalLink className="h-3 w-3 mr-2" />
                Check API Service Status
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
          <TabsTrigger value="database">DuckDB</TabsTrigger>
          <TabsTrigger value="databricks">Databricks</TabsTrigger>
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

        <TabsContent value="databricks" className="space-y-4">
          <DatabricksSettings 
            onSave={setCredentials}
            initialValues={credentials.databricks || {
              host: '',
              token: '',
              catalog: '',
              schema: '',
              warehouse: ''
            }}
            onTestConnection={async (databricksCredentials) => {
              try {
                setDebugInfo(null);
                setErrorType(null);
                console.log('Testing Databricks connection with:', databricksCredentials);
                
                // Use the same test connection function but specify databricks as provider
                const result = await testProviderConnection('databricks', databricksCredentials);
                
                if (result.success) {
                  console.log('Successfully connected to Databricks');
                  return true;
                } else {
                  console.error('Failed to connect to Databricks');
                  
                  if (result.debugInfo) {
                    setDebugInfo(result.debugInfo);
                    
                    // Determine error type based on the error message
                    if (result.debugInfo.includes('Failed to fetch') || 
                        result.debugInfo.includes('network') || 
                        result.debugInfo.includes('CORS')) {
                      setErrorType('network');
                    } else if (result.debugInfo.includes('Authentication') || 
                              result.debugInfo.includes('Unauthorized') || 
                              result.debugInfo.includes('token')) {
                      setErrorType('auth');
                    } else if (result.debugInfo.includes('timeout') || 
                              result.debugInfo.includes('timed out')) {
                      setErrorType('timeout');
                    } else {
                      setErrorType('unknown');
                    }
                  }
                  
                  return false;
                }
              } catch (error) {
                console.error('Error testing Databricks connection:', error);
                setDebugInfo(error instanceof Error 
                  ? `${error.name}: ${error.message}\n${error.stack}` 
                  : `Unknown error: ${JSON.stringify(error)}`);
                setErrorType('unknown');
                return false;
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
