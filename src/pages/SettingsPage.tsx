
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AIProviderSettings } from '@/components/AIProviderSettings';
import { DatabricksSettings } from '@/components/DatabricksSettings';
import { DatabaseSettings } from '@/components/DatabaseSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCredentials } from '@/hooks/use-credentials';

export default function SettingsPage() {
  const { credentials, setCredentials } = useCredentials();
  const [preferences, setPreferences] = useState({
    theme: 'light',
    enableAnalytics: false,
    cacheResults: true,
    saveHistory: true,
  });

  // Handle AI provider credentials save
  const handleAIProviderSave = (newCredentials: any) => {
    setCredentials(newCredentials);
  };

  // Handle Databricks config save
  const handleDatabricksConfigSave = (newCredentials: any) => {
    setCredentials(newCredentials);
  };

  // Handle database config save
  const handleDatabaseConfigSave = (config: any) => {
    localStorage.setItem('databaseConfig', JSON.stringify(config));
  };

  // Handle preference toggle
  const handleTogglePreference = (preference: string) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [preference]: !prev[preference as keyof typeof prev] };
      localStorage.setItem('preferences', JSON.stringify(newPreferences));
      return newPreferences;
    });
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Mock function for testing database connection
  const testDatabaseConnection = async (): Promise<boolean> => {
    try {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      return false;
    }
  };

  // Mock function for testing Databricks connection
  const testDatabricksConnection = async (): Promise<boolean> => {
    try {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your OMOP Query Assistant preferences and connections
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="databricks">Databricks</TabsTrigger>
          <TabsTrigger value="database">Local Database</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="animate-fade-in">
          <AIProviderSettings 
            onSave={handleAIProviderSave} 
            initialValues={credentials}
          />
        </TabsContent>

        <TabsContent value="databricks" className="animate-fade-in">
          <DatabricksSettings 
            onSave={handleDatabricksConfigSave}
            initialValues={credentials.databricks}
            onTestConnection={testDatabricksConnection}
          />
        </TabsContent>

        <TabsContent value="database" className="animate-fade-in">
          <DatabaseSettings 
            onSave={handleDatabaseConfigSave}
            onTestConnection={testDatabaseConnection}
            initialValues={{
              duckdbPath: './data/synthea-remove-suffix.duckdb',
              logDbPath: './logs/query_logs.json'
            }}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Appearance</h3>
                <Separator className="mb-4" />
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme" className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable dark mode for the application
                      </p>
                    </div>
                    <Switch
                      id="theme"
                      checked={preferences.theme === 'dark'}
                      onCheckedChange={() => {
                        const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
                        setPreferences({ ...preferences, theme: newTheme });
                        document.documentElement.classList.toggle('dark');
                        localStorage.setItem('preferences', JSON.stringify({
                          ...preferences,
                          theme: newTheme
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Privacy</h3>
                <Separator className="mb-4" />
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="text-base">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow collection of anonymous usage data
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.enableAnalytics}
                      onCheckedChange={() => handleTogglePreference('enableAnalytics')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Query Settings</h3>
                <Separator className="mb-4" />
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cache" className="text-base">Cache Query Results</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Store query results in cache for faster retrieval
                      </p>
                    </div>
                    <Switch
                      id="cache"
                      checked={preferences.cacheResults}
                      onCheckedChange={() => handleTogglePreference('cacheResults')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="history" className="text-base">Save Query History</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Store your query history for future reference
                      </p>
                    </div>
                    <Switch
                      id="history"
                      checked={preferences.saveHistory}
                      onCheckedChange={() => handleTogglePreference('saveHistory')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Management</h3>
                <Separator className="mb-4" />
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all saved settings?')) {
                        localStorage.clear();
                        toast.success('All settings have been cleared');
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    }}
                    className="text-destructive hover:underline text-left"
                  >
                    Clear all settings and data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
