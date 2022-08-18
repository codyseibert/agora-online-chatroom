import { createRouter } from "./context";
import { z } from "zod";

import { RtmTokenBuilder, RtmRole } from 'agora-access-token';

export const serverRouter = createRouter()
  .query('getRooms', {
    input: z
      .object({
        serverId: z.string(),
      }),
    async resolve({ input, ctx }) {
      const rooms = await ctx.prisma.room.findMany({
        where: {
          serverId: input.serverId,
        }
      })
      return rooms
    },
  })
  .query('getUsers', {
    input: z
      .object({
        roomId: z.string(),
      }),
    async resolve({ input, ctx }) {
      const users = await ctx.prisma.user.findMany({
        where: {
          roomId: input.roomId,
        }
      })
      return users;
    },
  })
  .mutation("createRoom", {
    input: z
      .object({
        name: z.string(),
        serverId: z.string(),
      }),
    async resolve({ input, ctx }) {
      const newServer = await ctx.prisma.room.create({
        data: {
          serverId: input.serverId,
          name: input.name
        }
      })
      return newServer
    },
  })
  .mutation("getToken", {
    input: z
      .object({
        userId: z.string(),
      }),
    async resolve({ input }) {
      const appID = process.env.AGORA_ID!
      const appCertificate = process.env.AGORA_CERT!;
      const account = input.userId;
      const expirationTimeInSeconds = 3600
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
      const token = RtmTokenBuilder.buildToken(
        appID,
        appCertificate,
        account,
        RtmRole.Rtm_User,
        privilegeExpiredTs
      );
      return token;
    },
  })
  .mutation("joinRoom", {
    input: z
      .object({
        userId: z.string(),
        roomId: z.string(),
      }),
    async resolve({ input, ctx }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          roomId: input.roomId
        }
      })
    },
  })


