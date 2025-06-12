"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "Vui lòng nhập tên" }),
  lastName: z.string().min(1, { message: "Vui lòng nhập họ" }),
  email: z.string().email({ message: "Email không hợp lệ" }).optional(),
  profilePicture: z
    .string()
    .url({ message: "URL không hợp lệ" })
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, updateProfile } = useAuthStore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture,
      });
      setSuccess("Thông tin cá nhân đã được cập nhật thành công.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <AIText variant="gradient" as="h3" className="text-xl font-bold">
          Thông tin cá nhân
        </AIText>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin cá nhân của bạn trong hệ thống AI Narrative
        </p>
      </div>

      {error && (
        <AICard variant="gradient" className="p-4 border-destructive/50">
          <AIText variant="glitch" className="text-destructive text-sm">
            {error}
          </AIText>
        </AICard>
      )}

      {success && (
        <AICard variant="gradient" className="p-4 border-green-500/50">
          <AIText variant="neon" className="text-green-500 text-sm">
            {success}
          </AIText>
        </AICard>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Tên</FormLabel>
                  <FormControl>
                    <AIInput variant="neon" glow placeholder="Tên" {...field} />
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
                    <AIInput variant="neon" glow placeholder="Họ" {...field} />
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
                    variant="terminal"
                    placeholder="email@example.com"
                    {...field}
                    disabled
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  URL ảnh đại diện
                </FormLabel>
                <FormControl>
                  <AIInput
                    variant="neon"
                    glow
                    placeholder="https://example.com/avatar.jpg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập URL hình ảnh để sử dụng làm ảnh đại diện
                </p>
              </FormItem>
            )}
          />

          <div className="pt-4 border-t border-[rgb(var(--border))]">
            <AIButton
              type="submit"
              variant="gradient"
              glow
              className="w-full md:w-auto"
              loading={isSubmitting}
            >
              Cập nhật thông tin
            </AIButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
