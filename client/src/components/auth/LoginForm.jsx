import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Gavel } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Glassmorphic Card */}
        <div className="relative p-8 overflow-hidden border-0 shadow-2xl bg-white/25 backdrop-blur-xl rounded-3xl">
          {/* Gradient overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E2E687]/20 to-transparent opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/30 backdrop-blur">
                  <Gavel className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="block mb-2 text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="block mb-2 text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full px-6 py-3 shadow-none bg-[#E2E687] text-primary rounded-2xl hover:bg-[#E2E687]/90 hover:shadow-lg transition-all font-medium"
              >
                {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 rounded-full bg-white/10 backdrop-blur"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 -translate-x-8 translate-y-8 rounded-full bg-white/10 backdrop-blur"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
