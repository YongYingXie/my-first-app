import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.todo.create({
        data: {
          text: input.text,
        },
      });
    }),

  toggle: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const todo = await ctx.db.todo.findUnique({
      where: { id: input.id },
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    return await ctx.db.todo.update({
      where: { id: input.id },
      data: { isCompleted: !todo.isCompleted },
    });
  }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const todo = await ctx.db.todo.findUnique({
      where: { id: input.id },
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    return await ctx.db.todo.delete({
      where: { id: input.id },
    });
  }),
});
