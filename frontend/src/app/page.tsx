'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function Home() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    api
      .get('/')
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error('API Error:', err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to My App</h1>
      <p className="mt-4">Backend says: {message || 'Loading...'}</p>
    </main>
  );
}