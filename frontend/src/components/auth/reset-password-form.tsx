'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { AIContainer } from '@/components/ui/ai-container';
import { AIButton } from '@/components/ui/ai-button';
import { AIInput } from '@/components/ui/ai-input';
import { AIText } from '@/components/ui/ai-text';
import { AICard } from '@/components/ui/ai-card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
      <AIContainer variant="glass" glowing className="max-w-md mx-auto p-8">
        <div className="space-y-4 text-center">
          <AIText variant="gradient" as="h1" className="text-3xl font-bold">
            Đặt lại mật khẩu
          </AIText>
          <AIText variant="neon" className="text-red-500">
            Token không hợp lệ hoặc đã hết hạn.
          </AIText>
          <div className="mt-6">
            <Link href="/forgot-password" className="ai-text text-primary hover:text-primary/80">
              Yêu cầu đặt lại mật khẩu mới
            </Link>
          </div>
        </div>
      </AIContainer>
    );
  }

  return (
    <AIContainer variant="glass" glowing className="max-w-md mx-auto p-8">
      <div className="space-y-4 text-center">
        <AIText variant="gradient" as="h1" className="text-3xl font-bold">
          Đặt lại mật khẩu
        </AIText>
        <AIText variant="typing" className="text-muted-foreground" delay={500} speed={30}>
          Nhập mật khẩu mới của bạn để tiếp tục...
        </AIText>
      </div>

      {error && (
        <AICard variant="gradient" className="mt-6 p-4 border-destructive/50">
          <AIText variant="glitch" className="text-destructive text-sm">
            {error}
          </AIText>
        </AICard>
      )}

      {success && (
        <AICard variant="gradient" className="mt-6 p-4 border-green-500/50">
          <div className="space-y-2">
            <AIText variant="neon" className="text-green-500 text-sm">
              {success}
            </AIText>
            <p className="text-sm text-muted-foreground">
              Đang chuyển hướng đến trang đăng nhập...
              <span className="inline-block ml-2 animate-pulse">●</span>
              <span className="inline-block ml-1 animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="inline-block ml-1 animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
            </p>
          </div>
        </AICard>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Mật khẩu mới</FormLabel>
                <FormControl>
                  <AIInput 
                    type="password" 
                    placeholder="••••••" 
                    variant="neon" 
                    glow 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <AIInput 
                    type="password" 
                    placeholder="••••••" 
                    variant="neon" 
                    glow 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <AIButton 
            type="submit" 
            variant="gradient" 
            glow 
            className="w-full" 
            loading={isSubmitting} 
            disabled={isSubmitting || !!success}
          >
            Đặt lại mật khẩu
          </AIButton>
        </form>
      </Form>

      {!success && (
        <div className="text-center mt-6">
          <Link href="/login" className="ai-text text-primary hover:text-primary/80">
            Quay lại đăng nhập
          </Link>
        </div>
      )}
    </AIContainer>
  );
}