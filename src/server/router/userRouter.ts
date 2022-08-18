import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter()
  .query('getServers', {
    input: z
      .object({
        userId: z.string()
      }),
    async resolve({ input, ctx }) {
      const servers = ctx.prisma.userServers.findMany({
        where: {
          userId: input.userId
        }
      })
      return servers;
    }
  })
  .mutation("createUser", {
    input: z
      .object({
        name: z.string()
      }),
    async resolve({ input, ctx }) {
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          name: input.name
        }
      });

      if (existingUser) {
        return existingUser
      } else {
        const createdUser = await ctx.prisma.user.create({
          data: {
            name: input.name,
          }
        })
        const server = await ctx.prisma.server.create({
          data: {
            userId: createdUser.id
          }
        })
        await ctx.prisma.userServers.create({
          data: {
            serverId: server.id,
            userId: createdUser.id,
          }
        })
        return createdUser;
      }
    },
  });
