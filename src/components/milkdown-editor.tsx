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

import { useEffect, useRef } from 'react';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const MilkdownEditorComponent = ({
  value,
  onChange,
  placeholder: _placeholder = '输入内容...',
  className = '',
  label = '内容',
}: MilkdownEditorProps) => {
  const editorRef = useRef<Editor | null>(null);

  useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, value);

        // 设置监听器
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChange(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(cursor)
      .use(indent)
      .use(listener);

    editorRef.current = editor;
    return editor;
  });

  // 当外部 value 改变时更新编辑器内容
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const editor = editorRef.current;
      try {
        editor.action((ctx) => {
          const view = ctx.get(rootCtx);
          if (view) {
            ctx.set(defaultValueCtx, value);
          }
        });
      } catch (error) {
        console.warn('Failed to update editor content:', error);
      }
    }
  }, [value]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 标签 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      {/* 编辑器容器 */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* 工具栏区域 - 由 Milkdown 主题自动提供 */}
        <div className="milkdown-editor-container">
          <Milkdown />
        </div>
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>快捷键提示:</strong>
        </p>
        <p>
          <kbd>Ctrl+B</kbd> 粗体 | <kbd>Ctrl+I</kbd> 斜体 | <kbd>Ctrl+Z</kbd> 撤销 |<kbd>/</kbd>{' '}
          命令菜单 | <kbd>Ctrl+V</kbd> 粘贴
        </p>
      </div>
    </div>
  );
};

const MilkdownEditor = (props: MilkdownEditorProps) => {
  return (
    <MilkdownProvider>
      <MilkdownEditorComponent {...props} />
    </MilkdownProvider>
  );
};

export default MilkdownEditor;
