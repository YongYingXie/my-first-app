'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Lock, Mail, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { validateField } from '~/lib/validation';
import { api } from '~/trpc/react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push('/auth/signin?message=Account created successfully');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const validateForm = () => {
    const nameValidation = validateField('name', name);
    const emailValidation = validateField('email', email);
    const passwordValidation = validateField('password', password);

    setNameError(nameValidation.message);
    setEmailError(emailValidation.message);
    setPasswordError(passwordValidation.message);

    return nameValidation.isValid && emailValidation.isValid && passwordValidation.isValid;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value) {
      const validation = validateField('name', value);
      setNameError(validation.message);
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const validation = validateField('email', value);
      setEmailError(validation.message);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const validation = validateField('password', value);
      setPasswordError(validation.message);
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password,
      });
    } catch (_error) {
      // Error is handled by the mutation
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, color: 'gray', text: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { strength, color: 'red', text: '弱' };
    if (strength <= 2) return { strength, color: 'yellow', text: '中' };
    return { strength, color: 'green', text: '强' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            注册账号
          </h2>
          <p className="mt-3 text-gray-600">
            或者{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              登录现有账号
            </Link>
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor={nameId} className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <Input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  error={!!nameError}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {nameError}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor={emailId} className="block text-sm font-medium text-gray-700">
                  邮箱地址
                </label>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  error={!!emailError}
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="请输入邮箱地址"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <Input
                  id={passwordId}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  error={!!passwordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />

                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-red-500'
                              : passwordStrength.color === 'yellow'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <Badge
                        variant={
                          passwordStrength.color === 'red'
                            ? 'destructive'
                            : passwordStrength.color === 'yellow'
                              ? 'warning'
                              : 'success'
                        }
                        className="text-xs"
                      >
                        {passwordStrength.text}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle
                          className={`w-3 h-3 ${
                            password.length >= 6 ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        至少6位
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle
                          className={`w-3 h-3 ${
                            /[a-zA-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        包含字母
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle
                          className={`w-3 h-3 ${
                            /[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        包含数字
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle
                          className={`w-3 h-3 ${
                            /[^a-zA-Z0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        特殊字符
                      </div>
                    </div>
                  </motion.div>
                )}

                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {passwordError}
                  </motion.p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !!nameError || !!emailError || !!passwordError}
                loading={isLoading}
                variant="gradient"
                size="lg"
                className="w-full group"
              >
                {isLoading ? (
                  '创建账号中...'
                ) : (
                  <>
                    创建账号
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.form>
      </div>
    </div>
  );
}
