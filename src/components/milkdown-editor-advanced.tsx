'use client';

import { defaultValueCtx, Editor, editorViewCtx, rootCtx } from '@milkdown/core';
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
  Strikethrough,
  Table,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorAdvancedProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showToolbar?: boolean;
}

const MilkdownEditorAdvancedComponent = ({
  value,
  onChange,
  placeholder: _placeholder = '输入内容...',
  className = '',
  label = '内容',
  showToolbar = true,
}: MilkdownEditorAdvancedProps) => {
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
      .use(indent)
      .use(listener);

    editorRef.current = editor;
    return editor;
  });

  // 工具栏操作函数
  const executeCommand = (command: string, _value?: string) => {
    if (!editorRef.current || !isReady) return;

    try {
      editorRef.current.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { state, dispatch } = view;
        const { tr, selection } = state;
        const { from, to } = selection;

        switch (command) {
          case 'bold':
            dispatch(tr.insertText(`**${state.doc.textBetween(from, to)}**`, from, to));
            break;
          case 'italic':
            dispatch(tr.insertText(`*${state.doc.textBetween(from, to)}*`, from, to));
            break;
          case 'strikethrough':
            dispatch(tr.insertText(`~~${state.doc.textBetween(from, to)}~~`, from, to));
            break;
          case 'code':
            dispatch(tr.insertText(`\`${state.doc.textBetween(from, to)}\``, from, to));
            break;
          case 'heading1':
            dispatch(tr.insertText('# ', from));
            break;
          case 'heading2':
            dispatch(tr.insertText('## ', from));
            break;
          case 'heading3':
            dispatch(tr.insertText('### ', from));
            break;
          case 'bulletList':
            dispatch(tr.insertText('- ', from));
            break;
          case 'orderedList':
            dispatch(tr.insertText('1. ', from));
            break;
          case 'blockquote':
            dispatch(tr.insertText('> ', from));
            break;
          case 'link': {
            const linkText = state.doc.textBetween(from, to) || '链接文本';
            dispatch(tr.insertText(`[${linkText}](https://example.com)`, from, to));
            break;
          }
          case 'image':
            dispatch(tr.insertText('![图片描述](https://example.com/image.jpg)', from));
            break;
          case 'table': {
            const tableMarkdown = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |`;
            dispatch(tr.insertText(tableMarkdown, from));
            break;
          }
        }
      });
    } catch (error) {
      console.warn('Command execution failed:', error);
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

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 标签 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      {/* 工具栏 */}
      {showToolbar && (
        <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
          {/* 文本格式 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bold')}
            title="粗体 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('italic')}
            title="斜体 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('strikethrough')}
            title="删除线"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('code')}
            title="行内代码"
          >
            <Code className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 标题 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('heading1')}
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('heading2')}
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('heading3')}
            title="标题 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 列表 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bulletList')}
            title="无序列表"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('orderedList')}
            title="有序列表"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('blockquote')}
            title="引用"
          >
            <Quote className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 插入 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('link')}
            title="链接"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('image')}
            title="图片"
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('table')}
            title="表格"
          >
            <Table className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 编辑器容器 */}
      <div
        className={`border border-gray-300 ${showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'} overflow-hidden`}
      >
        <div className="milkdown-editor-container min-h-[200px]">
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
          命令菜单 | <kbd>Ctrl+V</kbd> 粘贴 | <kbd>Ctrl+C</kbd> 复制
        </p>
      </div>
    </div>
  );
};

const MilkdownEditorAdvanced = (props: MilkdownEditorAdvancedProps) => {
  return (
    <MilkdownProvider>
      <MilkdownEditorAdvancedComponent {...props} />
    </MilkdownProvider>
  );
};

export default MilkdownEditorAdvanced;
