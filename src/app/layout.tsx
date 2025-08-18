import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';

import { TRPCReactProvider } from '~/trpc/react';
import { UserMenu } from './_components/user-menu';

import '~/styles/globals.css';

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="zh-CN">
      <body>
        <TRPCReactProvider>
          <div className="min-h-screen bg-gray-50">
            {/* 导航栏 */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">My Todo App</h1>
                  </div>
                  <UserMenu />
                </div>
              </div>
            </nav>

            {/* 主要内容 */}
            <main>{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
