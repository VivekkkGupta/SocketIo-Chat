import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../providers/Socket';

function Home() {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleJoinRoom = useCallback(() => {
    if(email && roomId) {
      socket.emit("joinRoom", { emailId: email, roomId });
    }
  }, [email, roomId, socket]);

  const handleRoomJoined = useCallback(({roomId}) => {
    navigate(`/room/${roomId}`);
  }, [navigate]);

  useEffect(() => {
    socket.on("joinedRoom", handleRoomJoined); 
    return () => {
      socket.off("joinedRoom", handleRoomJoined);
    }
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-5">
      <h1>Chatter</h1>
      <input
        type="text"
        placeholder="Enter your email"
        className="border-2 border-gray-300 rounded-md p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room ID"
        className="border-2 border-gray-300 rounded-md p-2"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={handleJoinRoom}
      >
        Join Room
      </button>
    </div>
  )
}

export default Home