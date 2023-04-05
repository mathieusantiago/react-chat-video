import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { Peer } from "peerjs";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

const socket = io.connect("ws://localhost:3001");
 
function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState([]);
  const [useRoom, setUseRoom] = useState([]);

  useEffect(() => {
    // listen if user is connected 
    socket.on("User connected", (userId) => {
      setUser(userId)
      console.log("User connected:", userId);
    });

    // listen if user is disconnected 
    socket.on("user-disconnected", (userId) => {
      setUser('')
      console.log("user disconnected:", userId);
    });

    // listen created room
    socket.on("create_room", (useRoom)=>{
      setUseRoom([useRoom[1].room])
      console.log("user:", useRoom[0] , "create room", useRoom[1].room)
    })
  }, []);


  const handleSubmit = () => {
    // send name room 
    socket.emit("create_room", {room});
  };

  return (
      <div>
          <div className="">
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Room</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name room"
                  onChange={(e) => setRoom([e.target.value])}
                />
                <Button variant="primary" onClick={()=>handleSubmit()}>
                  Submit
                </Button>
              </Form.Group>
            </Form>
          </div>
          <div className="listRoom">
          {useRoom.map((e,i)=>{
            return (
              <div key={i}>
                <Button variant="secondary" onClick={()=>handleSubmit()}>
                  {e}
                </Button>
              </div>
            )
          })}
          </div>
        </div>
  );
}

export default App;
