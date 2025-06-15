import Joi from 'joi';
import { logger } from '../utils/logger.js';

const queryRequestSchema = Joi.object({
  naturalLanguage: Joi.string().required().min(1).max(1000),
  provider: Joi.string().valid('openai', 'anthropic', 'google').required(),
  credentials: Joi.object({
    apiKey: Joi.string().optional(),
    model: Joi.string().optional(),
    endpoint: Joi.string().optional()
  }).optional()
});

const executeRequestSchema = Joi.object({
  sql: Joi.string().required().min(1),
  databaseConfig: Joi.object({
    type: Joi.string().valid('postgresql', 'postgres', 'sqlite', 'mock').required(),
    host: Joi.string().optional(),
    port: Joi.number().optional(),
    database: Joi.string().optional(),
    user: Joi.string().optional(),
    password: Joi.string().optional(),
    file: Joi.string().optional()
  }).required()
});

export const validateQueryRequest = (req, res, next) => {
  const { error } = queryRequestSchema.validate(req.body);
  
  if (error) {
    logger.warn('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: error.details[0].message
    });
  }
  
  next();
};

export const validateExecuteRequest = (req, res, next) => {
  const { error } = executeRequestSchema.validate(req.body);
  
  if (error) {
    logger.warn('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: error.details[0].message
    });
  }
  
  next();
}; 