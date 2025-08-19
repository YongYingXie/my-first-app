# 用户认证验证规则

本文档说明了用户注册和登录时的账号和密码验证规则。

## 验证规则

### 1. 用户名 (Name)
- **长度要求**: 2-50个字符
- **允许字符**: 字母、数字、空格、连字符(-)、下划线(_)
- **不允许**: 特殊符号（如 @、#、$、% 等）

### 2. 邮箱地址 (Email)
- **格式要求**: 必须是有效的邮箱格式 (user@domain.com)
- **长度限制**: 
  - 总长度不超过254个字符
  - @符号前的本地部分不超过64个字符
  - @符号后的域名部分不超过253个字符
- **验证示例**:
  - ✅ `user@example.com`
  - ✅ `user.name@domain.co.uk`
  - ❌ `user@domain` (缺少顶级域名)
  - ❌ `@domain.com` (缺少本地部分)

### 3. 密码 (Password)
- **长度要求**: 6-12个字符
- **复杂度要求**: 必须包含以下至少一种：
  - 字母 (a-z, A-Z)
  - 特殊字符 (!@#$%^&*()_+-=[]{}|;':",./<>?)
- **验证示例**:
  - ✅ `abc123` (6位，包含字母)
  - ✅ `123!@#` (6位，包含特殊字符)
  - ✅ `password123` (12位，包含字母)
  - ❌ `123456` (6位，但只包含数字)
  - ❌ `abc` (少于6位)
  - ❌ `verylongpassword123` (超过12位)

## 实现特性

### 前端验证
- **实时验证**: 用户在输入时立即看到验证结果
- **视觉反馈**: 错误字段显示红色边框和错误信息
- **表单提交**: 只有在所有字段验证通过后才能提交表单
- **用户友好**: 提供清晰的中文错误提示

### 后端验证
- **双重验证**: 前端和后端都进行验证，确保数据安全
- **Zod Schema**: 使用Zod库进行严格的类型验证
- **错误处理**: 提供详细的错误信息给前端

## 文件结构

```
src/
├── lib/
│   └── validation.ts          # 验证工具函数
├── app/
│   └── auth/
│       ├── signup/
│       │   └── page.tsx       # 注册页面（包含验证）
│       └── signin/
│           └── page.tsx       # 登录页面（包含验证）
└── server/
    └── api/
        └── routers/
            └── auth.ts        # 后端认证路由（包含验证）
```

## 使用方法

### 导入验证函数
```typescript
import { validateField, validateEmail, validatePassword, validateName } from '~/lib/validation';
```

### 验证单个字段
```typescript
const emailValidation = validateField('email', 'user@example.com');
if (!emailValidation.isValid) {
  console.log(emailValidation.message);
}
```

### 验证密码强度
```typescript
const passwordValidation = validatePassword('mypassword123');
if (!passwordValidation.isValid) {
  console.log(passwordValidation.message);
}
```

## 注意事项

1. **安全性**: 验证规则旨在提高账户安全性，但不应替代其他安全措施
2. **用户体验**: 验证错误信息使用中文，提供更好的本地化体验
3. **性能**: 前端验证使用防抖技术，避免频繁验证影响性能
4. **兼容性**: 验证规则符合现代Web应用的标准要求

## 未来改进

- [ ] 添加密码强度指示器
- [ ] 支持国际化（多语言错误信息）
- [ ] 添加更复杂的密码规则（如大小写要求）
- [ ] 实现密码历史检查
- [ ] 添加账户锁定机制
