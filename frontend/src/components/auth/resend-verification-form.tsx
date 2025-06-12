"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const resendVerificationSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

export function ResendVerificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resendVerification } = useAuthStore();

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResendVerificationFormValues) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await resendVerification(data.email);
      setSuccess(
        "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
      );
      form.reset();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể gửi lại email xác thực. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Gửi lại email xác thực</h1>
        <p className="text-gray-500">
          Nhập email của bạn để nhận lại email xác thực
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi lại email xác thực"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-blue-500 hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
