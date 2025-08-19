'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { validateField } from '~/lib/validation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 添加验证状态
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const router = useRouter();

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push('/auth/signin?message=Account created successfully');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // 实时验证函数
  const validateForm = () => {
    const nameValidation = validateField('name', name);
    const emailValidation = validateField('email', email);
    const passwordValidation = validateField('password', password);

    setNameError(nameValidation.message);
    setEmailError(emailValidation.message);
    setPasswordError(passwordValidation.message);

    return nameValidation.isValid && emailValidation.isValid && passwordValidation.isValid;
  };

  // 处理字段变化时的验证
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

    // 提交前验证表单
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  nameError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Full name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  emailError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Email address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  passwordError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Password (6-12 characters, must contain letters or special characters)"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
              <p className="mt-1 text-xs text-gray-500">
                密码长度6-12位，必须包含字母或特殊字符
              </p>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!nameError || !!emailError || !!passwordError}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
