
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
  provider?: string;
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
      default:
        return {
          success: false,
          error: 'Invalid AI provider selected',
        };
    }
  } catch (error) {
    console.error('Error in NL to SQL conversion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during query conversion',
    };
  }
}

// Azure OpenAI implementation
async function callAzureOpenAI(query: string, credentials: AllCredentials['azure']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Azure OpenAI with:", { endpoint: credentials.endpoint, deploymentName: credentials.deploymentName });
    
    // In a real implementation, this would call the Azure OpenAI API
    // For demonstration purposes, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse the response to extract SQL query and explanation
    const sql = generateDemoSQL(query);
    const explanation = generateDemoExplanation(query);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Azure OpenAI'
    };
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Azure OpenAI API',
      provider: 'Azure OpenAI'
    };
  }
}

// Anthropic implementation
async function callAnthropic(query: string, credentials: AllCredentials['anthropic']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Anthropic with model:", credentials.modelName);
    
    // In a real implementation, this would call the Anthropic API
    // For demonstration purposes, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse the response to extract SQL query and explanation
    const sql = generateDemoSQL(query);
    const explanation = generateDemoExplanation(query);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Anthropic Claude'
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Anthropic API',
      provider: 'Anthropic Claude'
    };
  }
}

// Google AI implementation
async function callGoogleAI(query: string, credentials: AllCredentials['google']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Google AI with model:", credentials.modelName);
    
    // In a real implementation, this would call the Google AI API
    // For demonstration purposes, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse the response to extract SQL query and explanation
    const sql = generateDemoSQL(query);
    const explanation = generateDemoExplanation(query);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Google AI'
    };
  } catch (error) {
    console.error('Google AI API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Google AI API',
      provider: 'Google AI'
    };
  }
}

// Deepseek implementation
async function callDeepseek(query: string, credentials: AllCredentials['deepseek']): Promise<NLtoSQLResult> {
  try {
    console.log("Calling Deepseek with model:", credentials.modelName);
    
    // In a real implementation, this would call the Deepseek API
    // For demonstration purposes, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse the response to extract SQL query and explanation
    const sql = generateDemoSQL(query);
    const explanation = generateDemoExplanation(query);
    
    return {
      success: true,
      sql,
      explanation,
      provider: 'Deepseek'
    };
  } catch (error) {
    console.error('Deepseek API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling Deepseek API',
      provider: 'Deepseek'
    };
  }
}

// Demo SQL generation based on query type (for demonstration purposes)
function generateDemoSQL(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  
  if (lowercaseQuery.includes('gender')) {
    return `SELECT gender_concept_id, concept_name as gender, COUNT(*) as count
FROM person
JOIN concept ON person.gender_concept_id = concept.concept_id
GROUP BY gender_concept_id, concept_name
ORDER BY count DESC`;
  } 
  else if (lowercaseQuery.includes('age')) {
    return `WITH age_calc AS (
  SELECT
    FLOOR((JULIANDAY('now') - JULIANDAY(birth_datetime)) / 365.25) as age
  FROM person
)
SELECT
  CASE
    WHEN age < 18 THEN '0-17'
    WHEN age BETWEEN 18 AND 34 THEN '18-34'
    WHEN age BETWEEN 35 AND 49 THEN '35-49'
    WHEN age BETWEEN 50 AND 64 THEN '50-64'
    WHEN age >= 65 THEN '65+'
  END as age_group,
  COUNT(*) as count
FROM age_calc
GROUP BY age_group
ORDER BY age_group`;
  } 
  else if (lowercaseQuery.includes('diagnoses') || lowercaseQuery.includes('conditions')) {
    return `SELECT c.concept_name as diagnosis, COUNT(*) as count
FROM condition_occurrence co
JOIN concept c ON co.condition_concept_id = c.concept_id
GROUP BY c.concept_name
ORDER BY count DESC
LIMIT 10`;
  } 
  else if (lowercaseQuery.includes('diabetes')) {
    return `SELECT count(distinct p.person_id) as patient_count
FROM person p
JOIN condition_occurrence co ON p.person_id = co.person_id
JOIN concept c ON co.condition_concept_id = c.concept_id
WHERE c.concept_name LIKE '%Type 2 diabetes%'
  AND c.domain_id = 'Condition'`;
  }
  else if (lowercaseQuery.includes('medications') || lowercaseQuery.includes('drugs')) {
    return `SELECT c.concept_name as medication_name, COUNT(DISTINCT de.person_id) as patient_count
FROM drug_exposure de
JOIN concept c ON de.drug_concept_id = c.concept_id
WHERE c.domain_id = 'Drug'
GROUP BY c.concept_name
ORDER BY patient_count DESC
LIMIT 20`;
  }
  else {
    return `-- Generated SQL query for: ${query}
SELECT 
  p.person_id,
  p.year_of_birth,
  c.concept_name as gender,
  COUNT(DISTINCT co.condition_occurrence_id) as condition_count
FROM 
  person p
JOIN 
  concept c ON p.gender_concept_id = c.concept_id
LEFT JOIN 
  condition_occurrence co ON p.person_id = co.person_id
GROUP BY 
  p.person_id, p.year_of_birth, c.concept_name
ORDER BY 
  condition_count DESC
LIMIT 20`;
  }
}

// Demo explanation generation (for demonstration purposes)
function generateDemoExplanation(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  
  if (lowercaseQuery.includes('gender')) {
    return `
<p>This query analyzes the gender distribution of patients in the OMOP database.</p>
<p>I used:</p>
<ul>
  <li>The <code>person</code> table which contains patient demographics including gender</li>
  <li>A join with the <code>concept</code> table to get human-readable gender descriptions instead of concept IDs</li>
  <li>Grouped by both concept ID and name to ensure accurate counts</li>
  <li>Ordered by count to show most frequent genders first</li>
</ul>
<p>This follows OMOP best practices by using standardized concepts for gender representation.</p>
`;
  } 
  else if (lowercaseQuery.includes('age')) {
    return `
<p>This query analyzes the age distribution of patients by grouping them into standard age brackets.</p>
<p>I implemented this using:</p>
<ul>
  <li>A Common Table Expression (CTE) to calculate each patient's age from birth_datetime</li>
  <li>The JULIANDAY function to handle date arithmetic correctly</li>
  <li>A CASE statement to group patients into standard age brackets (0-17, 18-34, 35-49, 50-64, 65+)</li>
  <li>GROUP BY and COUNT to get the number of patients in each bracket</li>
</ul>
<p>This approach follows clinical research conventions for age grouping and ensures that each patient is counted exactly once.</p>
`;
  } 
  else if (lowercaseQuery.includes('diagnoses') || lowercaseQuery.includes('conditions')) {
    return `
<p>This query extracts the top 10 most common diagnoses in the database.</p>
<p>Key implementation details:</p>
<ul>
  <li>Used the <code>condition_occurrence</code> table which stores all patient conditions</li>
  <li>Joined with <code>concept</code> table to translate condition concept IDs to human-readable names</li>
  <li>Grouped by concept name to count unique diagnoses</li>
  <li>Ordered by count descending to show most common conditions first</li>
  <li>Limited results to top 10 for clarity</li>
</ul>
<p>This query follows OMOP best practices by using the standard relationship between condition_occurrence and concept tables.</p>
`;
  }
  else if (lowercaseQuery.includes('diabetes')) {
    return `
<p>This query counts patients with Type 2 diabetes in the database.</p>
<p>Implementation approach:</p>
<ul>
  <li>Start with the <code>person</code> table to get unique patients</li>
  <li>Join to <code>condition_occurrence</code> to find their conditions</li>
  <li>Join to <code>concept</code> to get standardized condition names</li>
  <li>Filter for Type 2 diabetes using LIKE operator for flexible matching</li>
  <li>Added domain_id = 'Condition' to ensure we're looking at diagnosis concepts</li>
  <li>Count distinct person_ids to avoid counting patients multiple times</li>
</ul>
<p>This query uses OMOP's standardized vocabulary approach while allowing for variations in how Type 2 diabetes might be recorded.</p>
`;
  }
  else if (lowercaseQuery.includes('medications') || lowercaseQuery.includes('drugs')) {
    return `
<p>This query identifies the most commonly prescribed medications and the number of patients receiving each.</p>
<p>Key query components:</p>
<ul>
  <li>Used the <code>drug_exposure</code> table which contains all medication records</li>
  <li>Joined with <code>concept</code> table to get standardized medication names</li>
  <li>Ensured only drug concepts are included with domain_id filter</li>
  <li>Counted distinct patients per medication to avoid counting multiple prescriptions</li>
  <li>Ordered by patient count to show most widely used medications first</li>
  <li>Limited to 20 results for readability</li>
</ul>
<p>This implementation follows OMOP CDM best practices for medication analysis by using standardized concepts and avoiding duplicate counting.</p>
`;
  }
  else {
    return `
<p>I've analyzed your query: "${query}"</p>
<p>The SQL retrieves patient demographic information along with the count of distinct medical conditions for each patient. Here's what it's doing:</p>
<ol>
  <li>Selecting basic patient information (ID, birth year) from the <code>person</code> table</li>
  <li>Joining with the <code>concept</code> table to get the human-readable gender description</li>
  <li>Left joining with <code>condition_occurrence</code> to count conditions</li>
  <li>Grouping by patient to get one row per person</li>
  <li>Ordering by condition count to show patients with the most conditions first</li>
  <li>Limiting results to 20 patients</li>
</ol>
<p>This follows OMOP best practices by using the standard person-to-condition relationship and proper concept lookups for standardized terminologies.</p>
`;
  }
}
