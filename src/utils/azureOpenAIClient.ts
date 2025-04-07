
/**
 * Azure OpenAI client configuration
 * This is a TypeScript equivalent of the Python code:
 * 
 * import os
 * from openai import AzureOpenAI
 * 
 * endpoint = "https://openai-omop-dev-01.openai.azure.com/"
 * model_name = "gpt-4o"
 * deployment = "gpt-4o"
 * 
 * subscription_key = ##in evn file/to be typed in
 * api_version = "2024-12-01-preview"
 * 
 * client = AzureOpenAI(
 *     api_version=api_version,
 *     azure_endpoint=endpoint,
 *     api_key=subscription_key,
 * )
 */

import { AzureCredentials } from '@/hooks/use-credentials';

export interface AzureOpenAIConfig {
  apiVersion: string;
  azureEndpoint: string;
  apiKey: string;
  deploymentName: string;
  modelName: string;
}

/**
 * Creates an Azure OpenAI configuration object
 * @param credentials The Azure credentials from the useCredentials hook
 * @returns A configuration object that can be used for Azure OpenAI API calls
 */
export function createAzureOpenAIConfig(credentials: AzureCredentials): AzureOpenAIConfig {
  return {
    apiVersion: credentials.apiVersion || '2024-12-01-preview',
    azureEndpoint: credentials.endpoint || 'https://openai-omop-dev-01.openai.azure.com/',
    apiKey: credentials.apiKey,
    deploymentName: credentials.deploymentName || 'gpt-4o',
    modelName: credentials.modelName || 'gpt-4o'
  };
}

/**
 * Makes a request to the Azure OpenAI API
 * @param config The Azure OpenAI configuration
 * @param messages The messages to send to the API
 * @param options Additional options for the API call
 * @returns The API response
 */
export async function callAzureOpenAIAPI(
  config: AzureOpenAIConfig,
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
  } = {}
) {
  const apiUrl = `${config.azureEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
  
  const requestBody = JSON.stringify({
    messages,
    model: config.modelName,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 800,
    top_p: options.topP ?? 1,
    frequency_penalty: options.frequencyPenalty ?? 0,
    presence_penalty: options.presencePenalty ?? 0,
    stop: options.stop
  });
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: requestBody
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Azure OpenAI API:', error);
    throw error;
  }
}

/**
 * Test the connection to Azure OpenAI
 * @param credentials The Azure credentials to test
 * @returns A promise that resolves to true if the connection is successful
 */
export async function testAzureOpenAIConnection(credentials: AzureCredentials): Promise<boolean> {
  try {
    const config = createAzureOpenAIConfig(credentials);
    
    // Make a simple test call to verify the connection
    await callAzureOpenAIAPI(
      config,
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ],
      { maxTokens: 10 }
    );
    
    return true;
  } catch (error) {
    console.error('Azure OpenAI connection test failed:', error);
    return false;
  }
}
