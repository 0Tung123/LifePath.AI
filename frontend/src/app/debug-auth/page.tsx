'use client';

import { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import api from '@/services/api';

export default function DebugAuthPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setErrors((prev) => [...prev, 'Invalid user data in localStorage']);
        }
      }
    }
  }, []);

  const testApiCall = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfileData(response.data);
      setErrors((prev) => [...prev, 'API call successful']);
    } catch (error: any) {
      setErrors((prev) => [
        ...prev,
        `API call failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
      ]);
    }
  };

  const testAuthService = async () => {
    try {
      const profile = await authService.getProfile();
      setProfileData(profile);
      setErrors((prev) => [...prev, 'Auth service call successful']);
    } catch (error: any) {
      setErrors((prev) => [
        ...prev,
        `Auth service call failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

        <div className="space-y-6">
          {/* Token Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Token Information</h2>
            <div className="space-y-2">
              <p>
                <strong>Token exists:</strong> {token ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Token length:</strong> {token ? token.length : 'N/A'}
              </p>
              <p>
                <strong>Token preview:</strong>{' '}
                {token ? `${token.substring(0, 50)}...` : 'N/A'}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              User Information (from localStorage)
            </h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'No user data'}
            </pre>
          </div>

          {/* Test Buttons */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Test API Calls</h2>
            <div className="space-x-4">
              <button
                onClick={testApiCall}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Direct API Call
              </button>
              <button
                onClick={testAuthService}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Auth Service
              </button>
            </div>
          </div>

          {/* Profile Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Profile Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {profileData
                ? JSON.stringify(profileData, null, 2)
                : 'No profile data yet'}
            </pre>
          </div>

          {/* Errors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Debug Log</h2>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
