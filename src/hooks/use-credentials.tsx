
import { useState, useEffect } from 'react';

export interface AzureCredentials {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion?: string;
  modelName?: string;
}

export interface AnthropicCredentials {
  apiKey: string;
  modelName: string;
}

export interface GoogleAICredentials {
  apiKey: string;
  modelName: string;
}

export interface DeepseekCredentials {
  apiKey: string;
  modelName: string;
}

export interface DatabricksCredentials {
  host: string;
  token: string;
  catalog?: string;
  schema?: string;
  warehouse?: string;
}

export interface AllCredentials {
  selectedProvider: 'azure' | 'anthropic' | 'google' | 'deepseek' | 'databricks';
  azure: AzureCredentials;
  anthropic: AnthropicCredentials;
  google: GoogleAICredentials;
  deepseek: DeepseekCredentials;
  databricks: DatabricksCredentials;
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<AllCredentials>({
    selectedProvider: 'azure',
    azure: {
      apiKey: '',
      endpoint: 'https://openai-omop-dev-01.openai.azure.com/',
      deploymentName: 'gpt-4o',
      apiVersion: '2024-12-01-preview',
      modelName: 'gpt-4o'
    },
    anthropic: {
      apiKey: '',
      modelName: 'claude-3-opus-20240229'
    },
    google: {
      apiKey: '',
      modelName: 'gemini-1.5-pro'
    },
    deepseek: {
      apiKey: '',
      modelName: 'deepseek-llm-67b-chat'
    },
    databricks: {
      host: '',
      token: '',
      catalog: '',
      schema: '',
      warehouse: ''
    }
  });

  // Load credentials from localStorage on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('apiCredentials');
    const savedDatabricksCredentials = localStorage.getItem('databricksCredentials');
    
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials(prev => ({
          ...prev,
          selectedProvider: parsedCredentials.selectedProvider || 'azure',
          azure: parsedCredentials.azure || prev.azure,
          anthropic: parsedCredentials.anthropic || prev.anthropic,
          google: parsedCredentials.google || prev.google,
          deepseek: parsedCredentials.deepseek || prev.deepseek,
        }));
      } catch (error) {
        console.error('Error parsing stored API credentials:', error);
      }
    }

    if (savedDatabricksCredentials) {
      try {
        const parsedDatabricksCredentials = JSON.parse(savedDatabricksCredentials);
        setCredentials(prev => ({
          ...prev,
          databricks: parsedDatabricksCredentials
        }));
      } catch (error) {
        console.error('Error parsing stored Databricks credentials:', error);
      }
    }
  }, []);

  // Save credentials to localStorage whenever they change
  const updateCredentials = (newCredentials: Partial<AllCredentials>) => {
    const updatedCredentials = { ...credentials, ...newCredentials };
    setCredentials(updatedCredentials);
    
    // Save AI provider credentials
    const aiCredentials = {
      selectedProvider: updatedCredentials.selectedProvider,
      azure: updatedCredentials.azure,
      anthropic: updatedCredentials.anthropic,
      google: updatedCredentials.google,
      deepseek: updatedCredentials.deepseek,
    };
    localStorage.setItem('apiCredentials', JSON.stringify(aiCredentials));
    
    // Save Databricks credentials separately
    if (newCredentials.databricks) {
      localStorage.setItem('databricksCredentials', JSON.stringify(updatedCredentials.databricks));
    }
  };

  return { 
    credentials, 
    setCredentials: updateCredentials
  };
}
