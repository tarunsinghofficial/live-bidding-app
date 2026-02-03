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

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Glassmorphic Card */}
        <div className="relative p-8 bg-white/25 backdrop-blur-xl rounded-3xl border-0 shadow-2xl overflow-hidden">
          {/* Gradient overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E2E687]/20 to-transparent opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                  <Gavel className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Create Account
              </h2>
              <p className="text-muted-foreground">
                Join our community and start bidding
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </Label>
                    <Input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                      placeholder="First Name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </Label>
                    <Input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                      placeholder="Last Name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </Label>
                  <Input
                    {...register('username')}
                    type="text"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                    placeholder="Choose a username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </Label>
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </Label>
                  <Input
                    {...register('password')}
                    type="password"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </Label>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30 transition-all"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full px-6 py-3 shadow-none bg-[#E2E687] text-primary rounded-2xl hover:bg-[#E2E687]/90 hover:shadow-lg transition-all font-medium"
              >
                {isSubmitting || loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 backdrop-blur rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 backdrop-blur rounded-full translate-y-8 -translate-x-8"></div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
