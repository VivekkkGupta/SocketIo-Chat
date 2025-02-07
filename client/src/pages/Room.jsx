import React, { use, useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { useParams } from "react-router-dom";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

function Room() {
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const { roomId } = useParams();
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();

  const handleUserJoined = useCallback(
    async ({ emailId }) => {
      const offer = await createOffer();
      socket.emit("callUser", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleInComingCall = useCallback(
    async ({ from, offer }) => {
      const answer = await createAnswer(offer);
      socket.emit("callAccepted", { emailId: from, answer });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]

  );

  const handleCallAccepted = useCallback(
    async ({ answer }) => {
      await setRemoteAnswer(answer);
    },
    [setRemoteAnswer]
  );


  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
  }, [setMyStream]);

  const handleNegotiationNeeded = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit("callUser", { emailId: remoteEmailId, offer: localOffer });
  }, [peer, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("userJoined", handleUserJoined);
    socket.on("inComingCall", handleInComingCall);
    socket.on("callAccepted", handleCallAccepted);

    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("inComingCall", handleInComingCall);
      socket.off("callAccepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleInComingCall, handleCallAccepted]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);  
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [handleNegotiationNeeded, peer]);

  useEffect(() => {
    getUserMediaStream();    
  }, [getUserMediaStream]);


  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    // console.log(myStream)
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [remoteEmailId, myStream]);

  return (  
    <>
      <h1>Room Id : {roomId}</h1>
      <h4>You are Connected with {remoteEmailId}</h4>
      <button onClick={(e) => sendStream(myStream)}>Send Stream</button>
      <ReactPlayer url={myStream} playing />
      <ReactPlayer url={remoteStream ? URL.createObjectURL(remoteStream) : null} playing />
    </>
  );
}

export default Room;
