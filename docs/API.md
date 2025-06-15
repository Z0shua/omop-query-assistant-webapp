# OMOP Query Assistant - API Documentation

## Overview

This document provides comprehensive API documentation for the OMOP Query Assistant, covering both the backend REST API and frontend service APIs.

## Backend REST API

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently, the API uses API keys passed in request headers or body for AI provider authentication. No server-side authentication is required for basic endpoints.

### Common Response Format
```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Query Endpoints

### Convert Natural Language to SQL

**Endpoint:** `POST /api/query/nl-to-sql`

**Description:** Converts natural language questions to SQL queries using AI providers.

**Request Body:**
```json
{
  "naturalLanguage": "How many patients have diabetes?",
  "provider": "openai",
  "credentials": {
    "apiKey": "your-api-key",
    "model": "gpt-4",
    "endpoint": "https://api.openai.com/v1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "SELECT COUNT(*) as patient_count FROM condition_occurrence WHERE condition_concept_id IN (SELECT concept_id FROM concept WHERE concept_name LIKE '%diabetes%')",
  "explanation": "This query counts patients with diabetes by looking at condition_occurrence table and joining with concept table to find diabetes-related conditions.",
  "provider": "openai",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid AI provider",
  "details": "Provider 'invalid' is not supported",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Execute SQL Query

**Endpoint:** `POST /api/query/execute`

**Description:** Executes SQL queries against configured databases.

**Request Body:**
```json
{
  "sql": "SELECT COUNT(*) FROM person",
  "databaseConfig": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "omop_cdm",
    "user": "postgres",
    "password": "password"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "count": 1000 }
  ],
  "columns": ["count"],
  "rowCount": 1,
  "executionTime": 150,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Complete Query Workflow

**Endpoint:** `POST /api/query/process`

**Description:** Performs the complete workflow: NL → SQL → Execute.

**Request Body:**
```json
{
  "naturalLanguage": "How many patients have diabetes?",
  "provider": "openai",
  "credentials": {
    "apiKey": "your-api-key"
  },
  "databaseConfig": {
    "type": "mock"
  }
}
```

**Response:**
```json
{
  "success": true,
  "naturalLanguage": "How many patients have diabetes?",
  "sql": "SELECT COUNT(*) as patient_count FROM condition_occurrence WHERE condition_concept_id IN (SELECT concept_id FROM concept WHERE concept_name LIKE '%diabetes%')",
  "explanation": "This query counts patients with diabetes...",
  "provider": "openai",
  "execution": {
    "data": [
      { "patient_count": 87 }
    ],
    "columns": ["patient_count"],
    "rowCount": 1,
    "executionTime": 200
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Supported Providers

**Endpoint:** `GET /api/query/providers`

**Description:** Returns list of supported AI providers.

**Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "description": "OpenAI GPT models for natural language processing"
    },
    {
      "id": "anthropic",
      "name": "Anthropic Claude",
      "description": "Anthropic Claude models for natural language processing"
    },
    {
      "id": "google",
      "name": "Google AI",
      "description": "Google AI models for natural language processing"
    }
  ]
}
```

## Health Endpoints

### Basic Health Check

**Endpoint:** `GET /api/health`

**Description:** Basic service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Detailed Health Check

**Endpoint:** `GET /api/health/detailed`

**Description:** Detailed health check with service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "database": "connected",
    "ai_providers": "available"
  },
  "available_ai_providers": ["openai", "anthropic", "google"]
}
```

## Frontend Service APIs

### omopApiService.ts

**Purpose:** Single source of truth for OMOP query execution.

#### executeOMOPQuery()

**Function Signature:**
```typescript
executeOMOPQuery(options: OMOPQueryOptions): Promise<OMOPQueryResponse>
```

**Parameters:**
```typescript
interface OMOPQueryOptions {
  sql?: string;
  naturalLanguage?: string;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
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
```

**Usage Example:**
```typescript
import { executeOMOPQuery } from '@/services/omopApiService';

const response = await executeOMOPQuery({
  naturalLanguage: "How many patients have diabetes?"
});

if (response.success) {
  console.log('Results:', response.data);
  console.log('SQL:', response.sql);
} else {
  console.error('Error:', response.error);
}
```

#### testOMOPConnection()

**Function Signature:**
```typescript
testOMOPConnection(): Promise<{ success: boolean; message: string }>
```

**Usage Example:**
```typescript
const result = await testOMOPConnection();
if (result.success) {
  console.log('Connection successful:', result.message);
} else {
  console.error('Connection failed:', result.message);
}
```

### apiService.ts

**Purpose:** Backend API communication layer.

#### convertNaturalLanguageToSQL()

**Function Signature:**
```typescript
convertNaturalLanguageToSQL(request: QueryRequest): Promise<QueryResponse>
```

**Parameters:**
```typescript
interface QueryRequest {
  naturalLanguage: string;
  provider: string;
  credentials?: {
    apiKey?: string;
    model?: string;
    endpoint?: string;
  };
}
```

**Usage Example:**
```typescript
import { apiService } from '@/services/apiService';

const response = await apiService.convertNaturalLanguageToSQL({
  naturalLanguage: "How many patients have diabetes?",
  provider: "openai",
  credentials: {
    apiKey: "your-api-key"
  }
});
```

#### executeQuery()

**Function Signature:**
```typescript
executeQuery(request: ExecuteRequest): Promise<ExecuteResponse>
```

**Parameters:**
```typescript
interface ExecuteRequest {
  sql: string;
  databaseConfig: {
    type: 'postgresql' | 'postgres' | 'sqlite' | 'mock';
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    file?: string;
  };
}
```

#### processQuery()

**Function Signature:**
```typescript
processQuery(
  naturalLanguage: string,
  provider: string,
  credentials: any,
  databaseConfig?: any
): Promise<ProcessResponse>
```

### nlToSqlConverter.ts

**Purpose:** Natural language to SQL conversion utilities.

#### convertNaturalLanguageToSQL()

**Function Signature:**
```typescript
convertNaturalLanguageToSQL(
  query: string, 
  credentials: AllCredentials
): Promise<NLtoSQLResult>
```

**Returns:**
```typescript
interface NLtoSQLResult {
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
```

#### testProviderConnection()

**Function Signature:**
```typescript
testProviderConnection(
  provider: string, 
  credentials: any
): Promise<{success: boolean, debugInfo?: string}>
```

## Error Handling

### Common Error Types

1. **Validation Errors (400)**
   ```json
   {
     "success": false,
     "error": "Invalid request data",
     "details": "naturalLanguage is required"
   }
   ```

2. **Authentication Errors (401)**
   ```json
   {
     "success": false,
     "error": "Invalid API credentials"
   }
   ```

3. **Network Errors**
   ```json
   {
     "success": false,
     "error": "Network error connecting to OpenAI API",
     "networkDetails": {
       "url": "https://api.openai.com/v1/chat/completions",
       "networkError": true,
       "corsError": true
     }
   }
   ```

4. **Server Errors (500)**
   ```json
   {
     "success": false,
     "error": "Internal Server Error",
     "details": "Database connection failed"
   }
   ```

### Error Handling Best Practices

1. **Frontend:**
   ```typescript
   try {
     const response = await executeOMOPQuery(options);
     if (!response.success) {
       throw new Error(response.error);
     }
     // Handle success
   } catch (error) {
     // Handle error with user-friendly message
     toast.error(error.message);
   }
   ```

2. **Backend:**
   ```javascript
   try {
     const result = await queryService.processQuery(data);
     res.json({ success: true, ...result });
   } catch (error) {
     logger.error('Query processing error:', error);
     res.status(500).json({
       success: false,
       error: error.message
     });
   }
   ```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes
- **Limit:** 100 requests per window
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (development)
- `http://localhost:8080` (alternative dev port)
- GitHub Pages domain (production)

## Security Considerations

1. **API Keys:** Never logged or stored on server
2. **Input Validation:** All inputs validated using Joi schemas
3. **SQL Injection:** Parameterized queries used for database operations
4. **CORS:** Properly configured for allowed origins
5. **Rate Limiting:** Prevents abuse and DoS attacks

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Convert NL to SQL
curl -X POST http://localhost:3001/api/query/nl-to-sql \
  -H "Content-Type: application/json" \
  -d '{
    "naturalLanguage": "How many patients have diabetes?",
    "provider": "openai",
    "credentials": {
      "apiKey": "your-api-key"
    }
  }'

# Execute SQL
curl -X POST http://localhost:3001/api/query/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) FROM person",
    "databaseConfig": {
      "type": "mock"
    }
  }'
```

### Using Postman

1. Import the collection from `docs/postman-collection.json` (if available)
2. Set up environment variables for API keys
3. Test each endpoint with appropriate request bodies

This API documentation provides comprehensive coverage of all endpoints, request/response formats, and usage patterns for the OMOP Query Assistant. 