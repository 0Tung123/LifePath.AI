'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  confirmPassword: z.string().min(6, { message: 'Vui lòng xác nhận mật khẩu' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuthStore();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword(token, data.password);
      setSuccess('Mật khẩu đã được đặt lại thành công.');
      form.reset();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
          <p className="text-red-500">Token không hợp lệ hoặc đã hết hạn.</p>
          <div className="mt-4">
            <Link href="/forgot-password" className="text-blue-500 hover:underline">
              Yêu cầu đặt lại mật khẩu mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-gray-500">Nhập mật khẩu mới của bạn</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
          {success}
          <p className="mt-2">Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting || !!success}>
            {isSubmitting ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
          </Button>
        </form>
      </Form>

      {!success && (
        <div className="text-center text-sm">
          <Link href="/login" className="text-blue-500 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      )}
    </div>
  );
}