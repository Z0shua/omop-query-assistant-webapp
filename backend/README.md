# OMOP Query Assistant Backend

Backend API for the OMOP Query Assistant that handles natural language to SQL conversion and database query execution.

## Features

- Natural language to SQL conversion using multiple AI providers
- Database query execution (PostgreSQL, SQLite, Mock)
- RESTful API endpoints
- Request validation and error handling
- Rate limiting and security middleware
- Health check endpoints

## API Endpoints

### Query Endpoints
- `POST /api/query/nl-to-sql` - Convert natural language to SQL
- `POST /api/query/execute` - Execute SQL query
- `POST /api/query/process` - Complete workflow (NL → SQL → Execute)
- `GET /api/query/providers` - Get supported AI providers

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with service status

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp env.example .env
# Edit .env with your API keys and configuration
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_API_KEY` - Google AI API key

## Usage Examples

### Convert Natural Language to SQL
```bash
curl -X POST http://localhost:3001/api/query/nl-to-sql \
  -H "Content-Type: application/json" \
  -d '{
    "naturalLanguage": "How many patients have diabetes?",
    "provider": "openai",
    "credentials": {
      "apiKey": "your-api-key"
    }
  }'
```

### Execute SQL Query
```bash
curl -X POST http://localhost:3001/api/query/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) FROM person",
    "databaseConfig": {
      "type": "mock"
    }
  }'
```

## Supported AI Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3 models
- **Google AI**: Gemini Pro

## Supported Databases

- **PostgreSQL**: Full OMOP CDM support
- **SQLite**: Lightweight local database
- **Mock**: Generated test data for development

## Development

The backend is built with:
- Express.js for the web framework
- Joi for request validation
- Multiple AI provider SDKs
- PostgreSQL and SQLite drivers
- Comprehensive error handling and logging 