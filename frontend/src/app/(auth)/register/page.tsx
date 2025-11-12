'use client';
//ft

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

// Validation schema
const registerSchema = z
  .object({
    company_name: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;

      const response = await authApi.register(registerData);

      if (response.success) {
        // Store user and token in auth store
        login(response.data.user, response.data.token);

        toast({
          title: 'Success',
          description: 'Account created successfully',
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Registration failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 mb-8">Start managing your tour operations</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="company_name"
                type="text"
                placeholder="Your Tour Company"
                className="w-full"
                {...register('company_name')}
                disabled={isLoading}
              />
              {errors.company_name && (
                <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="w-full"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label
                htmlFor="contact_phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="+1 234 567 8900"
                className="w-full"
                {...register('contact_phone')}
                disabled={isLoading}
              />
              {errors.contact_phone && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                id="address"
                type="text"
                placeholder="Company address"
                className="w-full"
                {...register('address')}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="w-full"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Tour Operations SaaS - Powered by Next.js
        </p>
      </div>
    </main>
  );
}
