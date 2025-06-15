import express from 'express';
import { DatabaseService } from '../services/databaseService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const databaseService = new DatabaseService();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check with database connectivity
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown',
        ai_providers: 'unknown'
      }
    };

    // Check database connectivity
    try {
      await databaseService.testConnection();
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check AI provider availability
    const aiProviders = ['openai', 'anthropic', 'google'];
    const availableProviders = aiProviders.filter(provider => {
      const envVar = `${provider.toUpperCase()}_API_KEY`;
      return process.env[envVar];
    });
    
    health.services.ai_providers = availableProviders.length > 0 ? 'available' : 'unavailable';
    health.available_ai_providers = availableProviders;

    res.json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 