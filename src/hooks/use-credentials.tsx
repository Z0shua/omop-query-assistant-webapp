
import { useState, useEffect } from 'react';

interface Credentials {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion?: string;
  modelName?: string;
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials>({
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    apiVersion: '2024-02-15-preview',
    modelName: 'gpt4o'
  });

  // Load credentials from localStorage on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('apiCredentials');
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials(parsedCredentials);
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
      }
    }
  }, []);

  // Save credentials to localStorage whenever they change
  const updateCredentials = (newCredentials: Credentials) => {
    setCredentials(newCredentials);
    localStorage.setItem('apiCredentials', JSON.stringify(newCredentials));
  };

  return { 
    credentials, 
    setCredentials: updateCredentials 
  };
}
