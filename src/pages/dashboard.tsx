import { Room } from '@prisma/client';
import { RtmClient } from 'agora-rtm-sdk';
import { NextPage } from 'next'
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from 'react'
import Button, { Variant } from '../components/Button';
import ChatPanel from '../components/dashboard/ChatPanel';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';
import { UserContext } from '../context/UserContext';
import { trpc } from '../utils/trpc';

const SERVER_ID = 'cl6x0pioa0010nioovy3gjo0p'

const DashboardPage: NextPage = () => {
  const { user } = useContext(UserContext);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const getServers = trpc.useQuery(['user.getServers', { userId: user.id }])
  const createRoom = trpc.useMutation('server.createRoom');
  const getRooms = trpc.useQuery(['server.getRooms', { serverId: SERVER_ID }])
  const [selectedRoomId, setSelectedRoomId] = useState<string>()
  const [selectedRoomName, setSelectedRoomName] = useState<string>()
  const router = useRouter();
  const joinRoom = trpc.useMutation('server.joinRoom');
  const getToken = trpc.useMutation('server.getToken');
  const [client, setClient] = useState<RtmClient>()

  useEffect(() => {
    if (!user.id) {
      router.push('/');
    }
  }, [router, user])

  useEffect(() => {
    if (!user.id) return;
    const login = async () => {
      const token = await getToken.mutateAsync({
        userId: user.id,
      })
      const { default: AgoraRTM } = await import('agora-rtm-sdk');

      const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
      await client.login({
        uid: user.id,
        token
      });
      console.log('setting the client');
      setClient(client);
      return client;
    }
    const loginPromise = login();

    return () => {
      const logout = async () => {
        const client = await loginPromise;
        await client.logout();
        console.log('unsetting the client');
        setClient(undefined);
      }
      logout()
    }
  }, [user])

  const handleCloseCreateRoomModal = () => {
    setShowCreateRoomModal(false)
  }

  const handleShowCreateRoomModal = () => {
    setShowCreateRoomModal(true)
  }

  const handleCreateRoom = async (roomName: string) => {
    await createRoom.mutateAsync({
      name: roomName,
      serverId: SERVER_ID // TODO: unhard code me
    })
    await getRooms.refetch();
  }

  const handleRoomSelected = async (room: Room) => {
    await joinRoom.mutateAsync({
      roomId: room.id,
      userId: user.id
    })
    setSelectedRoomId(room.id);
    setSelectedRoomName(room.name)
  }

  const showChatPanel = selectedRoomId && selectedRoomName && client;

  return (
    <>
      <div className="h-full flex">
        {/* <div>DashboardPage {user.name} {user.id}</div> */}
        <div className="w-16 bg-gray-200 h-full flex justify-center pt-4">
          {getServers.data?.map(server =>
            <div
              className="rounded-full bg-blue-300 hover:bg-blue-200 cursor-pointer w-12 h-12 flex justify-center items-center"
              key={server.serverId}>{server.serverId.charAt(0)}</div>
          )}
        </div>
        <div className="w-60 bg-gray-100 h-full p-4">
          <div className="flex flex-col gap-2 justify-start mb-4">
            {getRooms.data?.map(room => <div key={room.id}>
              <button
                onClick={() => handleRoomSelected(room)}
                className="hover:text-blue-400">
                {room.name}
              </button>
            </div>)}
          </div>
          <Button
            variant={Variant.Primary}
            onClick={handleShowCreateRoomModal}
          >Create Room</Button>
        </div>
        <div className="flex-grow bg-gray-50 h-full">
          {showChatPanel &&
            <ChatPanel
              refetchRooms={getRooms.refetch}
              client={client}
              setSelectedRoomId={setSelectedRoomId}
              selectedRoomId={selectedRoomId}
              selectedRoomName={selectedRoomName}
            />
          }
        </div>
      </div>
      <CreateRoomModal
        onCreateRoom={handleCreateRoom}
        isOpen={showCreateRoomModal}
        onClose={handleCloseCreateRoomModal} />
    </>
  )
}

export default DashboardPage