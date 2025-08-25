import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

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
    .input(
      z.object({
        title: z.string().min(1),
        dueDate: z.string().optional(),
        priority: priorityEnum.optional(),
        list: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      return await ctx.db.todo.create({
        data: {
          title: input.title,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          priority: input.priority || 'MEDIUM',
          list: input.list || '所有任务',
          notes: input.notes || null,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        completed: z.boolean().optional(),
        priority: priorityEnum.optional(),
        dueDate: z.string().nullable().optional(),
        flagged: z.boolean().optional(),
        list: z.string().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { id, ...data } = input;

      // 处理日期
      if (data.dueDate !== undefined) {
        (data as any).dueDate = data.dueDate ? new Date(data.dueDate) : null;
      }

      return await ctx.db.todo.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      });
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const todo = await ctx.db.todo.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!todo) {
        throw new Error('Todo not found');
      }

      return await ctx.db.todo.update({
        where: { id: input.id },
        data: { completed: !todo.completed },
      });
    }),

  toggleFlag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const todo = await ctx.db.todo.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!todo) {
        throw new Error('Todo not found');
      }

      return await ctx.db.todo.update({
        where: { id: input.id },
        data: { flagged: !todo.flagged },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        // 首先检查任务是否存在且属于当前用户
        const todo = await ctx.db.todo.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!todo) {
          throw new Error('Task not found or access denied');
        }

        // 删除任务
        const deletedTodo = await ctx.db.todo.delete({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        console.log('Task deleted successfully:', deletedTodo.id);
        return deletedTodo;
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    }),
});
