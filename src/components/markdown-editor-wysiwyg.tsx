'use client';

import {
  Bold,
  CheckSquare,
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
  Square,
  Strikethrough,
  Table,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface MarkdownEditorWysiwygProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showToolbar?: boolean;
  compact?: boolean;
}

const MarkdownEditorWysiwyg = ({
  value,
  onChange,
  placeholder = '输入备注内容...',
  className = '',
  label = '备注',
  showToolbar = true,
  compact = false,
}: MarkdownEditorWysiwygProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  // 工具栏操作函数
  const insertText = (text: string, wrap = false) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText: string;
    if (wrap && selectedText) {
      // 如果有选中文本，进行包装
      newText = `${text}${selectedText}${text}`;
      const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
      onChange(newValue);

      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length + selectedText.length);
      }, 0);
    } else {
      // 在光标位置插入文本
      newText = text;
      const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
      onChange(newValue);

      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length, start + newText.length);
      }, 0);
    }
  };

  // 工具栏操作
  const toolbarActions = {
    bold: () => insertText('**', true),
    italic: () => insertText('*', true),
    strikethrough: () => insertText('~~', true),
    code: () => insertText('`', true),
    heading1: () => insertText('# '),
    heading2: () => insertText('## '),
    heading3: () => insertText('### '),
    bulletList: () => insertText('- '),
    orderedList: () => insertText('1. '),
    blockquote: () => insertText('> '),
    link: () => insertText('[链接文本](https://example.com)'),
    image: () => insertText('![图片描述](https://example.com/image.jpg)'),
    table: () =>
      insertText(`| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |

`),
    taskList: () => insertText('- [ ] 待办事项'),
    completedTask: () => insertText('- [x] 已完成'),
  };

  // Markdown 渲染函数
  const renderMarkdown = (markdown: string): string => {
    if (!markdown) return '';

    return (
      markdown
        // 标题
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-lg font-semibold text-gray-900 mt-3 mb-2">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-xl font-semibold text-gray-900 mt-4 mb-3">$1</h2>'
        )
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-5 mb-4">$1</h1>')

        // 任务列表
        .replace(
          /^- \[ \] (.*$)/gim,
          '<div class="flex items-center gap-2 my-1"><input type="checkbox" class="w-4 h-4 text-blue-600" disabled><span>$1</span></div>'
        )
        .replace(
          /^- \[x\] (.*$)/gim,
          '<div class="flex items-center gap-2 my-1"><input type="checkbox" class="w-4 h-4 text-blue-600" checked disabled><span class="line-through text-gray-500">$1</span></div>'
        )

        // 列表
        .replace(/^- (.*$)/gim, '<li class="ml-4 my-1">$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 my-1">$2</li>')

        // 引用
        .replace(
          /^> (.*$)/gim,
          '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 italic text-gray-700">$1</blockquote>'
        )

        // 代码块
        .replace(
          /```([\s\S]*?)```/g,
          '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-3"><code class="text-sm font-mono">$1</code></pre>'
        )

        // 行内代码
        .replace(
          /`([^`]+)`/g,
          '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>'
        )

        // 粗体
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')

        // 斜体
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

        // 删除线
        .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>')

        // 链接
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
        )

        // 图片
        .replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 my-3" onerror="this.style.display=\'none\'">'
        )

        // 表格
        .replace(/\|(.+)\|/g, (match) => {
          const cells = match.split('|').filter((cell) => cell.trim());
          if (cells.length > 1) {
            const headerRow = cells
              .map(
                (cell) =>
                  `<th class="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left">${cell.trim()}</th>`
              )
              .join('');
            return `<table class="min-w-full border-collapse border border-gray-300 my-4"><thead><tr>${headerRow}</tr></thead><tbody>`;
          }
          return match;
        })
        .replace(/\|-----+\|/g, '') // 移除表格分隔符
        .replace(/\|([^|]+)\|/g, (match) => {
          const cells = match.split('|').filter((cell) => cell.trim());
          if (cells.length > 1) {
            const dataRow = cells
              .map((cell) => `<td class="border border-gray-300 px-3 py-2">${cell.trim()}</td>`)
              .join('');
            return `<tr>${dataRow}</tr>`;
          }
          return match;
        })

        // 换行
        .replace(/\n/g, '<br>')

        // 包装列表项
        .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside space-y-1 my-2">$1</ul>')
        .replace(/(<li.*<\/li>)/g, '<ol class="list-decimal list-inside space-y-1 my-2">$1</ol>')
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 标签 */}
      {label && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      )}

      {/* 工具栏 */}
      {showToolbar && (
        <div
          className={`flex flex-wrap gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50 ${compact ? 'text-xs' : ''}`}
        >
          {/* 文本格式 */}
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.bold}
            title="粗体 (Ctrl+B)"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Bold className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.italic}
            title="斜体 (Ctrl+I)"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Italic className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.strikethrough}
            title="删除线"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Strikethrough className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.code}
            title="行内代码"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Code className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 标题 */}
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.heading1}
            title="标题 1"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Heading1 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.heading2}
            title="标题 2"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Heading2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.heading3}
            title="标题 3"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Heading3 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 列表 */}
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.bulletList}
            title="无序列表"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <List className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.orderedList}
            title="有序列表"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <ListOrdered className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.taskList}
            title="任务列表"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Square className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.completedTask}
            title="已完成任务"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <CheckSquare className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.blockquote}
            title="引用"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Quote className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 插入 */}
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.link}
            title="链接"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Link className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.image}
            title="图片"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Image className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={toolbarActions.table}
            title="表格"
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <Table className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          </Button>

          {/* 预览切换按钮 */}
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            onClick={() => setIsPreview(!isPreview)}
            title="切换预览"
            className={compact ? 'h-6 px-2' : ''}
          >
            {isPreview ? '编辑' : '预览'}
          </Button>
        </div>
      )}

      {/* 编辑器/预览区域 */}
      <div
        className={`border border-gray-300 ${showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'} overflow-hidden`}
      >
        {isPreview ? (
          // 预览模式
          <div
            className={`p-4 bg-white ${compact ? 'min-h-[120px]' : 'min-h-[200px]'} overflow-y-auto`}
            //biome-ignore lint/security/noDangerouslySetInnerHtml:false
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          // 编辑模式
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-4 resize-none font-mono text-sm border-0 focus:outline-none focus:ring-0 ${
              compact ? 'min-h-[120px]' : 'min-h-[200px]'
            }`}
          />
        )}
      </div>

      {/* 提示信息 */}
      {!compact && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>快捷键提示:</strong>
          </p>
          <p>
            <kbd>Ctrl+B</kbd> 粗体 | <kbd>Ctrl+I</kbd> 斜体 | <kbd>Ctrl+Z</kbd> 撤销 |
            <kbd>Ctrl+V</kbd> 粘贴 | <kbd>Ctrl+C</kbd> 复制
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditorWysiwyg;
