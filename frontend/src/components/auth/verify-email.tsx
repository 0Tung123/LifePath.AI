'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuthStore();

  useEffect(() => {
    if (token) {
      verifyEmailWithToken(token);
    }
  }, [token]);

  async function verifyEmailWithToken(token: string) {
    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      await verifyEmail(token);
      setSuccess('Email đã được xác thực thành công!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xác thực email. Vui lòng thử lại.');
    } finally {
      setIsVerifying(false);
    }
  }

  if (isVerifying) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Xác thực email</h1>
          <p className="text-gray-500">Đang xác thực email của bạn...</p>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Xác thực email</h1>
          <p className="text-red-500">{error}</p>
          <div className="mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Xác thực email</h1>
          <p className="text-green-500">{success}</p>
          <p className="text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Xác thực email</h1>
          <p className="text-red-500">Token không hợp lệ hoặc đã hết hạn.</p>
          <div className="mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}