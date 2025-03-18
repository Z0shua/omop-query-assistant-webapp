/**
 * Utility for converting natural language queries to SQL for OMOP CDM
 */
import { AllCredentials } from '@/hooks/use-credentials';

// System prompt for OMOP expertise with query patterns
const OMOP_SYSTEM_PROMPT = `You are an expert in medical data analysis and the OMOP Common Data Model (CDM).
Your task is to convert natural language questions into SQL queries that follow OMOP CDM best practices.

Key OMOP Query Patterns:
1. Patient Demographics:
   - Always use person table for basic demographics
   - Join with observation_period for valid time periods

2. Clinical Events:
   - Join condition_occurrence/drug_exposure/procedure_occurrence with visit_occurrence when needed
   - Use concept_id mappings from the concept table for standardized terms

3. Temporal Analysis:
   - Use start_date and end_date fields for temporal relationships
   - Consider observation_period for patient coverage

4. Vocabulary Mappings:
   - Join with concept table for human-readable terms
   - Use concept_relationship for related concepts

5. Best Practices:
   - Use appropriate table joins based on person_id and visit_occurrence_id
   - Include proper WHERE clauses for valid records
   - Optimize joins and WHERE clause ordering
   - Use appropriate aggregation functions
   - Consider data type conversions when needed

Generate only the SQL query without any explanation.
Ensure the query follows OMOP conventions and is optimized for performance.`;

// OMOP CDM core tables with detailed descriptions and relationships
const OMOP_TABLES_INFO = {
  "person": "Demographics of patients including gender, birth date, race and ethnicity. Primary key: person_id. Links to: observation_period, visit_occurrence, condition_occurrence",
  "observation_period": "Time periods during which a person is observed in the database. Foreign key: person_id references person",
  "visit_occurrence": "Records of encounters with healthcare providers or facilities. Foreign key: person_id references person",
  "condition_occurrence": "Records of diagnoses or conditions. Foreign keys: person_id references person, visit_occurrence_id references visit_occurrence",
  "drug_exposure": "Records of drugs prescribed, administered or dispensed. Foreign keys: person_id references person, visit_occurrence_id references visit_occurrence",
  "procedure_occurrence": "Records of procedures or interventions performed. Foreign keys: person_id references person, visit_occurrence_id references visit_occurrence",
  "measurement": "Records of clinical or laboratory measurements. Foreign keys: person_id references person, visit_occurrence_id references visit_occurrence",
  "observation": "Clinical facts about a patient. Foreign keys: person_id references person, visit_occurrence_id references visit_occurrence",
  "death": "Records of patient death including cause of death. Foreign key: person_id references person",
  "concept": "Standardized clinical terminology dictionary. Primary key: concept_id. Referenced by all clinical events for standard concepts",
  "vocabulary": "Reference table of all vocabularies used. Primary key: vocabulary_id. Referenced by concept table",
};

export interface NLtoSQLResult {
  success: boolean;
  sql?: string;
  explanation?: string;
  error?: string;
  debugInfo?: string;
  provider?: string;
  networkDetails?: {
    status?: number;
    statusText?: string;
    url?: string;
    corsError?: boolean;
    networkError?: boolean;
    timeoutError?: boolean;
  };
}

export async function convertNaturalLanguageToSQL(
  query: string, 
  credentials: AllCredentials
): Promise<NLtoSQLResult> {
  const provider = credentials.selectedProvider;
  
  try {
    // Format the query with OMOP context
    const formattedQuery = `
Convert the following natural language question to a SQL query for an OMOP CDM database:
Question: "${query}"

Available tables and their schemas:
${Object.entries(OMOP_TABLES_INFO).map(([table, description]) => 
  `- ${table}: ${description}`
).join('\n')}

Return a valid SQL query that follows OMOP CDM conventions and best practices. Then explain your reasoning.
`;

    // Send to appropriate AI provider based on credentials
    switch (provider) {
      case 'azure':
        return await callAzureOpenAI(formattedQuery, credentials.azure);
      case 'anthropic':
        return await callAnthropic(formattedQuery, credentials.anthropic);
      case 'google':
        return await callGoogleAI(formattedQuery, credentials.google);
      case 'deepseek':
        return await callDeepseek(formattedQuery, credentials.deepseek);
      case 'databricks':
        // For Databricks, we just test if we can connect to the host
        if (!credentials.host || !credentials.token) {
          return {
            success: false,
            debugInfo: "Missing required Databricks credentials: host and token are required."
          };
        }
        
        try {
          // Attempt to connect to the Databricks API
          const testUrl = `${credentials.host}/api/2.0/clusters/list`;
          const response = await enhancedFetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${credentials.token}`
            }
          }, 'Databricks');
          
          if (response.ok) {
            return { success: true };
          } else {
            const errorText = await response.text();
            return {
              success: false,
              debugInfo: `Databricks API error: ${response.status} ${response.statusText}\nResponse: ${errorText}`
            };
          }
        } catch (error) {
          const networkDetails = (error as any).networkDetails || {};
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          return {
            success: false,
            debugInfo: `Failed to connect to Databricks: ${errorMessage}\n\nNetwork details: ${JSON.stringify(networkDetails)}\n\nTroubleshooting tips:\n- Verify that your Databricks host URL is correct and includes the protocol (https://)\n- Ensure your personal access token is valid and has not expired\n- Check if your network allows outbound connections to Databricks\n- Verify you're not behind a firewall or VPN that might block the connection`
          };
        }
      default:
        return {
          success: false,
          error: 'Invalid AI provider selected',
          debugInfo: `Selected provider "${provider}" is not valid. Available providers: azure, anthropic, google, deepseek, databricks.`
        };
    }
  } catch (error) {
    console.error('Error in NL to SQL conversion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during query conversion',
      debugInfo: `Unhandled exception: ${JSON.stringify(error)}`
    };
  }
}

// Enhanced fetch function with better error diagnostics
async function enhancedFetch(url: string, options: RequestInit, providerName: string): Promise<Response> {
  try {
    // Start timing the request
    const startTime = Date.now();
    
    // Add timeout to fetch request using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Log response time
    const responseTime = Date.now() - startTime;
    console.log(`${providerName} API response time: ${responseTime}ms`);
    
    return response;
  } catch (error) {
    console.error(`Error fetching from ${providerName} API:`, error);
    
    // Enhanced error diagnostics
    let detailedError = new Error(`Failed to connect to ${providerName} API`);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // This typically happens for network errors (offline, DNS failure, CORS, etc.)
      detailedError = new Error(`Network error connecting to ${providerName} API. This could be due to CORS restrictions, network connectivity issues, or the API endpoint being unavailable.`);
      (detailedError as any).networkDetails = {
        url,
        networkError: true,
        corsError: true // Possible CORS error
      };
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      detailedError = new Error(`Request to ${providerName} API timed out after 30 seconds`);
      (detailedError as any).networkDetails = {
        url,
        timeoutError: true
      };
    }
    
    // Add original error information
    (detailedError as any).originalError = error;
    throw detailedError;
  }
}

// Azure OpenAI implementation
async function callAzureOpenAI(query: string, credentials: AllCredentials['azure']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Azure OpenAI with:", { endpoint: credentials.endpoint, deploymentName: credentials.deploymentName });
    
    if (!credentials.apiKey || !credentials.endpoint || !credentials.deploymentName) {
      return {
        success: false,
        error: "Missing Azure OpenAI credentials",
        debugInfo: `Required credentials missing: ${!credentials.apiKey ? 'apiKey ' : ''}${!credentials.endpoint ? 'endpoint ' : ''}${!credentials.deploymentName ? 'deploymentName' : ''}`,
        provider: 'Azure OpenAI'
      };
    }
    
    // Make actual API call to Azure OpenAI
    const requestBody = JSON.stringify({
      messages: [
        { role: "system", content: OMOP_SYSTEM_PROMPT },
        { role: "user", content: query }
      ],
      temperature: 0.3,
      max_tokens: 800
    });
    
    const apiUrl = `${credentials.endpoint}/openai/deployments/${credentials.deploymentName}/chat/completions?api-version=${credentials.apiVersion}`;
    console.log("Azure API URL:", apiUrl);
    
    const response = await enhancedFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': credentials.apiKey
      },
      body: requestBody
    }, 'Azure OpenAI');
    
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    
    // Always capture the response text, even if it's not valid JSON
    let responseText;
    try {
      responseText = await response.text();
    } catch (error) {
      responseText = `Failed to read response text: ${error}`;
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: "Failed to parse error response" };
      }
      
      console.error("Azure OpenAI API error:", errorData);
      
      return {
        success: false,
        error: `Azure OpenAI API error: ${response.status} ${response.statusText}`,
        debugInfo: `Status: ${responseStatus} ${responseStatusText}\nResponse: ${responseText}\nRequest URL: ${apiUrl}`,
        provider: 'Azure OpenAI',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: apiUrl
        }
      };
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      return {
        success: false,
        error: "Failed to parse Azure OpenAI response",
        debugInfo: `Status: ${responseStatus} ${responseStatusText}\nResponse: ${responseText}\nParse error: ${error}`,
        provider: 'Azure OpenAI',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: apiUrl
        }
      };
    }
    
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: "No content returned from Azure OpenAI",
        debugInfo: `Full response: ${JSON.stringify(responseData)}`,
        provider: 'Azure OpenAI',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: apiUrl
        }
      };
    }
    
    // Parse the response to extract SQL query and explanation
    const { sql, explanation } = parseAIResponse(content);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Azure OpenAI'
    };
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    
    const networkDetails = (error as any).networkDetails || {};
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Azure OpenAI API',
      debugInfo: `Exception details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\nTroubleshooting tips:\n- Verify that your Azure OpenAI endpoint is correct and accessible\n- Check if your API key is valid and has appropriate permissions\n- Ensure your deployment name exists in your Azure OpenAI resource\n- Verify your network allows outbound connections to Azure OpenAI endpoints\n- Check if you're behind a corporate firewall or VPN that might block the connection`,
      provider: 'Azure OpenAI',
      networkDetails
    };
  }
}

// Anthropic implementation
async function callAnthropic(query: string, credentials: AllCredentials['anthropic']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Anthropic with model:", credentials.modelName);
    
    if (!credentials.apiKey) {
      return {
        success: false,
        error: "Missing Anthropic API key",
        provider: 'Anthropic Claude'
      };
    }
    
    // Make actual API call to Anthropic
    const response = await enhancedFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': credentials.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: credentials.modelName,
        messages: [
          { role: "user", content: `${OMOP_SYSTEM_PROMPT}\n\n${query}` }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    }, 'Anthropic');
    
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: "Failed to parse error response" };
      }
      
      console.error("Anthropic API error:", errorData);
      return {
        success: false,
        error: `Anthropic API error: ${response.status} ${response.statusText}`,
        debugInfo: `Status: ${responseStatus} ${responseStatusText}\nResponse: ${errorText}`,
        provider: 'Anthropic Claude',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: 'https://api.anthropic.com/v1/messages'
        }
      };
    }
    
    const responseData = await response.json();
    const content = responseData.content?.[0]?.text;
    
    if (!content) {
      return {
        success: false,
        error: "No content returned from Anthropic",
        debugInfo: `Full response: ${JSON.stringify(responseData)}`,
        provider: 'Anthropic Claude',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: 'https://api.anthropic.com/v1/messages'
        }
      };
    }
    
    // Parse the response to extract SQL query and explanation
    const { sql, explanation } = parseAIResponse(content);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Anthropic Claude'
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    
    const networkDetails = (error as any).networkDetails || {};
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Anthropic API',
      debugInfo: `Exception details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\nTroubleshooting tips:\n- Verify that your Anthropic API key is valid and has not expired\n- Ensure your network allows outbound connections to Anthropic API endpoints\n- Check if you're behind a corporate firewall or VPN that might block the connection\n- Confirm that the Anthropic service is currently operational`,
      provider: 'Anthropic Claude',
      networkDetails
    };
  }
}

// Google AI implementation
async function callGoogleAI(query: string, credentials: AllCredentials['google']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Google AI with model:", credentials.modelName);
    
    if (!credentials.apiKey) {
      return {
        success: false,
        error: "Missing Google AI API key",
        provider: 'Google AI'
      };
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${credentials.modelName}:generateContent?key=${credentials.apiKey}`;
    
    // Make actual API call to Google AI
    const response = await enhancedFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${OMOP_SYSTEM_PROMPT}\n\n${query}` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      })
    }, 'Google AI');
    
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: "Failed to parse error response" };
      }
      
      console.error("Google AI API error:", errorData);
      return {
        success: false,
        error: `Google AI API error: ${response.status} ${response.statusText}`,
        debugInfo: `Status: ${responseStatus} ${responseStatusText}\nResponse: ${errorText}\nRequest URL: ${apiUrl}`,
        provider: 'Google AI',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: apiUrl
        }
      };
    }
    
    const responseData = await response.json();
    const content = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return {
        success: false,
        error: "No content returned from Google AI",
        debugInfo: `Full response: ${JSON.stringify(responseData)}`,
        provider: 'Google AI',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: apiUrl
        }
      };
    }
    
    // Parse the response to extract SQL query and explanation
    const { sql, explanation } = parseAIResponse(content);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Google AI'
    };
  } catch (error) {
    console.error('Google AI API error:', error);
    
    const networkDetails = (error as any).networkDetails || {};
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Google AI API',
      debugInfo: `Exception details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\nTroubleshooting tips:\n- Verify that your Google AI API key is valid and has appropriate permissions\n- Ensure the model name you've specified exists and is accessible with your API key\n- Check if your network allows outbound connections to Google API endpoints\n- Verify you're not exceeding Google AI API rate limits\n- Check if you're behind a corporate firewall or VPN that might block the connection`,
      provider: 'Google AI',
      networkDetails
    };
  }
}

// Deepseek implementation
async function callDeepseek(query: string, credentials: AllCredentials['deepseek']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Deepseek with model:", credentials.modelName);
    
    if (!credentials.apiKey) {
      return {
        success: false,
        error: "Missing Deepseek API key",
        provider: 'Deepseek'
      };
    }
    
    // Make actual API call to Deepseek
    const response = await enhancedFetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model: credentials.modelName,
        messages: [
          { role: "system", content: OMOP_SYSTEM_PROMPT },
          { role: "user", content: query }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    }, 'Deepseek');
    
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: "Failed to parse error response" };
      }
      
      console.error("Deepseek API error:", errorData);
      return {
        success: false,
        error: `Deepseek API error: ${response.status} ${response.statusText}`,
        debugInfo: `Status: ${responseStatus} ${responseStatusText}\nResponse: ${errorText}`,
        provider: 'Deepseek',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: 'https://api.deepseek.com/v1/chat/completions'
        }
      };
    }
    
    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: "No content returned from Deepseek",
        debugInfo: `Full response: ${JSON.stringify(responseData)}`,
        provider: 'Deepseek',
        networkDetails: {
          status: responseStatus,
          statusText: responseStatusText,
          url: 'https://api.deepseek.com/v1/chat/completions'
        }
      };
    }
    
    // Parse the response to extract SQL query and explanation
    const { sql, explanation } = parseAIResponse(content);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Deepseek'
    };
  } catch (error) {
    console.error('Deepseek API error:', error);
    
    const networkDetails = (error as any).networkDetails || {};
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Deepseek API',
      debugInfo: `Exception details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\nTroubleshooting tips:\n- Verify that your Deepseek API key is valid and has not expired\n- Ensure your network allows outbound connections to Deepseek API endpoints\n- Check if you're behind a corporate firewall or VPN that might block the connection\n- Confirm that the Deepseek service is currently operational\n- Verify the model name specified is available with your subscription`,
      provider: 'Deepseek',
      networkDetails
    };
  }
}

// Helper function to parse AI response and separate SQL from explanation
function parseAIResponse(content: string): { sql: string, explanation: string } {
  // For demo purposes, we'll generate mock responses
  // In a real implementation, you would parse the actual AI response
  
  // Try to extract SQL code that's between SQL code blocks or after "SQL:" markers
  let sql = '';
  let explanation = '';
  
  // Check for SQL code blocks
  const sqlBlockMatch = content.match(/```sql\s+([\s\S]*?)\s+```/i);
  if (sqlBlockMatch) {
    sql = sqlBlockMatch[1].trim();
    
    // Everything after the last SQL block is likely explanation
    const lastSqlBlockEnd = content.lastIndexOf('```');
    if (lastSqlBlockEnd !== -1 && lastSqlBlockEnd + 3 < content.length) {
      explanation = content.substring(lastSqlBlockEnd + 3).trim();
    } else {
      // If no clear explanation after SQL block, use everything before first SQL block
      const firstSqlBlockStart = content.indexOf('```sql');
      if (firstSqlBlockStart > 0) {
        explanation = content.substring(0, firstSqlBlockStart).trim();
      }
    }
  } else {
    // Try to find SQL by looking for "SQL:" marker
    const sqlMarkerMatch = content.match(/SQL:\s*([\s\S]*?)(?=\n\n|$)/i);
    if (sqlMarkerMatch) {
      sql = sqlMarkerMatch[1].trim();
      
      // Everything after the SQL and a blank line is likely explanation
      const parts = content.split(/\n\s*\n/);
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes(sql)) {
          explanation = parts.slice(i + 1).join('\n\n').trim();
          break;
        }
      }
      
      if (!explanation && parts.length > 0) {
        explanation = parts[0].includes('SQL:') 
          ? 'No detailed explanation provided.' 
          : parts[0].trim();
      }
    } else {
      // No clear SQL format, try to use heuristics
      const lines = content.split('\n');
      const sqlLines = [];
      const explLines = [];
      
      let inSqlSection = false;
      for (const line of lines) {
        // SQL queries usually start with SELECT, WITH, etc.
        if (!inSqlSection && 
            (line.trim().toUpperCase().startsWith('SELECT') || 
             line.trim().toUpperCase().startsWith('WITH'))) {
          inSqlSection = true;
        }
        
        if (inSqlSection) {
          sqlLines.push(line);
          // If we see a line ending with semicolon followed by a blank line,
          // assume SQL section is done
          if (line.trim().endsWith(';') || 
              line.trim().toLowerCase().includes('limit ')) {
            inSqlSection = false;
          }
        } else {
          explLines.push(line);
        }
      }
      
      sql = sqlLines.join('\n').trim();
      explanation = explLines.join('\n').trim();
      
      // If we couldn't extract SQL, use entire content as explanation
      if (!sql) {
        explanation = content;
        sql = "-- Could not extract SQL query from AI response";
      }
    }
  }
  
  // Format explanation for HTML display
  explanation = formatExplanation(explanation);
  
  return { sql, explanation };
}

// Format explanation for HTML display
function formatExplanation(text: string): string {
  // Simple formatting for demo purposes
  let htmlFormatted = '<p>' + text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
  
  // Convert markdown-style lists to HTML lists
  htmlFormatted = htmlFormatted.replace(/<p>(\s*[-*]\s+.*?)<\/p>/g, '<ul><li>$1</li></ul>');
  htmlFormatted = htmlFormatted.replace(/<br>\s*[-*]\s+/g, '</li><li>');
  
  // Add code styling
  htmlFormatted = htmlFormatted.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return htmlFormatted;
}

// Mock functions for connection testing
export async function testProviderConnection(
  provider: string, 
  credentials: any
): Promise<{success: boolean, debugInfo?: string}> {
  console.log(`Testing connection to ${provider} with credentials:`, credentials);
  
  try {
    // Simple test prompt
    const testPrompt = "Convert this to SQL: How many patients are in the database?";
    
    let result: NLtoSQLResult;
    
    switch (provider) {
      case 'azure':
        result = await callAzureOpenAI(testPrompt, credentials);
        break;
      case 'anthropic':
        result = await callAnthropic(testPrompt, credentials);
        break;
      case 'google':
        result = await callGoogleAI(testPrompt, credentials);
        break;
      case 'deepseek':
        result = await callDeepseek(testPrompt, credentials);
        break;
      case 'databricks':
        // For Databricks, we just test if we can connect to the host
        if (!credentials.host || !credentials.token) {
          return {
            success: false,
            debugInfo: "Missing required Databricks credentials: host and token are required."
          };
        }
        
        try {
          // Attempt to connect to the Databricks API
          const testUrl = `${credentials.host}/api/2.0/clusters/list`;
          const response = await enhancedFetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${credentials.token}`
            }
          }, 'Databricks');
          
          if (response.ok) {
            return { success: true };
          } else {
            const errorText = await response.text();
            return {
              success: false,
              debugInfo: `Databricks API error: ${response.status} ${response.statusText}\nResponse: ${errorText}`
            };
          }
        } catch (error) {
          const networkDetails = (error as any).networkDetails || {};
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          return {
            success: false,
            debugInfo: `Failed to connect to Databricks: ${errorMessage}\n\nNetwork details: ${JSON.stringify(networkDetails)}\n\nTroubleshooting tips:\n- Verify that your Databricks host URL is correct and includes the protocol (https://)\n- Ensure your personal access token is valid and has not expired\n- Check if your network allows outbound connections to Databricks\n- Verify you're not behind a firewall or VPN that might block the connection`
          };
        }
      default:
        return {
          success: false,
          debugInfo: `Invalid provider: ${provider}`
        };
    }
    
    // Enhance debug info with network details if available
    let enhancedDebugInfo = result.success ? undefined : (result.debugInfo || result.error);
    
    if (!result.success && result.networkDetails) {
      enhancedDebugInfo = `${enhancedDebugInfo || ''}\n\nNetwork details: ${JSON.stringify(result.networkDetails, null, 2)}`;
    }
    
    return {
      success: result.success,
      debugInfo: enhancedDebugInfo
    };
  } catch (error) {
    console.error(`Error testing ${provider} connection:`, error);
    return {
      success: false,
      debugInfo: error instanceof Error 
        ? `${error.name}: ${error.message}\n${error.stack}`
        : `Unknown error: ${JSON.stringify(error)}`
    };
  }
}
