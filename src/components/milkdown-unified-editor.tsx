'use client';

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import {
  Bold,
  CheckSquare,
  Code,
  Copy,
  Eye,
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
  Type,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface MilkdownUnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  showPreview?: boolean;
  compact?: boolean;
  wysiwyg?: boolean;
}

const MilkdownUnifiedEditorComponent = ({
  value,
  onChange,
  placeholder = '开始编写...',
  className = '',
  label = '内容',
  readOnly = false,
  showToolbar = true,
  showPreview = false,
  compact = false,
  wysiwyg = true,
}: MilkdownUnifiedEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(showPreview);
  const [copiedText, setCopiedText] = useState('');

  // 使用正确的 Milkdown 7.x API
  const { loading, get } = useEditor((container: HTMLElement) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, container);
        ctx.set(defaultValueCtx, value || '');
      })
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(cursor)
      .use(indent)
      .use(listener);

    // 设置监听器
    editor.action((ctx) => {
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        onChange(markdown);
      });

      ctx.get(listenerCtx).mounted(() => {
        setIsReady(true);
      });
    });

    return editor;
  });

  // 当编辑器加载完成时保存引用
  useEffect(() => {
    if (!loading) {
      const editor = get();
      if (editor) {
        editorRef.current = editor;
      }
    }
  }, [loading, get]);

  // 降级文本操作的辅助函数
  const fallbackTextOperation = useCallback(
    (commandName: string, payload?: any) => {
      const currentValue = value || '';
      let newValue = currentValue;

      switch (commandName) {
        case 'bold':
          newValue = `${currentValue}**粗体文本**`;
          break;
        case 'italic':
          newValue = `${currentValue}*斜体文本*`;
          break;
        case 'strikethrough':
          newValue = `${currentValue}~~删除线文本~~`;
          break;
        case 'code':
          newValue = `${currentValue}\`代码\``;
          break;
        case 'heading1':
          newValue = `${currentValue}\n# 一级标题`;
          break;
        case 'heading2':
          newValue = `${currentValue}\n## 二级标题`;
          break;
        case 'heading3':
          newValue = `${currentValue}\n### 三级标题`;
          break;
        case 'bulletList':
          newValue = `${currentValue}\n- 列表项`;
          break;
        case 'orderedList':
          newValue = `${currentValue}\n1. 列表项`;
          break;
        case 'blockquote':
          newValue = `${currentValue}\n> 引用文本`;
          break;
        case 'link':
          newValue = `${currentValue}[链接文本](https://example.com)`;
          break;
        case 'image':
          newValue = `${currentValue}![图片描述](https://example.com/image.jpg)`;
          break;
        case 'table':
          newValue = `${currentValue}\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n`;
          break;
        case 'taskList':
          newValue = `${currentValue}\n- [ ] 待办事项`;
          break;
        case 'completedTask':
          newValue = `${currentValue}\n- [x] 已完成`;
          break;
        case 'insertText':
          if (payload) {
            const { before, after, placeholder } = payload;
            const insertedText = placeholder || '文本';
            newValue = `${currentValue}${before}${insertedText}${after}`;
          }
          break;
        case 'insertLinePrefix':
          if (payload) {
            const { prefix } = payload;
            newValue = `${currentValue}\n${prefix}`;
          }
          break;
        case 'insertTable':
          newValue = `${currentValue}\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n`;
          break;
        default:
          break;
      }

      if (newValue !== currentValue) {
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  // 插入文本的辅助函数
  const insertText = useCallback(
    (before: string, after: string, placeholder: string) => {
      if (!isReady) return;
      fallbackTextOperation('insertText', { before, after, placeholder });
    },
    [isReady, fallbackTextOperation]
  );

  // 插入行前缀的辅助函数
  const insertLinePrefix = useCallback(
    (prefix: string) => {
      if (!isReady) return;
      fallbackTextOperation('insertLinePrefix', { prefix });
    },
    [isReady, fallbackTextOperation]
  );

  // 插入表格的辅助函数
  const insertTable = useCallback(() => {
    if (!isReady) return;
    fallbackTextOperation('insertTable');
  }, [isReady, fallbackTextOperation]);

  // 执行编辑命令
  const executeCommand = useCallback(
    (commandName: string) => {
      if (!isReady) return;

      try {
        switch (commandName) {
          case 'bold':
            insertText('**', '**', '粗体文本');
            break;
          case 'italic':
            insertText('*', '*', '斜体文本');
            break;
          case 'strikethrough':
            insertText('~~', '~~', '删除线文本');
            break;
          case 'code':
            insertText('`', '`', '代码');
            break;
          case 'heading1':
            insertLinePrefix('# ');
            break;
          case 'heading2':
            insertLinePrefix('## ');
            break;
          case 'heading3':
            insertLinePrefix('### ');
            break;
          case 'bulletList':
            insertLinePrefix('- ');
            break;
          case 'orderedList':
            insertLinePrefix('1. ');
            break;
          case 'blockquote':
            insertLinePrefix('> ');
            break;
          case 'link':
            insertText('[', '](https://example.com)', '链接文本');
            break;
          case 'image':
            insertText('![', '](https://example.com/image.jpg)', '图片描述');
            break;
          case 'table':
            insertTable();
            break;
          case 'taskList':
            insertLinePrefix('- [ ] ');
            break;
          case 'completedTask':
            insertLinePrefix('- [x] ');
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn('Failed to execute command:', error);
        // 降级到直接操作文本
        fallbackTextOperation(commandName);
      }
    },
    [isReady, insertText, insertLinePrefix, insertTable, fallbackTextOperation]
  );

  // 复制内容
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedText('已复制！');
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 当外部 value 改变时更新编辑器内容
  useEffect(() => {
    if (editorRef.current && value !== undefined && isReady) {
      try {
        editorRef.current.action((ctx) => {
          ctx.set(defaultValueCtx, value);
        });
      } catch (error) {
        console.warn('Failed to update editor content:', error);
      }
    }
  }, [value, isReady]);

  const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const editorHeight = compact ? 'min-h-[120px]' : 'min-h-[200px]';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 标签 */}
      {label && !compact && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {copiedText && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              {copiedText}
            </span>
          )}
        </div>
      )}

      {/* 工具栏 */}
      {showToolbar && (
        <div
          className={`flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50 ${
            compact ? 'text-xs' : ''
          }`}
        >
          {/* 文本格式 */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('bold')}
              title="粗体 (Ctrl+B)"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Bold className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('italic')}
              title="斜体 (Ctrl+I)"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Italic className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('strikethrough')}
              title="删除线"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Strikethrough className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('code')}
              title="行内代码"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Code className={iconSize} />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 标题 */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('heading1')}
              title="标题 1"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Heading1 className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('heading2')}
              title="标题 2"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Heading2 className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('heading3')}
              title="标题 3"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Heading3 className={iconSize} />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 列表 */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('bulletList')}
              title="无序列表"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <List className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('orderedList')}
              title="有序列表"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <ListOrdered className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('taskList')}
              title="任务列表"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Square className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('completedTask')}
              title="已完成任务"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <CheckSquare className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('blockquote')}
              title="引用"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Quote className={iconSize} />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 插入 */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('link')}
              title="链接"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Link className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('image')}
              title="图片"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Image className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => executeCommand('table')}
              title="表格"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Table className={iconSize} />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 操作 */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={copyContent}
              title="复制内容"
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              <Copy className={iconSize} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              title={isPreviewMode ? '编辑模式' : '预览模式'}
              className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
            >
              {isPreviewMode ? <Type className={iconSize} /> : <Eye className={iconSize} />}
            </Button>
          </div>

          {/* 模式指示器 */}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            {wysiwyg && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">WYSIWYG</span>
            )}
            {isPreviewMode && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">预览</span>
            )}
          </div>
        </div>
      )}

      {/* 编辑器容器 */}
      <div
        className={`border border-gray-300 ${
          showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'
        } overflow-hidden bg-white`}
      >
        <div className={`milkdown-editor-container ${editorHeight}`}>
          {isPreviewMode ? (
            // 纯预览模式，只显示渲染结果
            <div className="p-4 prose prose-sm max-w-none">
              <MilkdownRenderer content={value} />
            </div>
          ) : (
            // WYSIWYG编辑模式
            <Milkdown />
          )}
        </div>
      </div>

      {/* 提示信息 */}
      {!compact && !readOnly && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>快捷键:</strong> <kbd>Ctrl+B</kbd> 粗体 | <kbd>Ctrl+I</kbd> 斜体 |{' '}
            <kbd>Ctrl+Z</kbd> 撤销 | <kbd>Ctrl+Y</kbd> 重做
          </p>
          {wysiwyg && (
            <p>
              <strong>WYSIWYG模式:</strong> 直接编辑即可看到效果，类似Typora体验
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Milkdown渲染器组件，用于纯显示内容
const MilkdownRenderer = ({ content }: { content: string }) => {
  const { loading, get } = useEditor((container: HTMLElement) => {
    // 使用官方推荐的配置方式
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, container);
        ctx.set(defaultValueCtx, content || '');
      })
      .use(commonmark)
      .use(gfm)
      .use(clipboard); // 复制粘贴

    return editor;
  });

  // 当内容变化时更新
  useEffect(() => {
    if (!loading) {
      const editor = get();
      if (editor && content !== undefined) {
        try {
          editor.action((ctx) => {
            ctx.set(defaultValueCtx, content);
          });
        } catch (error) {
          console.warn('Failed to update renderer content:', error);
        }
      }
    }
  }, [content, loading, get]);

  return (
    <div className="milkdown-renderer">
      <Milkdown />
    </div>
  );
};

// 主组件导出
const MilkdownUnifiedEditor = (props: MilkdownUnifiedEditorProps) => {
  return (
    <MilkdownProvider>
      <MilkdownUnifiedEditorComponent {...props} />
    </MilkdownProvider>
  );
};

export default MilkdownUnifiedEditor;
export { MilkdownRenderer };
