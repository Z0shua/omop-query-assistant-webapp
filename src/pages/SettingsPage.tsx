
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderSettings } from '@/components/AIProviderSettings';
import { DatabaseSettings } from '@/components/DatabaseSettings';
import { useCredentials } from '@/hooks/use-credentials';
import { useToast } from '@/hooks/use-toast';
import { testProviderConnection } from '@/utils/nlToSqlConverter';

export default function SettingsPage() {
  const { credentials, setCredentials } = useCredentials();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ai-providers");

  const testAIProviderConnection = async (provider: string, providerCredentials: any) => {
    try {
      console.log(`Testing connection to ${provider}...`);
      
      // Call the actual connection test function
      const success = await testProviderConnection(provider, providerCredentials);
      
      if (success) {
        console.log(`Successfully connected to ${provider}`);
        return true;
      } else {
        console.error(`Failed to connect to ${provider}`);
        return false;
      }
    } catch (error) {
      console.error('Error in test connection:', error);
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
              setCredentials({ databricks: config });
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
