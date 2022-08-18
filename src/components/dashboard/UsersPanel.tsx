import React, { FC } from 'react'
import { trpc } from '../../utils/trpc'

type Props = {
  selectedRoomId: string
}

const UsersPanel: FC<Props> = ({ selectedRoomId }) => {

  const getUsersInRoom = trpc.useQuery(['server.getUsers', { roomId: selectedRoomId }])

  return (
    <div className="w-[30rem] bg-gray-100 h-full p-4">
      <h1 className="font-bold mb-2">Users in Room</h1>

      <div className='flex flex-col gap-2'>
        {getUsersInRoom.data?.map(user => <div key={user.id}>
          {user.name}
        </div>)}
      </div>

    </div>
  )
}

export default UsersPanel