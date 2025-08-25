# My Memo - 智能任务提醒应用

一个功能完整的任务提醒应用，类似于 Apple 系统的 Reminders 应用。帮助用户高效管理任务、设置优先级、跟踪截止日期，并提供直观的用户界面。

## ✨ 主要功能

### 🎯 任务管理
- **创建任务**: 支持文本、图片和 Markdown 文档
- **Markdown支持**: 完整的Markdown语法支持，包括代码高亮、表格、列表等
- **任务分类**: 按列表组织任务（工作、个人、健康等）
- **任务状态**: 标记完成/未完成状态
- **任务标记**: 重要任务标记功能
- **任务备注**: 支持富文本Markdown备注，实时预览编辑

### ⚡ 优先级系统
- **三级优先级**: 低 (LOW)、中 (MEDIUM)、高 (HIGH)
- **视觉标识**: 不同颜色圆点表示优先级
- **智能排序**: 按优先级和创建时间排序

### 📅 时间管理
- **截止日期**: 为任务设置截止日期
- **时间提醒**: 截止日期提醒功能
- **时间显示**: 直观的日期显示格式

### 🔐 用户认证
- **安全登录**: 支持邮箱密码登录
- **用户隔离**: 每个用户只能看到自己的任务
- **会话管理**: 安全的用户会话管理

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Framer Motion** - 流畅的动画效果

### 后端
- **tRPC** - 端到端类型安全的 API
- **Prisma** - 现代数据库 ORM
- **PostgreSQL** - 强大的关系型数据库
- **NextAuth.js** - 身份验证解决方案

### 开发工具
- **Biome** - 快速的代码格式化和检查
- **Zustand** - 轻量级状态管理
- **Zod** - TypeScript 优先的模式验证

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- PostgreSQL 数据库
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/YongYingXie/my-first-app.git
   cd my-first-app
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   
   配置以下环境变量：
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **数据库设置**
   ```bash
   # 启动数据库（如果使用 Docker）
   ./start-database.sh
   
   # 运行数据库迁移
   npm run db:migrate
   
   # 生成 Prisma 客户端
   npm run db:generate
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 [http://localhost:3000]

## 📱 使用指南

### 创建任务
1. 点击"+"按钮创建新任务
2. 输入任务标题
3. 选择优先级（低/中/高）
4. 设置截止日期（可选）
5. 选择任务列表
6. 点击保存

### 管理任务
- **编辑任务**: 点击任务标题进行编辑，支持键盘操作（Enter保存，Escape取消）
- **标记完成**: 点击任务前的复选框
- **设置优先级**: 使用优先级选择器
- **添加标记**: 点击旗帜图标标记重要任务
- **删除任务**: 使用删除按钮

### 任务组织
- **按列表查看**: 使用侧边栏切换不同列表
- **按优先级排序**: 自动按优先级排序
- **按时间排序**: 按创建时间或截止日期排序

## 🗄️ 数据库结构

### 主要模型
- **User**: 用户信息
- **Todo**: 任务数据
- **Account**: 第三方账户关联
- **Session**: 用户会话

### 任务字段
```typescript
interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: Date
  notes?: string
  list: string
  flagged: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}
```

## 🧪 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format:write

# 类型检查
npm run typecheck

# 数据库操作
npm run db:studio    # 打开 Prisma Studio
npm run db:generate  # 生成 Prisma 客户端
npm run db:migrate   # 运行数据库迁移
```

## 🌟 特性亮点

- **实时更新**: 使用 tRPC 实现实时数据同步
- **类型安全**: 完整的 TypeScript 支持
- **性能优化**: Next.js 15 的 Turbo 模式
- **用户体验**: 流畅的动画和直观的界面
- **便捷编辑**: 支持任务标题、日期、优先级的快速编辑
- **键盘友好**: 支持 Enter 保存、Escape 取消等键盘快捷键
- **Markdown支持**: 完整的Markdown编辑和渲染，支持代码高亮、表格、列表等
- **实时预览**: Markdown编辑器支持实时预览模式


## 🙏 致谢

- [T3 Stack](https://create.t3.gg/) - 优秀的全栈开发模板
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Prisma](https://prisma.io/) - 现代数据库工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

**My Memo** - 让任务管理变得简单高效 ✨
