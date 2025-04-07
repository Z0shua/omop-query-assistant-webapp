import { AllCredentials } from '@/hooks/use-credentials';
import { createAzureOpenAIConfig, callAzureOpenAIAPI } from '@/utils/azureOpenAIClient';
import { NLtoSQLResult } from '@/utils/nlToSqlConverter';

// System prompt for OMOP expertise (same as in nlToSqlConverter.ts)
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

// OMOP CDM core tables with descriptions (same as in nlToSqlConverter.ts)
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

/**
 * Converts a natural language query to SQL using Azure OpenAI
 * @param query The natural language query to convert
 * @param credentials The credentials to use for the conversion
 * @returns The conversion result
 */
export async function convertNLtoSQLWithAzure(
  query: string,
  credentials: AllCredentials
): Promise<NLtoSQLResult> {
  try {
    const azureCredentials = credentials.azure;
    
    if (!azureCredentials.apiKey || !azureCredentials.endpoint || !azureCredentials.deploymentName) {
      return {
        success: false,
        error: "Missing Azure OpenAI credentials",
        debugInfo: `Required Azure credentials missing: ${!azureCredentials.apiKey ? 'apiKey ' : ''}${!azureCredentials.endpoint ? 'endpoint ' : ''}${!azureCredentials.deploymentName ? 'deploymentName' : ''}`,
        provider: 'Azure OpenAI'
      };
    }
    
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

    // Create the Azure OpenAI config
    const config = createAzureOpenAIConfig(azureCredentials);
    
    // Call the Azure OpenAI API
    const messages = [
      { role: "system", content: OMOP_SYSTEM_PROMPT },
      { role: "user", content: formattedQuery }
    ];
    
    console.log("Calling Azure OpenAI with config:", config);
    
    const response = await callAzureOpenAIAPI(config, messages, {
      temperature: 0.3,
      maxTokens: 800
    });
    
    const content = response.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: "No content returned from Azure OpenAI",
        debugInfo: `Full response: ${JSON.stringify(response)}`,
        provider: 'Azure OpenAI'
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
    console.error('Azure OpenAI conversion error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Azure OpenAI API',
      debugInfo: `Exception details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\nTroubleshooting tips:\n- Verify that your Azure OpenAI endpoint is correct and accessible\n- Check if your API key is valid and has appropriate permissions\n- Ensure your deployment name exists in your Azure OpenAI resource\n- Verify your network allows outbound connections to Azure OpenAI endpoints\n- Check if you're behind a corporate firewall or VPN that might block the connection`,
      provider: 'Azure OpenAI'
    };
  }
}

/**
 * Helper function to parse AI response and separate SQL from explanation
 * @param content The content from the AI response
 * @returns The SQL query and explanation
 */
function parseAIResponse(content: string): { sql: string, explanation: string } {
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

/**
 * Format explanation for HTML display
 * @param text The explanation text to format
 * @returns The formatted explanation
 */
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
