"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AIContainer } from "@/components/ui/ai-container";
import { AIButton } from "@/components/ui/ai-button";
import { AIInput } from "@/components/ui/ai-input";
import { AIText } from "@/components/ui/ai-text";
import { AICard } from "@/components/ui/ai-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z
  .object({
    firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const router = useRouter();
  const { signup } = useAuthStore();

  useEffect(() => {
    const messages = [
      "Chào mừng đến với hệ thống AI",
      "Tạo tài khoản để bắt đầu cuộc phiêu lưu",
      "Một bước nữa để khám phá thế giới AI",
      "Đăng ký để trải nghiệm công nghệ tương lai",
      "Chuẩn bị kết nối với trí tuệ nhân tạo",
    ];
    setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      await signup(data.email, data.password, data.firstName, data.lastName);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AIContainer variant="glass" glowing className="max-w-md mx-auto p-8">
      <div className="space-y-4 text-center">
        <AIText variant="gradient" as="h1" className="text-3xl font-bold">
          Đăng ký
        </AIText>
        <AIText
          variant="typing"
          className="text-muted-foreground"
          delay={500}
          speed={30}
        >
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Tên</FormLabel>
                  <FormControl>
                    <AIInput placeholder="Tên" variant="neon" glow {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Họ</FormLabel>
                  <FormControl>
                    <AIInput placeholder="Họ" variant="neon" glow {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  Xác nhận mật khẩu
                </FormLabel>
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
          >
            Đăng ký
          </AIButton>
        </form>
      </Form>

      <div className="text-center mt-6">
        <span className="text-muted-foreground">Đã có tài khoản? </span>
        <Link
          href="/login"
          className="ai-text text-primary hover:text-primary/80"
        >
          Đăng nhập
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
