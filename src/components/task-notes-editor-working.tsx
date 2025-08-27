'use client';

import { defaultValueCtx, Editor, editorViewCtx, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
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
import '@milkdown/theme-nord/style.css';

interface TaskNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showToolbar?: boolean;
  compact?: boolean;
}

const TaskNotesEditorComponent = ({
  value,
  onChange,
  placeholder: _placeholder = '输入备注内容...',
  className = '',
  label = '备注',
  showToolbar = true,
  compact = false,
}: TaskNotesEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, value || '');

        // 设置监听器
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChange(markdown);
        });

        // 编辑器准备就绪回调
        ctx.get(listenerCtx).mounted(() => {
          setIsReady(true);
        });
      })

      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(cursor)
      .use(listener);

    editorRef.current = editor;
    return editor;
  });

  // 使用 Milkdown API 插入文本
  const insertText = (text: string, wrap = false) => {
    if (!editorRef.current || !isReady) return;

    try {
      editorRef.current.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        if (view) {
          const { state, dispatch } = view;
          const { selection } = state;
          const { from, to } = selection;

          if (wrap && from !== to) {
            // 如果有选中文本，进行包装
            const selectedText = state.doc.textBetween(from, to);
            const wrappedText = `${text}${selectedText}${text}`;
            dispatch(state.tr.insertText(wrappedText, from, to));
          } else {
            // 在光标位置插入文本
            dispatch(state.tr.insertText(text, from));
          }
        }
      });
    } catch (error) {
      console.warn('Failed to insert text via Milkdown API:', error);
      // 降级方案：直接修改状态
      const currentValue = value || '';
      let newValue: string;

      if (wrap) {
        newValue = `${text}${currentValue}${text}`;
      } else {
        newValue = `${currentValue}${text}`;
      }

      onChange(newValue);
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
        </div>
      )}

      {/* 编辑器容器 */}
      <div
        className={`border border-gray-300 ${showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'} overflow-hidden`}
      >
        <div className={`milkdown-editor-container ${compact ? 'min-h-[120px]' : 'min-h-[200px]'}`}>
          <Milkdown />
        </div>
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

const TaskNotesEditorWorking = (props: TaskNotesEditorProps) => {
  return (
    <MilkdownProvider>
      <TaskNotesEditorComponent {...props} />
    </MilkdownProvider>
  );
};

export default TaskNotesEditorWorking;
