const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface QueryRequest {
  naturalLanguage: string;
  provider: string;
  credentials?: {
    apiKey?: string;
    model?: string;
    endpoint?: string;
  };
}

export interface ExecuteRequest {
  sql: string;
  databaseConfig: {
    type: 'postgresql' | 'postgres' | 'sqlite' | 'mock';
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    file?: string;
  };
}

export interface QueryResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  provider?: string;
  timestamp?: string;
  error?: string;
}

export interface ExecuteResponse {
  success: boolean;
  data?: any[];
  columns?: string[];
  rowCount?: number;
  executionTime?: number;
  timestamp?: string;
  error?: string;
}

export interface ProcessResponse {
  success: boolean;
  naturalLanguage?: string;
  sql?: string;
  explanation?: string;
  provider?: string;
  execution?: {
    data: any[];
    columns: string[];
    rowCount: number;
    executionTime: number;
  };
  timestamp?: string;
  error?: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async convertNaturalLanguageToSQL(request: QueryRequest): Promise<QueryResponse> {
    return this.makeRequest<QueryResponse>('/query/nl-to-sql', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async executeQuery(request: ExecuteRequest): Promise<ExecuteResponse> {
    return this.makeRequest<ExecuteResponse>('/query/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async processQuery(
    naturalLanguage: string,
    provider: string,
    credentials: any,
    databaseConfig?: any
  ): Promise<ProcessResponse> {
    return this.makeRequest<ProcessResponse>('/query/process', {
      method: 'POST',
      body: JSON.stringify({
        naturalLanguage,
        provider,
        credentials,
        databaseConfig,
      }),
    });
  }

  async getProviders(): Promise<{ providers: Provider[] }> {
    return this.makeRequest<{ providers: Provider[] }>('/query/providers');
  }

  async getHealth(): Promise<any> {
    return this.makeRequest('/health');
  }

  async getDetailedHealth(): Promise<any> {
    return this.makeRequest('/health/detailed');
  }
}

export const apiService = new ApiService(); 