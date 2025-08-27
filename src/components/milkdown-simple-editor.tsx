'use client';

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo,
  Table,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface MilkdownSimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  readOnly?: boolean;
  compact?: boolean;
}

const MilkdownSimpleEditor: React.FC<MilkdownSimpleEditorProps> = ({
  value,
  onChange,
  placeholder = '开始编写...',
  className = '',
  label = '内容',
  readOnly = false,
  compact = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const buttonSize = compact ? 'h-6 w-6' : 'h-8 w-8';
  const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const editorHeight = compact ? 'min-h-[120px]' : 'min-h-[400px]';
  const padding = compact ? 'p-3' : 'p-6';

  // 插入 Markdown 语法
  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let insertText = syntax;
    if (placeholder) {
      insertText = syntax.replace('$1', placeholder);
    }

    const newText = text.substring(0, start) + insertText + text.substring(end);
    textarea.value = newText;

    // 设置光标位置
    const newCursorPos = start + insertText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();

    // 触发 onChange
    onChange(newText);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 工具栏 */}
      <div
        className={`flex items-center gap-1 bg-gray-50 border border-gray-200 rounded p-1 ${compact ? 'p-1' : 'p-2'}`}
      >
        <span className={`text-xs text-gray-500 mr-2 px-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>

        {/* 文本格式 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('**$1**', '粗体文本')}
            className={`${buttonSize} p-0`}
            title="粗体 (Ctrl+B)"
          >
            <Bold className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('*$1*', '斜体文本')}
            className={`${buttonSize} p-0`}
            title="斜体 (Ctrl+I)"
          >
            <Italic className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('`$1`', '代码')}
            className={`${buttonSize} p-0`}
            title="行内代码"
          >
            <Code className={iconSize} />
          </Button>
        </div>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        {/* 链接和图片 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('[$1]($2)', '链接文本')}
            className={`${buttonSize} p-0`}
            title="插入链接"
          >
            <Link className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('![$1]($2)', '图片描述')}
            className={`${buttonSize} p-0`}
            title="插入图片"
          >
            <Image className={iconSize} />
          </Button>
        </div>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        {/* 列表和引用 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('- $1', '列表项')}
            className={`${buttonSize} p-0`}
            title="无序列表"
          >
            <List className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('1. $1', '列表项')}
            className={`${buttonSize} p-0`}
            title="有序列表"
          >
            <ListOrdered className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('> $1', '引用文本')}
            className={`${buttonSize} p-0`}
            title="引用"
          >
            <Quote className={iconSize} />
          </Button>
        </div>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        {/* 标题 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('# $1', '一级标题')}
            className={`${buttonSize} p-0`}
            title="一级标题"
          >
            <Heading1 className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('## $1', '二级标题')}
            className={`${buttonSize} p-0`}
            title="二级标题"
          >
            <Heading2 className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('### $1', '三级标题')}
            className={`${buttonSize} p-0`}
            title="三级标题"
          >
            <Heading3 className={iconSize} />
          </Button>
        </div>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        {/* 表格和历史记录 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertMarkdown('| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |')
            }
            className={`${buttonSize} p-0`}
            title="插入表格"
          >
            <Table className={iconSize} />
          </Button>
        </div>

        {/* 预览切换 */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={`${buttonSize} p-0`}
            title={isPreview ? '编辑模式' : '预览模式'}
          >
            {isPreview ? '编辑' : '预览'}
          </Button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {isPreview ? (
          <div className={`${padding} ${editorHeight} prose prose-sm max-w-none`}>
            <div className="markdown-preview">
              {value.split('\n').map((line, index) => {
                const lineKey = `${index}-${line.substring(0, 10)}`;
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={lineKey} className="text-lg font-bold mt-4 mb-2">
                      {line.substring(4)}
                    </h3>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={lineKey} className="text-xl font-bold mt-4 mb-2">
                      {line.substring(3)}
                    </h2>
                  );
                }
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={lineKey} className="text-2xl font-bold mt-4 mb-2">
                      {line.substring(2)}
                    </h1>
                  );
                }
                if (line.startsWith('> ')) {
                  return (
                    <blockquote
                      key={lineKey}
                      className="border-l-4 border-blue-500 pl-4 py-2 my-2 bg-blue-50 italic"
                    >
                      {line.substring(2)}
                    </blockquote>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={lineKey} className="ml-4">
                      • {line.substring(2)}
                    </li>
                  );
                }
                if (/^\d+\. /.test(line)) {
                  const match = line.match(/^(\d+)\. (.+)/);
                  return (
                    <li key={lineKey} className="ml-4">
                      {match?.[1]}. {match?.[2]}
                    </li>
                  );
                }
                if (line.trim() === '') {
                  return <br key={lineKey} />;
                }
                return (
                  <p key={lineKey} className="mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={editorHeight}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`${padding} w-full h-full resize-none border-0 focus:outline-none focus:ring-0`}
              style={{ minHeight: compact ? '120px' : '400px' }}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MilkdownSimpleEditor;
