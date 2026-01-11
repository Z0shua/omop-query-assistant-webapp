# OMOP Query Assistant

A web application that enables natural language querying of OMOP (Observational Medical Outcomes Partnership) Common Data Model databases. Translate plain English questions into SQL queries and visualize medical data analysis results.

## 🚀 Features

- **Natural Language to SQL**: Convert medical questions to OMOP-compliant SQL queries
- **Concept Search**: Search standard OMOP concepts (conditions, drugs, etc.) to refine queries
- **Multi-AI Support**: OpenAI, Anthropic, Google AI, and Deepseek integration
- **Database Compatibility**: PostgreSQL, SQLite, and mock database support
- **Advanced Visualizations**: Auto-selecting Line, Bar, and Pie charts based on result data
- **Query Management**: History tracking and example queries
- **Secure Credentials**: Browser-based credential storage
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS using a feature-based architecture

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL, SQLite, or mock data
- **AI Providers**: OpenAI, Anthropic, Google AI, Deepseek

## 🛠️ Technology Stack

### Frontend
- React 18, TypeScript, Vite
- Radix UI, Tailwind CSS, shadcn/ui
- React Query (TanStack Query)
- React Router DOM
- Recharts for data visualization
- React Hook Form + Zod validation

### Backend
- Node.js, Express
- AI SDKs (OpenAI, Anthropic, Google AI)
- Database drivers (PostgreSQL, SQLite)
- Joi validation
- Security middleware (Helmet, CORS, Rate limiting)

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- AI provider API key (OpenAI, Anthropic, or Google AI)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Z0shua/omop-query-assistant-webapp.git
   cd omop-query-assistant-webapp
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys and configuration
   cd ..
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# AI Provider Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key

# Database Configuration (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/omop
SQLITE_PATH=./data/omop.db

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend Configuration
The frontend connects to `http://localhost:3001` by default. To change this:
```bash
export VITE_API_URL=http://your-backend-url:port
```

## 📖 Usage

1. **Start Querying**: Click "Start SQL Querying" on the home page
2. **Concept Exploration**: Use the "Concepts" tab to find standard OMOP codes for conditions, drugs, etc.
3. **Ask Questions**: Enter medical data questions in natural language
4. **Interactive Analysis**: View generated SQL, results tables, and auto-selected visualizations (Pie, Line, or Bar charts)
5. **Manage History**: Access previous queries and examples directly from the interface

### Example Queries
- "How many patients have diabetes?"
- "What's the average age of patients with heart disease?"
- "Show me the top 10 medications prescribed for hypertension"

## 🔌 API Endpoints

### Query Endpoints
- `POST /api/query/nlp-to-sql` - Convert natural language to SQL
- `POST /api/query/execute` - Execute SQL query against database
- `GET /api/query/history` - Get query history
- `POST /api/query/validate` - Validate SQL query syntax

### Health & Status
- `GET /api/health` - Health check
- `GET /api/status` - System status
- `GET /api/providers` - Available AI providers

### Database
- `POST /api/db/connect` - Test database connection
- `GET /api/db/schema` - Get database schema
- `GET /api/db/tables` - List available tables

## 🚀 Deployment

### GitHub Pages (Frontend Only)
The frontend is automatically deployed to GitHub Pages on push to `main` branch.

### Full Stack Deployment
1. Deploy backend to your preferred hosting service
2. Set environment variables
3. Build and deploy frontend with correct API URL
4. Configure CORS settings

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Component Documentation](docs/COMPONENTS.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Future Roadmap](WIKI.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that allows others to:
- Use the code commercially
- Modify the code
- Distribute the code
- Use it privately
- Sublicense it

The only requirement is that the license and copyright notice be included in all copies.

## ⚠️ Disclaimer

This application is for educational and research purposes. Always ensure compliance with:
- HIPAA regulations when handling patient data
- Institutional review board requirements
- Data privacy laws in your jurisdiction
- OMOP CDM version compatibility

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Z0shua/omop-query-assistant-webapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Z0shua/omop-query-assistant-webapp/discussions)
- **Documentation**: Check the [docs](docs/) folder

## 🙏 Acknowledgments

- OMOP Common Data Model community
- OpenAI, Anthropic, and Google AI for NLP capabilities
- React and TypeScript communities
- All contributors and users

---

**Note**: All OMOP query execution and mock data fallback is handled through the backend API. The frontend does not generate mock data directly. Databricks is currently only supported for connection testing and credential management, not for query execution.