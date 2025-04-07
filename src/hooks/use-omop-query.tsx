
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeOMOPQuery } from '@/services/omopApiService';
import { toast } from 'sonner';
import { useCredentials } from './use-credentials';

interface UseOMOPQueryProps {
  sql?: string;
  naturalLanguage?: string;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useOMOPQuery({
  sql,
  naturalLanguage,
  enabled = true,
  onSuccess,
  onError
}: UseOMOPQueryProps) {
  const { credentials } = useCredentials();
  const [result, setResult] = useState<any>(null);
  
  // Check if we have the minimum required credentials
  const canExecuteQuery = !!credentials.selectedProvider && (
    (credentials.selectedProvider === 'azure' && !!credentials.azure.apiKey) ||
    (credentials.selectedProvider === 'anthropic' && !!credentials.anthropic.apiKey) ||
    (credentials.selectedProvider === 'google' && !!credentials.google.apiKey) ||
    (credentials.selectedProvider === 'deepseek' && !!credentials.deepseek.apiKey)
  );
  
  const queryResult = useQuery({
    queryKey: ['omop-query', sql, naturalLanguage],
    queryFn: async () => {
      // If we don't have enough credentials to make this query
      if (!canExecuteQuery) {
        throw new Error('Missing credentials. Please configure your AI provider in Settings.');
      }
      
      // If we have neither SQL nor naturalLanguage, throw an error
      if (!sql && !naturalLanguage) {
        throw new Error('Either SQL or naturalLanguage query must be provided');
      }
      
      try {
        const response = await executeOMOPQuery({
          sql,
          naturalLanguage
        });
        
        if (!response.success) {
          throw new Error(response.error || 'Query execution failed');
        }
        
        setResult(response);
        return response;
      } catch (error) {
        console.error('Error executing OMOP query:', error);
        throw error;
      }
    },
    enabled: enabled && canExecuteQuery && !!(sql || naturalLanguage)
  });
  
  return {
    ...queryResult,
    result,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
}
