
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, X, Key } from 'lucide-react';

interface ApiKeyFormProps {
  onSave: (credentials: any) => void;
  initialValues?: {
    apiKey?: string;
    endpoint?: string;
    apiVersion?: string;
    deploymentName?: string;
    modelName?: string;
  };
}

export function ApiKeyForm({ onSave, initialValues = {} }: ApiKeyFormProps) {
  const [credentials, setCredentials] = useState({
    apiKey: initialValues.apiKey || '',
    endpoint: initialValues.endpoint || '',
    apiVersion: initialValues.apiVersion || '2024-02-15-preview',
    deploymentName: initialValues.deploymentName || '',
    modelName: initialValues.modelName || 'gpt4o',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setIsTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.apiKey || !credentials.endpoint || !credentials.deploymentName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Save the credentials (in a real app, this would be securely stored)
    onSave(credentials);
    toast.success('API credentials saved successfully');
    setIsTouched(false);
  };

  const handleClear = () => {
    setCredentials({
      apiKey: '',
      endpoint: '',
      apiVersion: '2024-02-15-preview',
      deploymentName: '',
      modelName: 'gpt4o',
    });
    setIsTouched(true);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Azure OpenAI API Configuration
        </CardTitle>
        <CardDescription>
          Configure your Azure OpenAI API credentials for the OMOP Query Assistant. 
          Your credentials are stored securely in your browser's local storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-muted border-primary/20">
            <AlertDescription>
              These credentials are needed to connect to Azure OpenAI for natural language 
              processing of your OMOP queries. They are stored locally and never sent to any server.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium">
                API Key <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  id="apiKey"
                  name="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={credentials.apiKey}
                  onChange={handleChange}
                  className="pr-10"
                  placeholder="Enter your Azure OpenAI API key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="endpoint" className="text-sm font-medium">
                API Endpoint <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endpoint"
                name="endpoint"
                type="text"
                value={credentials.endpoint}
                onChange={handleChange}
                className="mt-1"
                placeholder="https://your-resource-name.openai.azure.com/"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apiVersion" className="text-sm font-medium">
                  API Version
                </Label>
                <Input
                  id="apiVersion"
                  name="apiVersion"
                  type="text"
                  value={credentials.apiVersion}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="2024-02-15-preview"
                />
              </div>
              
              <div>
                <Label htmlFor="deploymentName" className="text-sm font-medium">
                  Deployment Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deploymentName"
                  name="deploymentName"
                  type="text"
                  value={credentials.deploymentName}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Enter your deployment name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="modelName" className="text-sm font-medium">
                Model Name
              </Label>
              <Input
                id="modelName"
                name="modelName"
                type="text"
                value={credentials.modelName}
                onChange={handleChange}
                className="mt-1"
                placeholder="gpt4o"
              />
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
