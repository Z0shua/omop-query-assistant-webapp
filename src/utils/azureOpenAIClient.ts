
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
 * Sends a chat message to Azure OpenAI focused on OMOP topics
 * @param credentials Azure credentials
 * @param userMessage The user's message
 * @returns The AI response content
 */
export async function sendOMOPChatMessage(
  credentials: AzureCredentials,
  userMessage: string
): Promise<string> {
  try {
    const config = createAzureOpenAIConfig(credentials);
    
    // System message tailored for OMOP assistance
    const systemMessage = {
      role: "system",
      content: `You are an expert assistant specializing in the OMOP Common Data Model (Observational Medical Outcomes Partnership).
Your purpose is to help users understand and work with OMOP CDM concepts, tables, relationships, and best practices. 
You can explain OMOP data structures, help troubleshoot OMOP-related issues, and provide guidance on working with medical data in the OMOP format.
You should focus exclusively on OMOP and related healthcare data topics. For non-OMOP related questions, politely explain that your expertise is limited to OMOP and healthcare data modeling.`
    };
    
    const messages = [
      systemMessage,
      { role: "user", content: userMessage }
    ];
    
    const response = await callAzureOpenAIAPI(config, messages, {
      temperature: 0.3, // Lower temperature to reduce chances of hallucination
      maxTokens: 1000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in OMOP chat:', error);
    throw new Error(`Failed to get response from AI: ${error instanceof Error ? error.message : String(error)}`);
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
      { 
        maxTokens: 10,
        temperature: 0.1 // Low temperature for more deterministic responses
      }
    );
    
    return true;
  } catch (error) {
    console.error('Azure OpenAI connection test failed:', error);
    return false;
  }
}
