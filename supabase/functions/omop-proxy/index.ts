
// Supabase Edge Function
// This function serves as a proxy to the OMOP CDM API, solving CORS issues

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface RequestBody {
  query: string;
  naturalLanguage?: string;
  limit?: number;
  offset?: number;
  config?: {
    apiEndpoint?: string;
    apiKey?: string;
    databaseType?: string;
    connectionString?: string;
  };
}

serve(async (req) => {
  try {
    // Parse the request body
    const { query, naturalLanguage, limit = 100, offset = 0, config } = await req.json() as RequestBody;
    
    // Validate the request
    if (!query && !naturalLanguage) {
      return new Response(
        JSON.stringify({ error: 'Either SQL query or natural language query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If we have configuration with an API endpoint, use it
    if (config?.apiEndpoint) {
      try {
        console.log(`Proxying request to ${config.apiEndpoint}`);
        
        const response = await fetch(`${config.apiEndpoint}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
          },
          body: JSON.stringify({
            sql: query,
            naturalLanguage,
            limit,
            offset
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error proxying to external API:', error);
        return new Response(
          JSON.stringify({ error: `Failed to connect to OMOP API: ${error.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If no API endpoint or if the API call failed, generate mock data
    // This is just for development purposes and should be replaced with actual database access
    console.log('No API endpoint configured, returning mock data');
    
    const mockStartTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
    
    // Generate very simple mock data
    const mockData = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: offset + i + 1,
      value: `Mock value ${offset + i + 1}`
    }));
    
    return new Response(
      JSON.stringify({
        results: mockData,
        sql: query,
        execution_time_ms: Date.now() - mockStartTime,
        total_rows: 100, // Mock total count
        columns: ['id', 'value'],
        cached: false
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in OMOP proxy function:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
