
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, X, Key, Bot } from 'lucide-react';
import { 
  AllCredentials, 
  AzureCredentials, 
  AnthropicCredentials, 
  GoogleAICredentials, 
  DeepseekCredentials 
} from '@/hooks/use-credentials';

interface AIProviderSettingsProps {
  onSave: (credentials: Partial<AllCredentials>) => void;
  initialValues: AllCredentials;
}

export function AIProviderSettings({ onSave, initialValues }: AIProviderSettingsProps) {
  const [credentials, setCredentials] = useState<AllCredentials>({...initialValues});
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleProviderChange = (provider: 'azure' | 'anthropic' | 'google' | 'deepseek') => {
    setCredentials(prev => ({
      ...prev,
      selectedProvider: provider
    }));
    setIsTouched(true);
  };

  const handleAzureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      azure: {
        ...prev.azure,
        [name]: value
      }
    }));
    setIsTouched(true);
  };

  const handleAnthropicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      anthropic: {
        ...prev.anthropic,
        [name]: value
      }
    }));
    setIsTouched(true);
  };

  const handleGoogleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      google: {
        ...prev.google,
        [name]: value
      }
    }));
    setIsTouched(true);
  };

  const handleDeepseekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      deepseek: {
        ...prev.deepseek,
        [name]: value
      }
    }));
    setIsTouched(true);
  };

  const handleModelChange = (provider: 'anthropic' | 'google' | 'deepseek', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        modelName: value
      }
    }));
    setIsTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation based on selected provider
    const provider = credentials.selectedProvider;
    let isValid = true;
    let errorMessage = '';

    if (provider === 'azure') {
      if (!credentials.azure.apiKey || !credentials.azure.endpoint || !credentials.azure.deploymentName) {
        isValid = false;
        errorMessage = 'Please fill in all required Azure OpenAI fields';
      }
    } else if (provider === 'anthropic') {
      if (!credentials.anthropic.apiKey) {
        isValid = false;
        errorMessage = 'Please provide your Anthropic API key';
      }
    } else if (provider === 'google') {
      if (!credentials.google.apiKey) {
        isValid = false;
        errorMessage = 'Please provide your Google AI API key';
      }
    } else if (provider === 'deepseek') {
      if (!credentials.deepseek.apiKey) {
        isValid = false;
        errorMessage = 'Please provide your Deepseek API key';
      }
    }

    if (!isValid) {
      toast.error(errorMessage);
      return;
    }
    
    // Save the credentials
    onSave(credentials);
    toast.success('AI provider settings saved successfully');
    setIsTouched(false);
  };

  const handleClear = () => {
    // Reset the current provider's credentials
    const provider = credentials.selectedProvider;
    const resetCredentials = {...credentials};
    
    if (provider === 'azure') {
      resetCredentials.azure = {
        apiKey: '',
        endpoint: '',
        deploymentName: '',
        apiVersion: '2024-02-15-preview',
        modelName: 'gpt4o'
      };
    } else if (provider === 'anthropic') {
      resetCredentials.anthropic = {
        apiKey: '',
        modelName: 'claude-3-opus-20240229'
      };
    } else if (provider === 'google') {
      resetCredentials.google = {
        apiKey: '',
        modelName: 'gemini-1.5-pro'
      };
    } else if (provider === 'deepseek') {
      resetCredentials.deepseek = {
        apiKey: '',
        modelName: 'deepseek-llm-67b-chat'
      };
    }
    
    setCredentials(resetCredentials);
    setIsTouched(true);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Provider Configuration
        </CardTitle>
        <CardDescription>
          Configure your preferred AI provider for the OMOP Query Assistant.
          Your credentials are stored securely in your browser's local storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Alert className="bg-muted border-primary/20">
              <AlertDescription>
                These credentials are needed to connect to your chosen AI provider for natural language 
                processing of your OMOP queries. They are stored locally and never sent to any server.
              </AlertDescription>
            </Alert>
            
            <div className="mb-6">
              <Label htmlFor="provider" className="text-sm font-medium mb-2 block">
                Select AI Provider
              </Label>
              <Select 
                value={credentials.selectedProvider} 
                onValueChange={(value) => handleProviderChange(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azure">Azure OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="google">Google AI (Gemini)</SelectItem>
                  <SelectItem value="deepseek">Deepseek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs value={credentials.selectedProvider} className="w-full">
              <TabsContent value="azure" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="apiKey" className="text-sm font-medium">
                    API Key <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={credentials.azure.apiKey}
                      onChange={handleAzureChange}
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
                    value={credentials.azure.endpoint}
                    onChange={handleAzureChange}
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
                      value={credentials.azure.apiVersion}
                      onChange={handleAzureChange}
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
                      value={credentials.azure.deploymentName}
                      onChange={handleAzureChange}
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
                    value={credentials.azure.modelName}
                    onChange={handleAzureChange}
                    className="mt-1"
                    placeholder="gpt4o"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="anthropic" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="anthropicApiKey" className="text-sm font-medium">
                    API Key <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="anthropicApiKey"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={credentials.anthropic.apiKey}
                      onChange={handleAnthropicChange}
                      className="pr-10"
                      placeholder="Enter your Anthropic API key"
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
                  <Label htmlFor="anthropicModel" className="text-sm font-medium">
                    Model
                  </Label>
                  <Select 
                    value={credentials.anthropic.modelName} 
                    onValueChange={(value) => handleModelChange('anthropic', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude-2.1">Claude 2.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="google" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="googleApiKey" className="text-sm font-medium">
                    API Key <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="googleApiKey"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={credentials.google.apiKey}
                      onChange={handleGoogleChange}
                      className="pr-10"
                      placeholder="Enter your Google AI API key"
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
                  <Label htmlFor="googleModel" className="text-sm font-medium">
                    Model
                  </Label>
                  <Select 
                    value={credentials.google.modelName} 
                    onValueChange={(value) => handleModelChange('google', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                      <SelectItem value="gemini-1.0-ultra">Gemini 1.0 Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="deepseek" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="deepseekApiKey" className="text-sm font-medium">
                    API Key <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="deepseekApiKey"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={credentials.deepseek.apiKey}
                      onChange={handleDeepseekChange}
                      className="pr-10"
                      placeholder="Enter your Deepseek API key"
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
                  <Label htmlFor="deepseekModel" className="text-sm font-medium">
                    Model
                  </Label>
                  <Select 
                    value={credentials.deepseek.modelName} 
                    onValueChange={(value) => handleModelChange('deepseek', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek-llm-67b-chat">Deepseek LLM 67B Chat</SelectItem>
                      <SelectItem value="deepseek-coder-33b-instruct">Deepseek Coder 33B Instruct</SelectItem>
                      <SelectItem value="deepseek-ai-m4-7b">Deepseek AI M4 7B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
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
