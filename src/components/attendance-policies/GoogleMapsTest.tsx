import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function GoogleMapsTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const testGoogleMaps = async () => {
      try {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        setApiKey(key || 'Not found');
        
        if (!key) {
          setStatus('error');
          setErrorMessage('API key not found in environment variables');
          return;
        }

        // Test the API key by making a simple request
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=Delhi&key=${key}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK') {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testGoogleMaps();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Google Maps API Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {status === 'loading' && 'Testing API Key...'}
            {status === 'success' && 'API Key is working!'}
            {status === 'error' && 'API Key has issues'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div>
            <strong>API Key:</strong> 
            <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              {apiKey.substring(0, 20)}...
            </code>
          </div>
          
          {status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <strong className="text-red-800 dark:text-red-200">Error Details:</strong>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{errorMessage}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your Google Maps API key is working correctly! The location tracker should work now.
              </p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Common Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Billing not enabled for your Google Cloud project</li>
            <li>Maps JavaScript API not enabled</li>
            <li>API key restrictions too strict</li>
            <li>Quota exceeded</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}