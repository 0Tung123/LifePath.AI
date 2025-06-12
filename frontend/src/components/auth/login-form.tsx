'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const messages = [
      "Chào mừng trở lại hệ thống AI",
      "Đăng nhập để tiếp tục cuộc phiêu lưu",
      "Hệ thống đang chờ kết nối với bạn",
      "Xác thực danh tính để truy cập",
      "Cổng vào thế giới AI đang mở"
    ];
    setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AIContainer variant="glass" glowing className="max-w-md mx-auto p-8">
      <div className="space-y-4 text-center">
        <AIText variant="gradient" as="h1" className="text-3xl font-bold">
          Đăng nhập
        </AIText>
        <AIText variant="typing" className="text-muted-foreground" delay={500} speed={30}>
          {welcomeMessage}
        </AIText>
      </div>

      {error && (
        <AICard variant="gradient" className="mt-6 p-4 border-destructive/50">
          <AIText variant="glitch" className="text-destructive text-sm">
            {error}
          </AIText>
        </AICard>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Email</FormLabel>
                <FormControl>
                  <AIInput 
                    placeholder="user@example.com" 
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Mật khẩu</FormLabel>
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

          <div className="text-right text-sm">
            <Link
              href="/forgot-password"
              className="ai-text text-primary hover:text-primary/80"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <AIButton 
            type="submit" 
            variant="gradient" 
            glow 
            className="w-full" 
            loading={isSubmitting}
          >
            Đăng nhập
          </AIButton>
        </form>
      </Form>

      <div className="text-center mt-6">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link href="/signup" className="ai-text text-primary hover:text-primary/80">
          Đăng ký
        </Link>
      </div>
      
      <div className="mt-8 pt-6 border-t border-border text-center">
        <AIText variant="neon" className="text-xs text-muted-foreground">
          SYSTEM v2.4.7 // NEURAL INTERFACE READY
        </AIText>
      </div>
    </AIContainer>
  );
}