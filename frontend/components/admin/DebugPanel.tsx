// Create this as components/admin/DebugPanel.tsx
import React, { useState } from 'react';
import { api } from '@/lib/api';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing API connection...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Token:', localStorage.getItem('admin_token') ? 'Present' : 'Missing');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('Debug response:', data);
      setDebugInfo(data);
    } catch (err: any) {
      console.error('Debug error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testStudentsEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing students endpoint...');
      const response = await api.admin.students.getAll({ per_page: 5 });
      console.log('Students response:', response);
      setDebugInfo(response);
    } catch (err: any) {
      console.error('Students endpoint error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing auth endpoint...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/auth`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('Auth response:', data);
      setDebugInfo(data);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-red-300 p-6 mb-6">
      <h2 className="text-lg font-bold text-red-600 mb-4">🔧 Debug Panel (Remove in Production)</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={testStudentsEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Students Endpoint
          </button>
          
          <button
            onClick={testAuthEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Auth
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Configuration:</h3>
          <div className="text-sm space-y-1">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set!'}</p>
            <p><strong>Admin Token:</strong> {localStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing'}</p>
            <p><strong>Regular Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>

        {loading && (
          <div className="text-blue-600 font-semibold">Loading...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {debugInfo && (
          <div className="bg-green-50 border border-green-300 p-4 rounded">
            <h3 className="font-semibold mb-2">Response:</h3>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;