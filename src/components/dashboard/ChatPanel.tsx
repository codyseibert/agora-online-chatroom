import { RtmChannel, RtmClient } from 'agora-rtm-sdk'
import React, { FC, useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../context/UserContext'
import { trpc } from '../../utils/trpc'
import Button, { Variant } from '../Button'
import UsersPanel from './UsersPanel'

type Props = {
  client: RtmClient,
  refetchRooms: () => void,
  selectedRoomName: string
  selectedRoomId: string
  setSelectedRoomId: (roomId: string) => void,
}

type Message = {
  text: string
  userId: string
  name: string
}

const ChatPanel: FC<Props> = ({ setSelectedRoomId,
  refetchRooms, client, selectedRoomName, selectedRoomId }) => {
  const { user } = useContext(UserContext);
  const [text, setText] = useState<string>('');
  const [roomChannel, setRoomChannel] = useState<RtmChannel>();
  const [messages, setMessages] = useState<Message[]>([]);
  const sendMessage = trpc.useMutation('room.saveMessage');
  const messagesRef = useRef(null)
  const deleteRoom = trpc.useMutation('room.deleteRoom');

  const getMessage = trpc.useQuery(['room.getMessages', {
    roomId: selectedRoomId
  }], {
    enabled: false,
    onSuccess: (initialMessages: Message[]) => {
      setMessages(initialMessages);
    }
  });

  const handleChatTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }

  const handleDeleteRoom = async () => {
    await deleteRoom.mutateAsync({
      roomId: selectedRoomId,
    });
    refetchRooms();
    setSelectedRoomId(undefined);
  }

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomChannel) return;
    if (!text) return;
    roomChannel.sendMessage({
      text: JSON.stringify({
        userId: user.id,
        text,
        name: user.name,
      })
    })
    sendMessage.mutate({
      text,
      userId: user.id,
      name: user.name,
      roomId: selectedRoomId
    })
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text,
        userId: user.id,
        name: user.name,
      }
    ])
    setText('');
  }

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop =
      messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const connectToRoom = async () => {
      await getMessage.refetch();
      const channel = await client.createChannel(selectedRoomId);
      await channel.join();
      channel.on('ChannelMessage', (message) => {
        if (!message.text) return;
        const messageObj = JSON.parse(message.text);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            ...messageObj,
          }
        ])
      })
      setRoomChannel(channel);
      return {
        channel
      };
    }

    const clientPromise = connectToRoom();

    return () => {
      clientPromise.then(async (context) => {
        if (!context) return;
        const { channel } = context;
        await channel.leave();
        setRoomChannel(undefined);
      });
    };

  }, [selectedRoomId]);


  if (!selectedRoomId) return null;

  return (
    <div className='flex gap-4 h-full'>
      <div className='flex flex-col flex-grow gap-4 p-4'>
        <div>
          <Button
            onClick={handleDeleteRoom}
            variant={Variant.Danger}>Delete Room</Button>
        </div>
        <div>You are in the <b>{selectedRoomName}</b> room</div>

        <div
          className="h-64 w-[30rem] bg-white border rounded p-4 overflow-auto"
          ref={messagesRef}>
          {messages.map((message, idx) =>
            <div key={idx}>
              {message.name}: {message.text}
            </div>
          )}
        </div>
        <form
          onSubmit={handleSendMessage}
        >
          <input
            value={text}
            onChange={handleChatTyped}
            placeholder="type a message here"
            className="p-2 text-md border"
          />
          <Button
            variant={Variant.Primary}>Send</Button>
        </form>
      </div>
      <UsersPanel
        selectedRoomId={selectedRoomId}
      />
    </div>
  )
}

export default ChatPanel