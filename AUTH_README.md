# 认证系统集成说明

## 概述

本项目已成功集成了NextAuth.js认证系统，实现了用户注册、登录和基于用户的Todo管理功能。**新增Discord OAuth支持**，用户可以通过Discord账号快速登录。

## 功能特性

- ✅ 用户注册和登录
- ✅ **Discord OAuth登录**
- ✅ 基于JWT的会话管理
- ✅ 用户认证保护
- ✅ 每个用户独立的Todo列表
- ✅ 安全的密码加密存储
- ✅ 响应式UI设计
- ✅ **多登录方式支持**

## 技术架构

### 后端技术栈
- **NextAuth.js v5**: 认证框架
- **Prisma**: 数据库ORM
- **PostgreSQL**: 数据库
- **tRPC**: 类型安全的API
- **bcryptjs**: 密码加密
- **Discord OAuth**: 第三方登录

### 前端技术栈
- **Next.js 15**: React框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Zustand**: 状态管理

## 数据库结构

### 用户表 (User)
- `id`: 用户唯一标识
- `name`: 用户姓名
- `email`: 邮箱地址（唯一）
- `password`: 加密后的密码（可选，Discord用户无密码）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Todo表 (Todo)
- `id`: Todo唯一标识
- `text`: Todo内容
- `isCompleted`: 完成状态
- `userId`: 关联的用户ID
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 认证相关表
- `Account`: OAuth账户信息（Discord账户信息存储）
- `Session`: 用户会话
- `VerificationToken`: 验证令牌

## 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/my-first-app"

# NextAuth.js配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth配置
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# 环境
NODE_ENV="development"
```

## Discord OAuth配置步骤

### 1. 创建Discord应用
1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击 "New Application"
3. 输入应用名称和描述
4. 在左侧菜单选择 "OAuth2"
5. 添加重定向URL: `http://localhost:3000/api/auth/callback/discord`

### 2. 获取客户端信息
- 复制 `Client ID` 到 `DISCORD_CLIENT_ID`
- 复制 `Client Secret` 到 `DISCORD_CLIENT_SECRET`

### 3. 配置权限范围
Discord OAuth已配置以下权限：
- `identify`: 获取用户基本信息
- `email`: 获取用户邮箱
- `guilds`: 获取用户服务器列表（可选）

## 使用方法

### 1. 启动数据库
```bash
# 启动PostgreSQL数据库
./start-database.sh

# 或者手动启动
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=my-first-app -p 5432:5432 -d postgres
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 到 `.env` 并填入正确的值：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 4. 数据库迁移
```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npm run db:migrate
```

### 5. 启动开发服务器
```bash
npm run dev
```

### 6. 访问应用
打开浏览器访问 `http://localhost:3000`

## 用户流程

### Discord用户登录
1. 访问首页，点击"Sign In"
2. 点击"Sign in with Discord"按钮
3. 重定向到Discord授权页面
4. 授权应用访问Discord账户信息
5. 自动创建账户并登录成功
6. 跳转到Todo管理页面

### 传统用户注册
1. 访问首页，点击"Sign Up"
2. 填写姓名、邮箱和密码
3. 提交注册表单
4. 系统自动跳转到登录页面

### 传统用户登录
1. 访问首页，点击"Sign In"
2. 输入邮箱和密码
3. 登录成功后跳转到Todo管理页面

### Todo管理
- 只有登录用户才能创建、查看、编辑和删除Todo
- 每个用户只能看到和操作自己的Todo
- 支持标记完成状态和删除操作
- **Discord用户和传统用户享有相同的Todo管理功能**

## API端点

### 认证相关
- `POST /api/auth/signin`: 用户登录
- `POST /api/auth/signup`: 用户注册
- `GET /api/auth/session`: 获取会话信息
- `POST /api/auth/signout`: 用户登出
- `GET /api/auth/callback/discord`: Discord OAuth回调

### Todo管理 (需要认证)
- `GET /api/trpc/todo.getAll`: 获取用户的所有Todo
- `POST /api/trpc/todo.create`: 创建新的Todo
- `PUT /api/trpc/todo.toggle`: 切换Todo完成状态
- `DELETE /api/trpc/todo.delete`: 删除Todo

## 安全特性

- 密码使用bcrypt加密存储
- JWT令牌用于会话管理
- 所有Todo操作都验证用户身份
- 用户只能访问自己的数据
- 防止SQL注入和XSS攻击
- **OAuth 2.0安全流程**
- **Discord用户无需存储密码**

## 部署注意事项

### 生产环境
1. 更改 `NEXTAUTH_SECRET` 为强随机字符串
2. 设置正确的 `NEXTAUTH_URL`
3. 更新Discord OAuth重定向URL为生产域名
4. 使用HTTPS
5. 配置数据库连接池
6. 设置适当的CORS策略

### 环境变量
确保生产环境设置正确的环境变量：
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NODE_ENV`

## 故障排除

### 常见问题

1. **Discord登录失败**
   - 检查Discord应用配置
   - 验证重定向URL设置
   - 确认环境变量正确
   - 查看浏览器控制台错误

2. **数据库连接失败**
   - 检查PostgreSQL服务是否运行
   - 验证数据库连接字符串
   - 确认数据库权限

3. **认证失败**
   - 检查环境变量配置
   - 验证NextAuth.js配置
   - 查看浏览器控制台错误

4. **Todo不显示**
   - 确认用户已登录
   - 检查数据库中的Todo数据
   - 验证tRPC查询是否正常

### 调试模式
启用调试日志：
```bash
DEBUG=* npm run dev
```

## 扩展功能建议

- 添加邮箱验证
- 实现密码重置功能
- 集成更多OAuth提供商（Google、GitHub等）
- 添加用户头像上传
- 实现Todo分类和标签
- 添加Todo提醒功能
- 实现数据导出功能
- **Discord服务器集成**
- **Discord机器人功能**

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License
