'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'Vui lòng nhập tên' }),
  lastName: z.string().min(1, { message: 'Vui lòng nhập họ' }),
  email: z.string().email({ message: 'Email không hợp lệ' }).optional(),
  profilePicture: z.string().url({ message: 'URL không hợp lệ' }).optional().or(z.literal('')),
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
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      profilePicture: user?.profilePicture || '',
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
      setSuccess('Thông tin cá nhân đã được cập nhật thành công.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
        <p className="text-sm text-gray-500">
          Cập nhật thông tin cá nhân của bạn
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <Input placeholder="Họ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL ảnh đại diện</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Button>
        </form>
      </Form>
    </div>
  );
}