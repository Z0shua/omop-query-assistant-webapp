# OMOP Query Assistant - Architecture Documentation

## Overview

The OMOP Query Assistant is a full-stack web application that enables users to query OMOP (Observational Medical Outcomes Partnership) Common Data Model databases using natural language. The application translates plain English questions into SQL queries and displays results, making medical data analysis more accessible for researchers and clinicians.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Databases     │
│   (React/TS)    │◄──►│  (Node.js/      │◄──►│  (PostgreSQL/   │
│                 │    │   Express)      │    │   SQLite/Mock)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Providers  │    │   Supabase      │    │   OMOP CDM      │
│  (OpenAI/       │    │  Edge Functions │    │   Schema        │
│   Anthropic/    │    │   (Proxy)       │    │                 │
│   Google AI)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Radix UI + Tailwind CSS + shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router DOM
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

### Key Components

#### Pages
- **QueryPage.tsx** - Main query interface where users input natural language questions
- **SettingsPage.tsx** - Configuration for AI providers and database connections
- **HistoryPage.tsx** - View and manage query history
- **ExamplesPage.tsx** - Gallery of example queries
- **DatabaseInfoPage.tsx** - Detailed schema info
- **HelpPage.tsx** - Documentation and guidance

#### Services
- **omopApiService.ts** - Single source of truth for OMOP query execution
- **apiService.ts** - Backend API communication layer
- **nlToSqlConverter.ts** - Natural language to SQL conversion utilities

#### Hooks
- **use-credentials.tsx** - Manage AI provider and database credentials
- **use-omop-query.tsx** - React Query hook for OMOP data fetching
- **use-toast.tsx** - Toast notification management

### Data Flow (Frontend)

1. **User Input** → QueryPage.tsx
2. **Natural Language** → executeOMOPQuery() in omopApiService.ts
3. **API Call** → Backend or Supabase Edge Function
4. **Response** → QueryResult component for display
5. **History** → Local storage + UI state management

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:** OpenAI, Anthropic, Google AI SDKs
- **Database:** PostgreSQL, SQLite drivers
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate limiting

### Key Services

#### QueryService.js
- Orchestrates the complete workflow: NL → SQL → Execute
- Handles AI provider selection and response parsing
- Manages database query execution

#### AIService.js
- Manages multiple AI provider integrations
- Handles credential management and API calls
- Provides consistent interface across providers

#### DatabaseService.js
- Supports PostgreSQL, SQLite, and mock databases
- Manages connection pooling and query execution
- Provides mock data generation for development

### API Endpoints

```
POST /api/query/nl-to-sql     - Convert natural language to SQL
POST /api/query/execute       - Execute SQL query
POST /api/query/process       - Complete workflow (NL → SQL → Execute)
GET  /api/query/providers     - Get supported AI providers
GET  /api/health              - Basic health check
GET  /api/health/detailed     - Detailed health check
```

## Data Flow Architecture

### Query Processing Flow

```
1. User Input (Natural Language or Concept Selection)
   ↓
2. Frontend Validation & Credential Check
   ↓
3. executeOMOPQuery() or searchConcepts() in omopApiService.ts
   ↓
4. Backend API Call or Supabase Edge Function
   ↓
5. AI Provider (OpenAI/Anthropic/Google AI)
   ↓
6. SQL Generation
   ↓
7. Database Query Execution
   ↓
8. Result Processing & Formatting (Auto-selected Visualizations)
   ↓
9. Frontend Display & History Storage
```

### Mock Data Strategy

- **Single Source:** All mock data generation is centralized in `omopApiService.ts`
- **Fallback Only:** Mock data is used only when real database connections fail
- **Context-Aware:** Mock data is generated based on the actual SQL query structure
- **Development Focus:** Primarily for development and testing scenarios

## Security & Configuration

### Credential Management
- **Frontend:** Credentials stored in browser localStorage
- **Backend:** Environment variables for API keys
- **No Server Storage:** Sensitive data never stored on server

### CORS & Proxy Strategy
- **Primary:** Supabase Edge Functions for CORS-free API calls
- **Fallback:** Direct API calls with CORS headers
- **Development:** Mock data when no external services available

## Deployment Architecture

### Frontend Deployment
- **Platform:** GitHub Pages (static hosting)
- **Build:** Vite production build
- **CI/CD:** GitHub Actions for automatic deployment

### Backend Deployment
- **Platform:** Node.js hosting (Heroku, Railway, etc.)
- **Environment:** Production environment variables
- **Database:** PostgreSQL for production, SQLite for development

## Key Design Principles

### 1. Single Source of Truth
- All query execution goes through `omopApiService.ts`
- No duplicate mock data logic in components
- Centralized credential management

### 2. Graceful Degradation
- Multiple fallback strategies for API calls
- Mock data when real databases unavailable
- Clear error messages and user feedback

### 3. Extensibility
- Modular AI provider system
- Pluggable database backends
- Configurable UI components

### 4. User Experience
- Real-time feedback and loading states
- Comprehensive error handling
- Intuitive natural language interface

## Current Limitations

### Databricks Integration
- **Current:** Only connection testing and credential management
- **Future:** Full query execution support planned
- **Workaround:** Use supported databases (PostgreSQL, SQLite)

### AI Provider Dependencies
- Requires valid API keys for OpenAI, Anthropic, or Google AI
- Network connectivity required for real-time processing
- Rate limiting and usage costs apply

### Database Support
- **Supported:** PostgreSQL, SQLite, Mock
- **Not Supported:** Databricks, MySQL, SQL Server
- **Future:** Additional database backends planned

## Development Guidelines

### Adding New AI Providers
1. Update `AIService.js` with new provider logic
2. Add provider to frontend credential management
3. Update validation schemas
4. Add provider to documentation

### Adding New Database Backends
1. Extend `DatabaseService.js` with new driver
2. Update validation schemas
3. Add connection configuration
4. Update documentation and examples

### Code Organization
- **Services:** Business logic and external integrations (src/services)
- **Features:** Major feature-specific components (src/components/features)
- **Settings:** Configuration-related components (src/components/settings)
- **UI:** Reusable UI elements from shadcn/ui (src/components/ui)
- **Layout:** High-level structure components (src/components/layout)
- **Pages:** Main application views (src/pages)
- **Hooks:** Custom React hooks for state management (src/hooks)
- **Utils:** Helper functions and utilities (src/utils)

This architecture provides a solid foundation for the OMOP Query Assistant, with clear separation of concerns, extensible design, and robust error handling.