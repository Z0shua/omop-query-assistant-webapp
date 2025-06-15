# OMOP Query Assistant

## Overview

OMOP Query Assistant is a web application that enables users to query OMOP (Observational Medical Outcomes Partnership) Common Data Model databases using natural language. The app translates plain English questions into SQL queries and displays results, making medical data analysis more accessible for researchers and clinicians.

## Features

- Natural language to SQL translation for OMOP CDM databases
- Support for multiple AI providers (Azure OpenAI, Anthropic, Google AI, Deepseek)
- Compatible with PostgreSQL, Databricks, and DuckDB
- Interactive results with tables and charts
- Query history and example queries
- Secure credential management (stored in browser local storage)
- Modern UI built with React, TypeScript, and Tailwind CSS

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Radix UI, Tailwind CSS, shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router DOM
- **AI Integration:** Multiple provider support
- **Database:** PostgreSQL, Databricks, DuckDB
- **Charts:** Recharts
- **Forms:** React Hook Form, Zod

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Access to an AI provider API (Azure OpenAI, Anthropic, Google AI, or Deepseek)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Z0shua/omop-query-assistant-webapp.git
   cd omop-query-assistant-webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
yarn install
   # or
bun install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
yarn dev
   # or
bun dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Configuration
- Go to the Settings page in the app
- Enter your AI provider credentials (API keys, endpoints, etc.)
- Configure your database connection (Databricks or local database)
- All credentials are stored securely in your browser's local storage

## Usage
- Click "Start SQL Querying" on the home page
- Enter your medical data question in natural language
- View the generated SQL, results, and visualizations
- Access your query history and example queries for inspiration

## Project Structure

```
src/
├── components/    # UI and feature components
├── pages/         # Application pages (Index, QueryPage, etc.)
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── services/      # API and external service integrations
├── lib/           # Library configurations
└── integrations/  # Third-party integrations
```

## Deployment

This app is configured for automatic deployment to GitHub Pages using GitHub Actions. See the Deployment section in this repository for details.

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support
- For questions, use the Help page in the app
- Review example queries for guidance
- Explore the database information page for schema details
