import { AIService } from './aiService.js';
import { DatabaseService } from './databaseService.js';
import { logger } from '../utils/logger.js';

export class QueryService {
  constructor() {
    this.aiService = new AIService();
    this.databaseService = new DatabaseService();
  }

  async convertNaturalLanguageToSQL(naturalLanguage, provider, credentials) {
    try {
      logger.info(`Converting natural language to SQL using ${provider}`);
      
      const prompt = this.buildOMPrompt(naturalLanguage);
      
      const response = await this.aiService.generateResponse(
        prompt,
        provider,
        credentials
      );
      
      // Extract SQL from AI response
      const sql = this.extractSQLFromResponse(response);
      
      if (!sql) {
        return {
          success: false,
          error: 'Could not extract valid SQL from AI response'
        };
      }
      
      return {
        success: true,
        sql: sql,
        explanation: response,
        provider: provider
      };
    } catch (error) {
      logger.error('Error converting NL to SQL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeQuery(sql, databaseConfig) {
    try {
      logger.info('Executing SQL query');
      
      const startTime = Date.now();
      const result = await this.databaseService.executeQuery(sql, databaseConfig);
      const executionTime = Date.now() - startTime;
      
      return {
        data: result.rows || [],
        columns: result.columns || [],
        rowCount: result.rowCount || 0,
        executionTime: executionTime
      };
    } catch (error) {
      logger.error('Error executing query:', error);
      throw error;
    }
  }

  buildOMPrompt(naturalLanguage) {
    return `You are an expert in OMOP Common Data Model (CDM) and SQL. 
    
Your task is to convert natural language questions about medical data into accurate SQL queries for OMOP CDM v5.4.

OMOP CDM Core Tables:
- PERSON: patient demographics (person_id, gender_concept_id, birth_datetime, etc.)
- OBSERVATION_PERIOD: time periods when person is observed
- VISIT_OCCURRENCE: patient encounters (visit_occurrence_id, person_id, visit_start_datetime, etc.)
- CONDITION_OCCURRENCE: diagnoses (condition_occurrence_id, person_id, condition_concept_id, condition_start_datetime, etc.)
- DRUG_EXPOSURE: medications (drug_exposure_id, person_id, drug_concept_id, drug_exposure_start_datetime, etc.)
- PROCEDURE_OCCURRENCE: procedures (procedure_occurrence_id, person_id, procedure_concept_id, procedure_datetime, etc.)
- MEASUREMENT: lab tests and clinical measurements (measurement_id, person_id, measurement_concept_id, measurement_datetime, etc.)
- OBSERVATION: observations that don't fit other domains

Vocabulary Tables:
- CONCEPT: standard concepts (concept_id, concept_name, domain_id, vocabulary_id, etc.)
- CONCEPT_RELATIONSHIP: relationships between concepts
- VOCABULARY: vocabulary definitions

Key Relationships:
- person_id links most tables to PERSON
- concept_id fields link to CONCEPT table for standardized terminology
- Use JOINs to connect related tables

Natural Language Question: "${naturalLanguage}"

Please generate a SQL query that answers this question. Return ONLY the SQL query, no explanations or additional text.`;
  }

  extractSQLFromResponse(response) {
    // Try to extract SQL from code blocks
    const codeBlockMatch = response.match(/```sql\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // Try to extract SQL from backticks
    const backtickMatch = response.match(/`([\s\S]*?)`/);
    if (backtickMatch) {
      return backtickMatch[1].trim();
    }
    
    // If no code blocks, assume the entire response is SQL
    return response.trim();
  }
} 