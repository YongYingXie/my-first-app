import type { Metadata } from 'next';
import { AuthProvider } from '~/components/auth-provider';
import { UserMenu } from './_components/user-menu';
import '~/styles/globals.css';

export const metadata: Metadata = {
  title: 'My Memo - 智能待办事项管理',
  description: '一个现代化的待办事项管理应用，帮助你更好地组织生活和工作',
  keywords: '待办事项,任务管理,生产力,时间管理',
  authors: [{ name: 'My Memo Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="font-sans antialiased h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-colors duration-300">
        <AuthProvider>
          <div className="h-full flex flex-col" style={{ minHeight: '100vh' }}>
            {/* 导航栏 */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm z-50 transition-colors duration-300 flex-shrink-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <div className="flex items-center">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      My Memo
                    </span>
                  </div>

                  {/* 右侧菜单 */}
                  <div className="flex items-center gap-4">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </nav>

            {/* 主要内容 */}
            <main className="flex-1 overflow-hidden">{children}</main>

            {/* 页脚 */}
            <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 transition-colors duration-300 flex-shrink-0">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>© 2024 My Memo. 让生活更有条理，让工作更高效。</p>
                  <p className="mt-2">使用 Next.js, TypeScript, Tailwind CSS 和 Prisma 构建</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
