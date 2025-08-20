'use client';

import { TRPCReactProvider } from '~/trpc/react';
import { NextAuthProvider } from './next-auth-provider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </NextAuthProvider>
  );
}
