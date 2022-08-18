// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./userRouter";
import { serverRouter } from "./serverRouter";
import { roomRouter } from "./roomRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("server.", serverRouter)
  .merge("room.", roomRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
