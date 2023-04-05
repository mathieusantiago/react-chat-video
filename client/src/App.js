import { Button, Col, Container, Form, Row } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [start, setStart] = useState(true);
  const [refresh, setrefresh] = useState(false);
  const getRooms = () => {
    if (start) {
      console.log("testsetsetset");
      axios.get("http://localhost:3001").then((body) => {
        setMessages(body.data);
      });
    }
  }
  useEffect(() => {
    const newSocket = io.connect("http://localhost:3001");
    setSocket(newSocket);
    getRooms()
    return () => {
      newSocket.disconnect();
    };
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;

    socket.on("create_room", (msg) => {
      setMessages(msg);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    
    socket.on("User_connected", (msg) => {
      console.log(msg);
    });
    return () => {
      socket.off("create_room");
    };
  }, [socket]);

  const handleSubmit = (e) => {
    if (input) {
      socket.emit("create_room", input);
      setInput("");
    }
  };

  return (
    <div>
      <Container>
        <div className="">
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Create Room</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name room"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="primary" onClick={() => handleSubmit()}>
                Submit
              </Button>
            </Form.Group>
          </Form>
        </div>
        <div className="listRoom">
          <p>list of rooms <Button onClick={() => getRooms()}>refresh rooms</Button></p>
          <Row>
            {messages.map((msg, index) => {
              return (
                <Col key={index}>
                  <div>
                    <Button
                      variant="secondary"
                      className="mb-1"
                      size="lg"
                    >
                      {msg.room}
                    </Button>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default App;
