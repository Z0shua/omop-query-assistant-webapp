import express from 'express';
import { validateQueryRequest } from '../middleware/validation.js';
import { QueryService } from '../services/queryService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const queryService = new QueryService();

// Convert natural language to SQL
router.post('/nl-to-sql', validateQueryRequest, async (req, res, next) => {
  try {
    const { naturalLanguage, provider, credentials } = req.body;
    
    logger.info(`Converting NL to SQL: ${naturalLanguage.substring(0, 100)}...`);
    
    const result = await queryService.convertNaturalLanguageToSQL(
      naturalLanguage, 
      provider, 
      credentials
    );
    
    res.json({
      success: true,
      sql: result.sql,
      explanation: result.explanation,
      provider: result.provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Execute SQL query
router.post('/execute', async (req, res, next) => {
  try {
    const { sql, databaseConfig } = req.body;
    
    logger.info(`Executing SQL query: ${sql.substring(0, 100)}...`);
    
    const result = await queryService.executeQuery(sql, databaseConfig);
    
    res.json({
      success: true,
      data: result.data,
      columns: result.columns,
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Combined endpoint: NL to SQL + Execute
router.post('/process', validateQueryRequest, async (req, res, next) => {
  try {
    const { naturalLanguage, provider, credentials, databaseConfig } = req.body;
    
    logger.info(`Processing complete query: ${naturalLanguage.substring(0, 100)}...`);
    
    // Step 1: Convert NL to SQL
    const nlResult = await queryService.convertNaturalLanguageToSQL(
      naturalLanguage, 
      provider, 
      credentials
    );
    
    if (!nlResult.success) {
      return res.status(400).json({
        success: false,
        error: nlResult.error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 2: Execute SQL (if database config provided)
    let executionResult = null;
    if (databaseConfig) {
      executionResult = await queryService.executeQuery(nlResult.sql, databaseConfig);
    }
    
    res.json({
      success: true,
      naturalLanguage,
      sql: nlResult.sql,
      explanation: nlResult.explanation,
      provider: nlResult.provider,
      execution: executionResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get supported AI providers
router.get('/providers', (req, res) => {
  res.json({
    providers: [
      {
        id: 'openai',
        name: 'OpenAI GPT',
        description: 'OpenAI GPT models for natural language processing'
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        description: 'Anthropic Claude models for natural language processing'
      },
      {
        id: 'google',
        name: 'Google AI',
        description: 'Google AI models for natural language processing'
      }
    ]
  });
});

export default router; 