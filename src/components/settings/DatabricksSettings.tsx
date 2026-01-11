
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, X, Database, RefreshCw } from 'lucide-react';
import { DatabricksCredentials } from '@/hooks/use-credentials';

interface DatabricksSettingsProps {
  onSave: (credentials: { databricks: DatabricksCredentials }) => void;
  initialValues: DatabricksCredentials;
  onTestConnection?: (credentials: DatabricksCredentials) => Promise<boolean>;
}

export function DatabricksSettings({ 
  onSave, 
  initialValues,
  onTestConnection 
}: DatabricksSettingsProps) {
  const [credentials, setCredentials] = useState<DatabricksCredentials>({...initialValues});
  const [showToken, setShowToken] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setIsTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.host || !credentials.token) {
      toast.error('Please provide both Databricks host and access token');
      return;
    }
    
    // Save the credentials
    onSave({ databricks: credentials });
    toast.success('Databricks settings saved successfully');
    setIsTouched(false);
  };

  const handleClear = () => {
    setCredentials({
      host: '',
      token: '',
      catalog: '',
      schema: '',
      warehouse: ''
    });
    setIsTouched(true);
  };

  const testConnection = async () => {
    if (!onTestConnection) return;
    
    // Basic validation
    if (!credentials.host || !credentials.token) {
      toast.error('Please provide both Databricks host and access token');
      return;
    }
    
    setIsTestingConnection(true);
    try {
      const success = await onTestConnection(credentials);
      if (success) {
        toast.success('Successfully connected to Databricks');
      } else {
        toast.error('Failed to connect to Databricks');
      }
    } catch (error) {
      toast.error('Error testing connection: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Databricks Configuration
        </CardTitle>
        <CardDescription>
          Connect to your Databricks SQL warehouse to query your healthcare data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Alert className="bg-muted border-primary/20">
              <AlertDescription>
                These credentials are needed to connect to your Databricks SQL warehouse. 
                They are stored locally in your browser and never sent to any third-party server.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="host" className="text-sm font-medium">
                  Databricks Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="host"
                  name="host"
                  type="text"
                  value={credentials.host}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="https://dbc-abcdef12-3456.cloud.databricks.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The URL of your Databricks workspace (without /sql)
                </p>
              </div>
              
              <div>
                <Label htmlFor="token" className="text-sm font-medium">
                  Access Token <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="token"
                    name="token"
                    type={showToken ? 'text' : 'password'}
                    value={credentials.token}
                    onChange={handleChange}
                    className="pr-10"
                    placeholder="Enter your Databricks access token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a token in User Settings in your Databricks workspace
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="catalog" className="text-sm font-medium">
                    Catalog
                  </Label>
                  <Input
                    id="catalog"
                    name="catalog"
                    type="text"
                    value={credentials.catalog}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="hive_metastore"
                  />
                </div>
                
                <div>
                  <Label htmlFor="schema" className="text-sm font-medium">
                    Schema
                  </Label>
                  <Input
                    id="schema"
                    name="schema"
                    type="text"
                    value={credentials.schema}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="omop"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="warehouse" className="text-sm font-medium">
                  SQL Warehouse
                </Label>
                <Input
                  id="warehouse"
                  name="warehouse"
                  type="text"
                  value={credentials.warehouse}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="e.g. your-warehouse-name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The name or ID of your SQL warehouse
                </p>
              </div>
              
              {onTestConnection && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!isTouched}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Credentials
        </Button>
      </CardFooter>
    </Card>
  );
}
