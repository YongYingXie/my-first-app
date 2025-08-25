'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <article className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // 链接支持
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),

          // 图片支持
          img: ({ src, alt, ...props }: any) => (
            <div className="my-4">
              <Image
                src={src || ''}
                alt={alt || ''}
                width={800}
                height={600}
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                onError={() => {
                  // Next.js Image 组件会自动处理错误
                }}
                {...props}
              />
              {alt && <div className="text-sm text-gray-500 text-center mt-2">{alt}</div>}
            </div>
          ),

          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className?.includes('language-');
            return !isInline && match ? (
              <SyntaxHighlighter style={materialDark} language={match[1]} PreTag="div">
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm`} {...props}>
                {String(children)}
              </code>
            );
          },

          // 增强的表格支持，包括对齐功能
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),

          th: ({ children, align, ...props }: any) => {
            const alignmentClass =
              align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
            return (
              <th
                className={`border border-gray-300 px-3 py-2 bg-gray-50 font-semibold ${alignmentClass}`}
                {...props}
              >
                {children}
              </th>
            );
          },

          td: ({ children, align, ...props }: any) => {
            const alignmentClass =
              align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
            return (
              <td className={`border border-gray-300 px-3 py-2 ${alignmentClass}`} {...props}>
                {children}
              </td>
            );
          },

          // 自定义列表样式
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
          ),

          // 自定义标题样式
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h3>
          ),

          // 自定义引用样式
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
