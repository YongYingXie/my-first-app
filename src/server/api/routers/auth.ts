import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

// 创建更严格的验证schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, '用户名至少需要2个字符')
    .max(50, '用户名不能超过50个字符')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, '用户名只能包含字母、数字、空格、连字符和下划线'),
  email: z
    .string()
    .email('请输入有效的邮箱地址')
    .max(254, '邮箱地址过长')
    .refine((email) => {
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const [localPart, domain] = parts;
      return localPart && domain && localPart.length <= 64 && domain.length <= 253;
    }, '邮箱地址格式不正确'),
  password: z
    .string()
    .min(6, '密码长度至少为6位')
    .max(12, '密码长度不能超过12位')
    .refine((password) => {
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      return hasLetter || hasSpecialChar;
    }, '密码必须包含字母或特殊字符'),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;

      // 检查用户是否已存在
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建新用户
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),
});
