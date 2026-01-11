
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Server, Folder, RefreshCw, Save } from 'lucide-react';

interface DatabaseSettingsProps {
  onSave: (config: any) => void;
  initialValues?: {
    duckdbPath?: string;
    logDbPath?: string;
  };
  onTestConnection?: () => Promise<boolean>;
}

export function DatabaseSettings({ 
  onSave, 
  initialValues = {}, 
  onTestConnection 
}: DatabaseSettingsProps) {
  const [config, setConfig] = useState({
    duckdbPath: initialValues.duckdbPath || './data/omop.duckdb',
    logDbPath: initialValues.logDbPath || './logs/query_logs.json',
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  
  // References to hidden file inputs
  const duckDbFileInputRef = useRef<HTMLInputElement>(null);
  const logDbFileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    setIsTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!config.duckdbPath) {
      toast.error('Please provide a DuckDB database path');
      return;
    }
    
    // Save the configuration
    onSave(config);
    toast.success('Database configuration saved successfully');
    setIsTouched(false);
  };

  const testConnection = async () => {
    if (!onTestConnection) return;
    
    setIsTestingConnection(true);
    try {
      const success = await onTestConnection();
      if (success) {
        toast.success('Successfully connected to database');
      } else {
        toast.error('Failed to connect to database');
      }
    } catch (error) {
      toast.error('Error testing connection: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Handler for file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a web context, we can only get the file name, not the full path due to security restrictions
      // In an Electron or other desktop app, you could use the full path
      const fileName = files[0].name;
      
      // For demonstration, we'll just use the filename
      // In a real desktop app with Node.js access, you would get the full path
      setConfig(prev => ({ ...prev, [fieldName]: fileName }));
      setIsTouched(true);
      
      toast.success(`Selected file: ${fileName}`);
    }
  };

  // Trigger hidden file input click
  const openFileBrowser = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Configuration
        </CardTitle>
        <CardDescription>
          Configure the database connections for the OMOP Query Assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Database Path</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Specify the path to your DuckDB database file containing OMOP data
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="duckdbPath"
                  name="duckdbPath"
                  value={config.duckdbPath}
                  onChange={handleChange}
                  placeholder="./data/omop.duckdb"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                  onClick={() => openFileBrowser(duckDbFileInputRef)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Browse
                </Button>
                {/* Hidden file input for DuckDB path */}
                <input
                  type="file"
                  ref={duckDbFileInputRef}
                  onChange={(e) => handleFileSelect(e, 'duckdbPath')}
                  accept=".duckdb,.db,.sqlite"
                  className="hidden"
                />
              </div>
            </div>
            
            {onTestConnection && (
              <div className="pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="w-full"
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
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logDbPath">Log Database Path</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logDbPath"
                  name="logDbPath"
                  value={config.logDbPath}
                  onChange={handleChange}
                  placeholder="./logs/query_logs.json"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                  onClick={() => openFileBrowser(logDbFileInputRef)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Browse
                </Button>
                {/* Hidden file input for log database path */}
                <input
                  type="file"
                  ref={logDbFileInputRef}
                  onChange={(e) => handleFileSelect(e, 'logDbPath')}
                  accept=".json"
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Path where query logs will be stored (TinyDB JSON file)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit"
          onClick={handleSubmit}
          disabled={!isTouched}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
}
