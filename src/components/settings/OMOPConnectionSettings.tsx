
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { testOMOPConnection } from '@/services/omopApiService';
import { toast } from 'sonner';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export function OMOPConnectionSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });
  
  // Load existing configuration
  const [config, setConfig] = useState(() => {
    const savedConfig = localStorage.getItem('omopConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Error parsing saved OMOP config:', e);
        return {
          apiEndpoint: '',
          apiKey: ''
        };
      }
    }
    return {
      apiEndpoint: '',
      apiKey: ''
    };
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    localStorage.setItem('omopConfig', JSON.stringify(config));
    toast.success('OMOP connection settings saved');
    setConnectionStatus({ tested: false });
  };
  
  const handleTestConnection = async () => {
    setIsLoading(true);
    setConnectionStatus({ tested: false });
    
    try {
      localStorage.setItem('omopConfig', JSON.stringify(config));
      const result = await testOMOPConnection();
      
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast.success('Connection successful');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      toast.error('Error testing connection');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>OMOP CDM Connection</CardTitle>
        <CardDescription>
          Connect to your OMOP Common Data Model database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiEndpoint">API Endpoint</Label>
          <Input
            id="apiEndpoint"
            name="apiEndpoint"
            placeholder="https://your-omop-api.example.com"
            value={config.apiEndpoint}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            The endpoint of your OMOP CDM API service
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key (optional)</Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            placeholder="Your API key"
            value={config.apiKey}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            API key for authentication, if required
          </p>
        </div>
        
        {connectionStatus.tested && (
          <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
            connectionStatus.success ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
            'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {connectionStatus.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>{connectionStatus.message}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSave}>Save</Button>
        <Button onClick={handleTestConnection} disabled={isLoading}>
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Test Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
