# OMOP Query Assistant

## Overview

OMOP Query Assistant is a web application that enables users to query OMOP (Observational Medical Outcomes Partnership) Common Data Model databases using natural language. The app translates plain English questions into SQL queries and displays results, making medical data analysis more accessible for researchers and clinicians.

## Architecture

The application consists of two main components:

- **Frontend**: React-based web interface for user interaction
- **Backend**: Node.js/Express API for NLP-to-SQL conversion and database query execution

## Features

- Natural language to SQL translation for OMOP CDM databases
- Support for multiple AI providers (Azure OpenAI, Anthropic, Google AI, Deepseek)
- Compatible with PostgreSQL, SQLite, and mock databases
- Interactive results with tables and charts
- Query history and example queries
- Secure credential management (stored in browser local storage)
- Modern UI built with React, TypeScript, and Tailwind CSS
- RESTful API backend with comprehensive error handling

## Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **UI:** Radix UI, Tailwind CSS, shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router DOM
- **Charts:** Recharts
- **Forms:** React Hook Form, Zod

### Backend
- **Framework:** Node.js, Express
- **AI Integration:** OpenAI, Anthropic, Google AI SDKs
- **Database:** PostgreSQL, SQLite drivers
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate limiting

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Access to an AI provider API (OpenAI, Anthropic, Google AI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Z0shua/omop-query-assistant-webapp.git
   cd omop-query-assistant-webapp
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Configure backend environment:
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your API keys and configuration
   cd ..
   ```

5. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

6. Start the frontend development server (in a new terminal):
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

### Configuration

#### Backend Configuration
Create a `.env` file in the `backend` directory with:
- AI provider API keys (OpenAI, Anthropic, Google AI)
- Database connection details (optional)
- Server configuration

#### Frontend Configuration
The frontend automatically connects to the backend at `http://localhost:3001`. To change this, set the `VITE_API_URL` environment variable.

## Usage
- Click "Start SQL Querying" on the home page
- Enter your medical data question in natural language
- View the generated SQL, results, and visualizations
- Access your query history and example queries for inspiration

## API Endpoints

### Query Endpoints
- `POST /api/query/nl-to-sql` - Convert natural language to SQL
- `POST /api/query/execute` - Execute SQL query
- `POST /api/query/process` - Complete workflow (NL → SQL → Execute)
- `GET /api/query/providers` - Get supported AI providers

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with service status

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # UI and feature components
│   ├── pages/             # Application pages
│   ├── services/          # API and external services
│   └── ...
├── backend/               # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── ...
└── ...
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
