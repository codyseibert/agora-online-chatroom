import { createRouter } from "./context";
import { z } from "zod";

export const roomRouter = createRouter()
  .query('getMessages', {
    input: z
      .object({
        roomId: z.string(),
      }),
    async resolve({ input, ctx }) {
      const messages = await ctx.prisma.message.findMany({
        where: {
          roomId: input.roomId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return messages
    },
  })
  .mutation("saveMessage", {
    input: z
      .object({
        text: z.string(),
        name: z.string(),
        roomId: z.string(),
        userId: z.string(),
      }),
    async resolve({ input, ctx }) {
      const message = await ctx.prisma.message.create({
        data: {
          roomId: input.roomId,
          name: input.name,
          userId: input.userId,
          text: input.text,
        }
      })
      return message
    },
  })
  .mutation("deleteRoom", {
    input: z
      .object({
        roomId: z.string(),
      }),
    async resolve({ input, ctx }) {
      await ctx.prisma.room.delete({
        where: {
          id: input.roomId,
        }
      })
    },
  })


