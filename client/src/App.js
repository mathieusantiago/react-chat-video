import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io.connect("http://localhost:3001");

function App() {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [userToCall, setUserToCall] = useState("");
  const [users, setUsers] = useState({}); // Utilisez le state pour stocker les utilisateurs connectés
  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });
 
    socket.on("allUsers", ({ users }) => {
      setUsers(users); // Mettez à jour l'état des utilisateurs connectés
      for (const id in users) {
        if (id !== socket.id) {
          setOtherUserId(id);
          break;
        }
      }
    });

    socket.on("callUser", ({ signal, from }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
    });

    socket.on("callAccepted", (signal) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });
      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: caller });
      });
      peer.on("stream", (stream) => {
        partnerVideo.current.srcObject = stream;
      });
      peer.signal(signal);
    });

    // Mettez à jour l'état des utilisateurs connectés lorsqu'un nouvel utilisateur se connecte
    socket.on("user-connected", (userId) => {
      console.log("User connected:", userId);
      setUsers((prevUsers) => ({ ...prevUsers, [userId]: true }));
    });

    // Mettez à jour l'état des utilisateurs connectés lorsqu'un utilisateur se déconnecte
    socket.on("user-disconnected", (userId) => {
      console.log("User disconnected:", userId);
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[userId];
        return newUsers;
      });
    });
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: userToCall, // Utilisez la valeur sélectionnée dans la liste déroulante
        signalData: data,
        from: socket.id,
      });
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });
  };

  const answerCall = () => {
    setReceivingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  };
 
  return (
    <div className="App">
      {stream && (
        <video
          playsInline
          muted
          ref={userVideo}
          autoPlay
          style={{ width: "50%" }}
        />
      )}
      {receivingCall && (
        <>
          <h1>Someone is calling you...</h1>
          <button onClick={answerCall}>Answer</button> 
        </>
      )}
      <video playsInline ref={partnerVideo} autoPlay style={{ width: "50%" }} />
      {/* Ajoutez une liste déroulante pour sélectionner l'utilisateur à appeler */}
      <select onChange={(e) => setUserToCall(e.target.value)}>
        {Object.keys(users).map((userId) => (
          <option key={userId} value={userId}>
            User {userId}
          </option>
        ))}
      </select>
      <button onClick={callUser}>Call</button>
    </div>
  );
}

export default App;
