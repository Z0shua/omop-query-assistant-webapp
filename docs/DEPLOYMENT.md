# OMOP Query Assistant - Deployment Documentation

## Overview

This document provides comprehensive deployment instructions for the OMOP Query Assistant, covering both frontend and backend deployment across different platforms and environments.

## Frontend Deployment

### GitHub Pages (Recommended)

The frontend is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Prerequisites
- GitHub repository with GitHub Actions enabled
- Repository is public or GitHub Pages is enabled for private repos

#### Configuration

1. **Vite Configuration** (`vite.config.ts`):
   ```typescript
   export default defineConfig({
     base: '/omop-query-assistant-webapp/',
     // ... other config
   });
   ```

2. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

#### Deployment Steps

1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is available at `https://username.github.io/omop-query-assistant-webapp/`

#### Environment Variables

For production builds, set these environment variables:

```bash
# .env.production
VITE_API_URL=https://your-backend-url.com/api
```

### Alternative Frontend Deployment Options

#### Vercel

1. **Connect Repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configuration** (`vercel.json`):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

#### Netlify

1. **Connect Repository:**
   - Connect GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Configuration** (`netlify.toml`):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Docker Deployment

1. **Dockerfile:**
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **nginx.conf:**
   ```nginx
   events {
     worker_connections 1024;
   }
   
   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;
   
     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
   
       location / {
         try_files $uri $uri/ /index.html;
       }
     }
   }
   ```

3. **Build and Run:**
   ```bash
   docker build -t omop-frontend .
   docker run -p 80:80 omop-frontend
   ```

## Backend Deployment

### Environment Setup

#### Required Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Database Configuration (optional)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=omop_cdm
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=true

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Platforms

#### Railway

1. **Connect Repository:**
   - Connect GitHub repository to Railway
   - Set root directory to `backend`
   - Configure environment variables

2. **Railway Configuration** (`railway.json`):
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health",
       "healthcheckTimeout": 300,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

#### Heroku

1. **Heroku Configuration** (`Procfile`):
   ```
   web: npm start
   ```

2. **Deploy Commands:**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set GOOGLE_API_KEY=your_key
   
   # Deploy
   git push heroku main
   ```

#### DigitalOcean App Platform

1. **App Specification** (`.do/app.yaml`):
   ```yaml
   name: omop-backend
   services:
   - name: api
     source_dir: backend
     github:
       repo: username/omop-query-assistant-webapp
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: OPENAI_API_KEY
       value: ${OPENAI_API_KEY}
     - key: ANTHROPIC_API_KEY
       value: ${ANTHROPIC_API_KEY}
     - key: GOOGLE_API_KEY
       value: ${GOOGLE_API_KEY}
   ```

#### Docker Deployment

1. **Backend Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Copy source code
   COPY . .
   
   # Create non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Docker Compose** (`docker-compose.yml`):
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - PORT=3001
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
         - GOOGLE_API_KEY=${GOOGLE_API_KEY}
       depends_on:
         - postgres
     
     postgres:
       image: postgres:15
       environment:
         - POSTGRES_DB=omop_cdm
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
   
   volumes:
     postgres_data:
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Database Deployment

### PostgreSQL Setup

#### Local Development
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE omop_cdm;
CREATE USER omop_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE omop_cdm TO omop_user;
```

#### Cloud Database Options

1. **Supabase:**
   - Create project at supabase.com
   - Use connection string from project settings
   - Enable Row Level Security (RLS) for production

2. **Railway PostgreSQL:**
   - Add PostgreSQL service in Railway dashboard
   - Use connection string from service variables

3. **Heroku Postgres:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   heroku config:get DATABASE_URL
   ```

4. **DigitalOcean Managed Database:**
   - Create PostgreSQL cluster in DigitalOcean
   - Use connection string from cluster settings

## Environment Configuration

### Development Environment

1. **Frontend** (`.env.development`):
   ```bash
   VITE_API_URL=http://localhost:3001/api
   ```

2. **Backend** (`.env.development`):
   ```bash
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

### Production Environment

1. **Frontend** (`.env.production`):
   ```bash
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Backend** (`.env.production`):
   ```bash
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.com
   ```

## Security Considerations

### API Key Management

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate API keys regularly**
4. **Use least privilege principle for API keys**

### CORS Configuration

Update CORS settings in backend for production:

```javascript
// backend/src/server.js
app.use(cors({
  origin: [
    'https://your-frontend-url.com',
    'http://localhost:5173', // development
    'http://localhost:8080'  // alternative dev port
  ],
  credentials: true
}));
```

### Rate Limiting

Configure rate limiting for production:

```javascript
// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Monitoring and Logging

### Health Checks

1. **Backend Health Endpoint:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Frontend Health Check:**
   - Monitor GitHub Pages deployment status
   - Set up uptime monitoring (UptimeRobot, Pingdom)

### Logging

1. **Backend Logging:**
   ```javascript
   // backend/src/utils/logger.js
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Frontend Error Tracking:**
   - Integrate Sentry for error tracking
   - Use browser console logging for debugging

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check CORS configuration in backend
   - Verify frontend URL is in allowed origins

2. **API Key Issues:**
   - Verify environment variables are set correctly
   - Check API key permissions and quotas

3. **Database Connection:**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debug Commands

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend build
npm run build

# Test database connection
npm run test:db

# View logs
docker logs container_name
```

## Performance Optimization

### Frontend

1. **Code Splitting:**
   - Use React.lazy() for route-based splitting
   - Implement dynamic imports for large components

2. **Caching:**
   - Configure service worker for offline support
   - Use React Query for API response caching

3. **Bundle Optimization:**
   - Analyze bundle size with `npm run build -- --analyze`
   - Remove unused dependencies

### Backend

1. **Database Optimization:**
   - Add indexes for frequently queried columns
   - Use connection pooling
   - Implement query caching

2. **API Optimization:**
   - Implement response compression
   - Use pagination for large datasets
   - Add request/response caching

This deployment documentation provides comprehensive guidance for deploying the OMOP Query Assistant across different platforms and environments. 