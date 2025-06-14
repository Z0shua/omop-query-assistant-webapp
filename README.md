# OMOP Query Assistant

A modern web application that allows users to query OMOP (Observational Medical Outcomes Partnership) Common Data Model databases using natural language. Built with React, TypeScript, and Vite, this tool translates plain English questions into SQL queries and provides instant results.

## 🌐 Live Demo

Visit the live application: [OMOP Query Assistant](https://z0shua.github.io/omop-query-assistant-webapp)

## Features

### 🤖 Natural Language Queries
- Ask questions about your medical data in plain English
- Automatic translation to SQL queries using AI providers
- Support for multiple AI providers (Azure OpenAI, Anthropic, Google AI, Deepseek)

### 🏥 OMOP CDM Compatible
- Designed specifically for OMOP Common Data Model v5.4
- Understands OMOP tables, relationships, and vocabulary concepts
- Compatible with PostgreSQL, Databricks, and other database systems

### 📊 Interactive Results
- Real-time query execution and result display
- Data visualization with charts and tables
- Query performance metrics and execution details

### 📚 Query Management
- Save and revisit previous queries
- Local storage for query history
- Example queries for common medical data analysis scenarios

### 🔧 Flexible Configuration
- Secure credential management for AI providers
- Database connection settings
- Local storage for sensitive configuration

## Example Queries

The application includes pre-built examples across various medical domains:

### Patient Demographics
- "How many patients are in the database by gender?"
- "What is the age distribution of patients?"
- "Show me the racial distribution of patients over 65 years old"

### Conditions and Diagnoses
- "What are the top 10 most common diagnoses?"
- "How many patients have type 2 diabetes mellitus?"
- "Show me patients with hypertension grouped by age range"

### Medications
- "What antibiotics are most commonly prescribed?"
- "Show patients who received steroids in the last year"
- "List the top 5 medications prescribed to patients with heart failure"

### Temporal Analysis
- "What is the average length of hospital stays?"
- "Show monthly trend of flu diagnoses"
- "How many patients were diagnosed with pneumonia in the last 6 months?"

### Complex Patterns
- "Find patients with both diabetes and hypertension"
- "Show medications prescribed after heart surgery"
- "Identify patients who had an adverse reaction after taking amoxicillin"

### Comorbidities
- "What conditions commonly co-occur with rheumatoid arthritis?"
- "Show the most common comorbidities in elderly patients"
- "Find patients who have at least 3 chronic conditions"

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **AI Integration**: Multiple provider support (Azure OpenAI, Anthropic, Google AI, Deepseek)
- **Database**: PostgreSQL, Databricks, DuckDB support
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Deployment

This application is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment (Recommended)

1. **Push to GitHub**: Simply push your changes to the `main` or `master` branch
2. **GitHub Actions**: The workflow will automatically:
   - Install dependencies
   - Build the application
   - Deploy to GitHub Pages
3. **Access**: Your app will be available at `https://z0shua.github.io/omop-query-assistant-webapp`

### Manual Deployment

If you prefer manual deployment:

1. Install the gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Update the homepage in `package.json` with your GitHub username:
```json
{
  "homepage": "https://z0shua.github.io/omop-query-assistant-webapp"
}
```

3. Deploy:
```bash
npm run deploy
```

### GitHub Pages Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The deployment will happen automatically when you push to main/master

### Environment Variables

For production deployment, you may need to configure environment variables in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add any required environment variables (API keys, etc.)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Access to an AI provider API (Azure OpenAI, Anthropic, Google AI, or Deepseek)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

1. Navigate to the Settings page in the application
2. Configure your AI provider credentials:
   - **Azure OpenAI**: API Key, Endpoint, and Deployment Name
   - **Anthropic**: API Key
   - **Google AI**: API Key
   - **Deepseek**: API Key

3. Configure your database connection:
   - **Databricks**: Host and Token
   - **Local Database**: Connection string and credentials

All credentials are stored securely in your browser's local storage.

## Usage

1. **Start Querying**: Click "Start SQL Querying" on the home page
2. **Ask Questions**: Type your medical data questions in natural language
3. **View Results**: See generated SQL, execution results, and visualizations
4. **Save Queries**: All queries are automatically saved to your history
5. **Explore Examples**: Try pre-built example queries for common scenarios

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── ...            # Feature-specific components
├── pages/              # Application pages
│   ├── Index.tsx       # Home page
│   ├── QueryPage.tsx   # Main query interface
│   ├── HistoryPage.tsx # Query history
│   ├── SettingsPage.tsx # Configuration
│   └── ...            # Other pages
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API and external service integrations
├── lib/                # Library configurations
└── integrations/       # Third-party integrations
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (via editor integration)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the Help page in the application
- Review the example queries for guidance
- Explore the database information page for schema details

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by the OMOP Common Data Model
- Supported by multiple AI providers for natural language processing
