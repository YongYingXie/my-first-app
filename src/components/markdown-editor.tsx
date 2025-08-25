'use client';

import { Eye, EyeOff, FileText } from 'lucide-react';
import { useState } from 'react';
import MarkdownRenderer from './markdown-renderer';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = '输入Markdown内容...',
  className = '',
  label = '内容',
}: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePreview}
          className="flex items-center gap-2"
        >
          {isPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              编辑
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              预览
            </>
          )}
        </Button>
      </div>

      {/* 编辑器/预览区域 */}
      {isPreview ? (
        <div className="min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <div className="text-gray-400 text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无内容</p>
            </div>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] font-mono text-sm"
          rows={8}
        />
      )}

      {/* Markdown语法提示 */}
      {!isPreview && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Markdown语法提示:</strong>
          </p>
          <p>**粗体** | *斜体* | `代码` | # 标题 | - 列表 | &gt; 引用 | [链接](url)</p>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
