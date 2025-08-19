import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const todoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    return await ctx.db.todo.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  create: protectedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      return await ctx.db.todo.create({
        data: {
          text: input.text,
          userId: ctx.session.user.id,
        },
      });
    }),

  toggle: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const todo = await ctx.db.todo.findUnique({
      where: { 
        id: input.id,
        userId: ctx.session.user.id, // 确保只能操作自己的todo
      },
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    return await ctx.db.todo.update({
      where: { id: input.id },
      data: { isCompleted: !todo.isCompleted },
    });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const todo = await ctx.db.todo.findUnique({
      where: { 
        id: input.id,
        userId: ctx.session.user.id, // 确保只能删除自己的todo
      },
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    return await ctx.db.todo.delete({
      where: { id: input.id },
    });
  }),
});
