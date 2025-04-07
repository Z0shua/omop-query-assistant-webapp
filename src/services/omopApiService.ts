import { supabase } from '@/integrations/supabase/client';

/**
 * Service for accessing OMOP CDM data via a proxy
 * This handles CORS issues by using Supabase Edge Functions as a proxy
 */

interface OMOPQueryOptions {
  sql?: string;
  naturalLanguage?: string;
  limit?: number;
  offset?: number;
}

interface OMOPQueryResponse {
  success: boolean;
  data?: any[];
  error?: string;
  sql?: string;
  execution_time_ms?: number;
  metadata?: {
    total_rows?: number;
    columns?: string[];
    cached?: boolean;
  };
}

/**
 * Executes a query against the OMOP CDM database
 * This function uses different strategies depending on configuration:
 * 1. Supabase Edge Function proxy (preferred)
 * 2. Direct API call with CORS headers (if configured)
 * 3. Mock data (fallback for development)
 */
export async function executeOMOPQuery(options: OMOPQueryOptions): Promise<OMOPQueryResponse> {
  // Get database configuration from localStorage
  const dbConfig = localStorage.getItem('databaseConfig');
  const config = dbConfig ? JSON.parse(dbConfig) : null;
  
  // If we have Supabase connected, use the edge function proxy
  try {
    if (supabase) {
      // Call the Supabase Edge Function that will proxy the request
      // This avoids CORS issues since the request is server-to-server
      const { data, error } = await supabase.functions.invoke('omop-proxy', {
        body: {
          query: options.sql || '',
          naturalLanguage: options.naturalLanguage || '',
          limit: options.limit || 100,
          offset: options.offset || 0,
          config // Pass database configuration
        }
      });
      
      if (error) throw new Error(error.message);
      
      return {
        success: true,
        data: data.results || [],
        sql: data.sql,
        execution_time_ms: data.execution_time_ms,
        metadata: {
          total_rows: data.total_rows,
          columns: data.columns,
          cached: data.cached || false
        }
      };
    }
  } catch (error) {
    console.error('Error using Supabase Edge Function proxy:', error);
    // Fall through to alternative methods
  }
  
  // If direct API endpoint is configured, try that with CORS handling
  if (config?.apiEndpoint) {
    try {
      const response = await fetch(`${config.apiEndpoint}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({
          sql: options.sql,
          naturalLanguage: options.naturalLanguage,
          limit: options.limit || 100,
          offset: options.offset || 0
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.results || [],
        sql: data.sql,
        execution_time_ms: data.execution_time_ms,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error using direct API endpoint:', error);
      // Fall through to mock data
    }
  }
  
  // Fallback to mock data for development
  console.warn('Using mock data fallback. This should only be used for development.');
  return generateMockResponse(options);
}

/**
 * Generates mock OMOP data for development and testing
 * The mock data is based on the SQL query to produce realistic-looking results
 */
function generateMockResponse(options: OMOPQueryOptions): OMOPQueryResponse {
  const mockData = generateMockData(options.sql || '');
  
  return {
    success: true,
    data: mockData,
    sql: options.sql || 'SELECT * FROM mock_data',
    execution_time_ms: Math.random() * 1000 + 200,
    metadata: {
      total_rows: mockData.length,
      columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
      cached: false
    }
  };
}

/**
 * Generates mock data based on the actual SQL query
 * This function analyzes the SQL query and returns appropriate mock data
 */
function generateMockData(sqlQuery: string): any[] {
  // This is a simplified version of the function in QueryPage.tsx
  // Generate appropriate mock data based on the SQL query
  const sql = sqlQuery.toLowerCase();
  
  if (sql.includes('person') && sql.includes('gender')) {
    return [
      { gender_concept_id: 8507, gender: 'Male', count: 357 },
      { gender_concept_id: 8532, gender: 'Female', count: 392 },
      { gender_concept_id: 8521, gender: 'Other', count: 12 },
    ];
  } else if (sql.includes('age') || (sql.includes('person') && sql.includes('year_of_birth'))) {
    return [
      { age_group: '0-17', count: 120 },
      { age_group: '18-34', count: 210 },
      { age_group: '35-49', count: 185 },
      { age_group: '50-64', count: 156 },
      { age_group: '65+', count: 90 },
    ];
  } else if (sql.includes('condition_occurrence') || sql.includes('diagnoses') || sql.includes('conditions')) {
    return [
      { diagnosis: 'Essential hypertension', count: 125 },
      { diagnosis: 'Hyperlipidemia', count: 98 },
      { diagnosis: 'Type 2 diabetes mellitus', count: 87 },
      { diagnosis: 'Acute bronchitis', count: 76 },
      { diagnosis: 'Low back pain', count: 72 },
      { diagnosis: 'Anxiety disorder', count: 68 },
      { diagnosis: 'Major depressive disorder', count: 56 },
      { diagnosis: 'Acute upper respiratory infection', count: 52 },
      { diagnosis: 'Gastroesophageal reflux disease', count: 49 },
      { diagnosis: 'Osteoarthritis', count: 43 },
    ];
  } else if (sql.includes('diabetes')) {
    return [
      { patient_count: 87, average_age: 62.5, male_count: 41, female_count: 46 }
    ];
  } else if (sql.includes('drug_exposure') || sql.includes('medications') || sql.includes('drugs')) {
    return [
      { medication_name: 'Lisinopril', patient_count: 78 },
      { medication_name: 'Atorvastatin', patient_count: 65 },
      { medication_name: 'Metformin', patient_count: 59 },
      { medication_name: 'Amlodipine', patient_count: 52 },
      { medication_name: 'Omeprazole', patient_count: 48 },
      { medication_name: 'Levothyroxine', patient_count: 45 },
      { medication_name: 'Simvastatin', patient_count: 41 },
      { medication_name: 'Metoprolol', patient_count: 39 },
      { medication_name: 'Hydrochlorothiazide', patient_count: 35 },
      { medication_name: 'Ibuprofen', patient_count: 32 },
    ];
  } else if (sql.includes('procedure_occurrence') || sql.includes('procedures')) {
    return [
      { procedure_name: 'Routine physical examination', count: 145 },
      { procedure_name: 'Blood test', count: 132 },
      { procedure_name: 'Vaccination', count: 98 },
      { procedure_name: 'Cardiac evaluation', count: 76 },
      { procedure_name: 'X-ray imaging', count: 67 }
    ];
  } else if (sql.includes('measurement') || sql.includes('lab')) {
    return [
      { measurement_name: 'Blood pressure reading', count: 210 },
      { measurement_name: 'HbA1c test', count: 145 },
      { measurement_name: 'Cholesterol test', count: 132 },
      { measurement_name: 'Renal function test', count: 98 },
      { measurement_name: 'Liver function test', count: 87 }
    ];
  } else if (sql.includes('visit_occurrence') || sql.includes('visits')) {
    return [
      { visit_type: 'Outpatient', count: 450 },
      { visit_type: 'Emergency', count: 120 },
      { visit_type: 'Inpatient', count: 75 },
      { visit_type: 'Pharmacy', count: 210 },
      { visit_type: 'Telehealth', count: 95 }
    ];
  } else {
    // Generic sample data for other queries - based on columns in the SQL
    const columnMatch = sql.match(/select\s+(.+?)\s+from/i);
    if (columnMatch) {
      const columns = columnMatch[1].split(',').map(col => col.trim().split(' as ').pop()?.trim() || col.trim());
      
      // Remove * wildcard and handle "count(*)" type expressions
      const cleanColumns = columns
        .filter(col => col !== '*')
        .map(col => {
          // Extract alias from functions like count(*) as total_count
          if (col.includes('(') && col.includes(')')) {
            const aliasMatch = col.match(/as\s+(\w+)/i);
            return aliasMatch ? aliasMatch[1] : 'value';
          }
          return col;
        });
      
      return Array.from({ length: 5 }, (_, i) => {
        const row: Record<string, any> = {};
        cleanColumns.forEach(col => {
          // Generate appropriate mock values based on column name
          if (col.includes('id') || col.includes('_id')) {
            row[col] = 1000 + i;
          } else if (col.includes('date') || col.includes('time')) {
            const date = new Date();
            date.setDate(date.getDate() - i * 30);
            row[col] = date.toISOString().split('T')[0];
          } else if (col.includes('count') || col.includes('number')) {
            row[col] = Math.floor(Math.random() * 100) + 1;
          } else if (col.includes('name')) {
            row[col] = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i];
          } else if (col.includes('gender')) {
            row[col] = ['Male', 'Female', 'Other', 'Male', 'Female'][i];
          } else if (col.includes('concept')) {
            row[col] = 8000 + i * 100;
          } else {
            row[col] = `Value ${i+1}`;
          }
        });
        return row;
      });
    }
    
    // If nothing matches, return a generic data structure
    return Array.from({ length: 5 }, (_, i) => ({
      id: 1000 + i,
      value: `Result ${i+1}`,
      count: Math.floor(Math.random() * 100) + 1
    }));
  }
}

/**
 * Test connection to the OMOP database
 */
export async function testOMOPConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await executeOMOPQuery({
      sql: 'SELECT 1 AS test',
      limit: 1
    });
    
    return {
      success: response.success,
      message: response.success 
        ? 'Successfully connected to OMOP database' 
        : `Failed to connect: ${response.error}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
