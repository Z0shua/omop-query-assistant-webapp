import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

export class AIService {
  constructor() {
    this.openai = null;
    this.anthropic = null;
    this.googleAI = null;
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    // Initialize Google AI
    if (process.env.GOOGLE_API_KEY) {
      this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
  }

  async generateResponse(prompt, provider, credentials) {
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          return await this.generateOpenAIResponse(prompt, credentials);
        case 'anthropic':
          return await this.generateAnthropicResponse(prompt, credentials);
        case 'google':
          return await this.generateGoogleResponse(prompt, credentials);
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`Error generating response with ${provider}:`, error);
      throw error;
    }
  }

  async generateOpenAIResponse(prompt, credentials) {
    if (!this.openai && !credentials?.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const client = credentials?.apiKey 
      ? new OpenAI({ apiKey: credentials.apiKey })
      : this.openai;

    const response = await client.chat.completions.create({
      model: credentials?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SQL developer specializing in OMOP Common Data Model. Generate only SQL queries, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }

  async generateAnthropicResponse(prompt, credentials) {
    if (!this.anthropic && !credentials?.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const client = credentials?.apiKey 
      ? new Anthropic({ apiKey: credentials.apiKey })
      : this.anthropic;

    const response = await client.messages.create({
      model: credentials?.model || 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.1,
      system: 'You are an expert SQL developer specializing in OMOP Common Data Model. Generate only SQL queries, no explanations.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  }

  async generateGoogleResponse(prompt, credentials) {
    if (!this.googleAI && !credentials?.apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const apiKey = credentials?.apiKey || process.env.GOOGLE_API_KEY;
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ 
      model: credentials?.model || 'gemini-pro' 
    });

    const result = await model.generateContent([
      'You are an expert SQL developer specializing in OMOP Common Data Model. Generate only SQL queries, no explanations.',
      prompt
    ]);

    return result.response.text();
  }

  getAvailableProviders() {
    const providers = [];
    
    if (this.openai || process.env.OPENAI_API_KEY) {
      providers.push('openai');
    }
    
    if (this.anthropic || process.env.ANTHROPIC_API_KEY) {
      providers.push('anthropic');
    }
    
    if (this.googleAI || process.env.GOOGLE_API_KEY) {
      providers.push('google');
    }
    
    return providers;
  }
} 