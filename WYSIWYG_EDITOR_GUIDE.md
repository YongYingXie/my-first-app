# 所见即所得 Markdown 编辑器使用指南

## 概述

这是一个基于 Milkdown 构建的所见即所得 Markdown 编辑器，提供类似 StackEdit 和 Typora 的编辑体验。编辑器支持实时预览、丰富的工具栏、GFM 语法等高级功能。

## 主要特性

### ✨ 核心功能
- **所见即所得编辑** - 编辑时即可看到最终效果
- **实时预览** - 无需切换模式，内容实时更新
- **GFM 支持** - 完整的 GitHub Flavored Markdown 支持
- **快捷键支持** - 提高编辑效率
- **撤销重做** - 完整的编辑历史记录

### 🛠️ 工具栏功能
- **文本格式**: 粗体、斜体、删除线、行内代码
- **链接和图片**: 插入链接、插入图片、上传图片
- **列表和引用**: 无序列表、有序列表、引用块
- **标题**: 一级、二级、三级标题
- **表格**: 插入和编辑表格
- **历史记录**: 撤销、重做操作

### 🔍 高级功能
- **搜索和替换** - 在文档中搜索和替换文本
- **设置面板** - 自定义主题和字体大小
- **导出功能** - 导出为 Markdown 文件
- **字数统计** - 实时显示字数和字符数
- **文件上传** - 支持拖拽上传图片

## 使用方法

### 1. 基础编辑

#### 文本格式
- 选中文本后点击工具栏按钮
- 或使用快捷键：
  - **粗体**: `Ctrl+B`
  - **斜体**: `Ctrl+I`
  - **删除线**: 工具栏按钮
  - **行内代码**: 工具栏按钮

#### 标题
- 使用工具栏的 H1、H2、H3 按钮
- 或直接输入 `#`、`##`、`###`

#### 列表
- **无序列表**: 点击工具栏按钮或输入 `-`
- **有序列表**: 点击工具栏按钮或输入 `1.`

#### 引用
- 点击工具栏的引用按钮
- 或输入 `>`

### 2. 插入元素

#### 链接
1. 点击工具栏的链接按钮
2. 输入链接地址
3. 链接会自动插入到当前光标位置

#### 图片
1. 点击工具栏的图片按钮
2. 输入图片地址
3. 或使用上传按钮上传本地图片

#### 表格
1. 点击工具栏的表格按钮
2. 表格会自动插入
3. 可以直接在表格中编辑内容

### 3. 高级操作

#### 搜索和替换
1. 点击工具栏的搜索按钮
2. 在搜索框中输入要查找的内容
3. 在替换框中输入要替换的内容
4. 点击搜索或替换按钮

#### 设置
1. 点击工具栏的设置按钮
2. 选择主题（Nord、Light、Dark）
3. 调整字体大小
4. 设置会自动保存

#### 导出
1. 点击工具栏的导出按钮
2. 选择保存位置
3. 文件将以 `.md` 格式保存

## 组件说明

### MilkdownWysiwygEditor
基础版本的所见即所得编辑器，包含核心功能。

**Props:**
- `value`: 编辑器内容
- `onChange`: 内容变化回调
- `placeholder`: 占位符文本
- `className`: 自定义样式类
- `label`: 编辑器标签
- `readOnly`: 是否只读

### MilkdownAdvancedEditor
高级版本的编辑器，包含搜索、替换、设置等额外功能。

**Props:**
- `value`: 编辑器内容
- `onChange`: 内容变化回调
- `placeholder`: 占位符文本
- `className`: 自定义样式类
- `label`: 编辑器标签
- `readOnly`: 是否只读
- `onSave`: 保存回调函数

## 技术实现

### 核心架构
- **Milkdown**: 基于 ProseMirror 的 Markdown 编辑器
- **React**: 用户界面框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架

### 插件系统
- `@milkdown/preset-commonmark`: 基础 Markdown 语法
- `@milkdown/preset-gfm`: GitHub Flavored Markdown 支持
- `@milkdown/plugin-history`: 撤销重做功能
- `@milkdown/plugin-cursor`: 光标管理
- `@milkdown/plugin-slash`: 斜杠命令
- `@milkdown/plugin-tooltip`: 工具提示
- `@milkdown/plugin-upload`: 文件上传
- `@milkdown/plugin-table`: 表格支持

### 主题系统
- **Nord**: 默认主题，现代化的深色主题
- **Light**: 浅色主题
- **Dark**: 深色主题

## 自定义和扩展

### 添加新命令
```typescript
case 'newCommand':
  commands.newCommand.run();
  break;
```

### 自定义样式
```typescript
commonmark.configure(commonmark, {
  [paragraphAttr.key]: {
    class: 'custom-paragraph-class',
  },
})
```

### 添加新插件
```typescript
import { newPlugin } from '@milkdown/plugin-new';

Editor.make(root, [
  // ... 其他插件
  newPlugin,
])
```

## 最佳实践

### 1. 性能优化
- 避免在 `onChange` 回调中执行重操作
- 使用 `useCallback` 优化函数引用
- 合理使用 `useMemo` 缓存计算结果

### 2. 用户体验
- 提供清晰的视觉反馈
- 支持键盘快捷键
- 实现自动保存功能
- 添加加载状态指示

### 3. 错误处理
- 捕获并处理编辑器错误
- 提供用户友好的错误信息
- 实现错误恢复机制

## 常见问题

### Q: 编辑器无法加载？
A: 检查 Milkdown 依赖是否正确安装，确保所有插件都已导入。

### Q: 图片无法显示？
A: 检查图片 URL 是否有效，或使用上传功能上传本地图片。

### Q: 表格编辑有问题？
A: 确保已安装 `@milkdown/plugin-table` 插件。

### Q: 快捷键不工作？
A: 检查是否有其他应用占用了快捷键，或重新加载页面。

## 更新日志

### v1.0.0
- 基础所见即所得编辑功能
- 完整的工具栏支持
- GFM 语法支持
- 基础主题系统

### v1.1.0
- 添加搜索和替换功能
- 增强的设置面板
- 字数统计功能
- 文件上传支持

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个编辑器！

### 开发环境设置
1. 克隆项目
2. 安装依赖: `npm install`
3. 启动开发服务器: `npm run dev`
4. 访问 `/wysiwyg-demo` 查看演示

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 添加适当的注释
- 编写单元测试

---

*享受所见即所得的 Markdown 编辑体验！*
