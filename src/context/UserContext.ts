import { User } from "@prisma/client";
import React from "react";

type TUserContext = {
  user: User
  setUser: (user: User) => void
}

export const UserContext = React.createContext<TUserContext>({
  user: {
    id: '',
    name: '',
  },
  setUser: (user: User) => null,
})