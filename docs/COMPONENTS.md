# OMOP Query Assistant - Component Documentation

This document provides detailed information about the key components in the OMOP Query Assistant frontend, their purpose, props, and usage patterns. Components are organized by feature area following the project's architectural overhaul.

## Page Components

### QueryPage.tsx

**Purpose:** Main interface for natural language querying of OMOP data.

**Key Features:**
- Natural language input and processing
- Query history management
- Example query selection
- Database schema information display

**State Management:**
- `query`: Current input text
- `processingQuery`: Loading state
- `queryHistory`: Array of previous queries and results

**Key Functions:**
- `handleQuerySubmit()`: Processes natural language queries
- `handleDeleteQuery()`: Removes queries from history
- `handleExampleSelect()`: Loads example queries
- `checkCredentials()`: Validates user configuration

**Data Flow:**
1. User inputs natural language question
2. Credentials are validated
3. `executeOMOPQuery()` is called from `omopApiService.ts`
4. Results are displayed and stored in history

### SettingsPage.tsx

**Purpose:** Configuration interface for AI providers and database connections.

**Tabs:**
- **AI Providers:** Configure OpenAI, Anthropic, Google AI, Deepseek
- **DuckDB:** Local database configuration
- **Databricks:** Connection testing and credential management

**Key Features:**
- Connection testing for all providers
- Secure credential storage in localStorage
- Detailed error reporting and debugging
- Provider-specific configuration options

### HistoryPage.tsx

**Purpose:** View and manage query history.

**Features:**
- Chronological list of all queries
- Search and filtering capabilities
- Export functionality
- Query result visualization

## Service Components

### omopApiService.ts

**Purpose:** Single source of truth for OMOP query execution.

**Key Functions:**
- `executeOMOPQuery()`: Main query execution function
- `generateMockResponse()`: Mock data generation (fallback only)
- `generateMockData()`: Context-aware mock data based on SQL

**Data Flow Strategy:**
1. Try Supabase Edge Function proxy
2. Fallback to direct API endpoint
3. Final fallback to mock data

**Mock Data Strategy:**
- Analyzes SQL query structure
- Generates appropriate mock data based on table names
- Provides realistic-looking results for development

### apiService.ts

**Purpose:** Backend API communication layer.

**Key Methods:**
- `convertNaturalLanguageToSQL()`: NL to SQL conversion
- `executeQuery()`: Direct SQL execution
- `processQuery()`: Complete workflow
- `getProviders()`: Available AI providers
- `getHealth()`: Service health checks

**Error Handling:**
- Consistent error formatting
- HTTP status code handling
- Network error detection

### nlToSqlConverter.ts

**Purpose:** Natural language to SQL conversion utilities.

**Key Functions:**
- `convertNaturalLanguageToSQL()`: Main conversion function
- `testProviderConnection()`: Connection testing
- `enhancedFetch()`: Network request with error diagnostics

**AI Provider Support:**
- Azure OpenAI
- Anthropic Claude
- Google AI
- Deepseek
- Databricks (connection testing only)

## UI Components

### QueryInput.tsx

**Purpose:** Natural language input component.

**Props:**
- `onSubmit`: Callback for query submission
- `isProcessing`: Loading state
- `placeholder`: Input placeholder text

**Features:**
- Real-time validation
- Loading states
- Keyboard shortcuts (Enter to submit)

### QueryResult.tsx

**Purpose:** Display query results with metadata.

**Props:**
- `id`: Unique result identifier
- `sql`: Generated SQL query
- `data`: Query results array
- `metrics`: Execution metadata
- `timestamp`: Query timestamp
- `aiResponse`: AI explanation
- `onDelete`: Delete callback

**Features:**
- Expandable/collapsible sections
- SQL syntax highlighting
- Data table display
- Advanced chart visualization (Auto-selected Pie, Line, or Bar charts)
- Export functionality (CSV download)

### ConceptSearch.tsx

**Purpose:** Interface for searching standard OMOP concepts.

**Props:**
- `onSelect`: Callback when a concept is selected

**Features:**
- Real-time search by name, ID, or domain
- Mocked concept database for development
- Quick integration with query builder
- Domain-specific badges for results

### ExampleQueries.tsx

**Purpose:** Display categorized example queries.

**Props:**
- `onSelectExample`: Callback for example selection

**Categories:**
- Patient Demographics
- Conditions and Diagnoses
- Medications
- Temporal Analysis
- Complex Patterns
- Comorbidities

## Form Components

### AIProviderSettings.tsx

**Purpose:** AI provider configuration interface.

**Features:**
- Provider-specific forms
- Connection testing
- Credential validation
- Error reporting

### DatabricksSettings.tsx

**Purpose:** Databricks connection configuration.

**Props:**
- `onSave`: Save callback
- `initialValues`: Current configuration
- `onTestConnection`: Connection test callback

**Fields:**
- Host URL
- Access Token
- Catalog
- Schema
- SQL Warehouse

### DatabaseSettings.tsx

**Purpose:** Local database configuration.

**Features:**
- File path selection
- Connection testing
- Advanced configuration options

## Hook Components

### use-credentials.tsx

**Purpose:** Manage AI provider and database credentials.

**State:**
- `credentials`: All provider configurations
- `selectedProvider`: Currently active provider

**Methods:**
- `setCredentials()`: Update credential configuration
- Automatic localStorage persistence

### use-omop-query.tsx

**Purpose:** React Query hook for OMOP data fetching.

**Props:**
- `sql`: SQL query string
- `naturalLanguage`: Natural language query
- `enabled`: Query execution flag
- `onSuccess`: Success callback
- `onError`: Error callback

**Features:**
- Automatic caching
- Loading states
- Error handling
- Refetch capabilities

### use-toast.tsx

**Purpose:** Toast notification management.

**Features:**
- Multiple toast types
- Auto-dismiss functionality
- Queue management
- Custom styling

## Layout Components

### Layout.tsx

**Purpose:** Main application layout wrapper.

**Features:**
- Navigation sidebar
- Header with branding
- Responsive design
- Theme support

### Sidebar.tsx

**Purpose:** Navigation sidebar component.

**Features:**
- Collapsible design
- Active state highlighting
- Icon support
- Responsive behavior

## Utility Components

### Chart Components

**Purpose:** Data visualization components.

**Types:**
- Bar charts
- Line charts
- Pie charts
- Scatter plots

**Features:**
- Responsive design
- Interactive tooltips
- Customizable themes
- Export capabilities

### Form Components

**Purpose:** Reusable form elements.

**Components:**
- Input fields
- Select dropdowns
- Checkboxes
- Radio buttons
- Text areas

**Features:**
- Validation integration
- Error states
- Loading states
- Accessibility support

## Component Patterns

### Error Handling

All components follow consistent error handling patterns:
- Try-catch blocks for async operations
- User-friendly error messages
- Toast notifications for feedback
- Graceful degradation

### Loading States

Components use consistent loading patterns:
- `isProcessing` or `isLoading` props
- Skeleton loaders for content
- Disabled states for forms
- Progress indicators

### State Management

State is managed at appropriate levels:
- Local state for component-specific data
- Custom hooks for shared state
- React Query for server state
- localStorage for persistence

### Accessibility

Components follow accessibility best practices:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

## Development Guidelines

### Creating New Components

1. **File Structure:**
   ```
   src/components/features/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   └── index.ts
   ```

   Major features go in `features/`, settings in `settings/`, layout in `layout/`, and primitive components in `ui/`.

2. **Component Template:**
   ```typescript
   import React from 'react';
   import { cn } from '@/lib/utils';

   interface ComponentNameProps {
     // Define props
   }

   export function ComponentName({ ...props }: ComponentNameProps) {
     return (
       // Component JSX
     );
   }
   ```

3. **Export Pattern:**
   ```typescript
   // index.ts
   export { ComponentName } from './ComponentName';
   ```

### Testing Components

- Unit tests for component logic
- Integration tests for user interactions
- Accessibility testing
- Visual regression testing

### Documentation

- JSDoc comments for props
- Usage examples
- TypeScript interfaces
- Storybook stories (if applicable)

This component documentation provides a comprehensive overview of the frontend architecture and helps developers understand how to work with and extend the OMOP Query Assistant. 