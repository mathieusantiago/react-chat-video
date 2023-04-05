import { Button, Form } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io.connect("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('create_room', (msg) => {
      console.log(msg)
      setMessages((prevMessages) => {
        if (prevMessages !== msg)
          return [...prevMessages, msg];
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      socket.off('create_room');
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) {
      socket.emit('create_room', input);
      setInput('');
    }
  };

  return (
    <div>
      <div className="">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Room</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name room"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form.Group>
        </Form>
      </div>
      <div className="listRoom">
        {messages.map((msg, index) => {
          return (
            <div key={index}>
              <Button variant="secondary" onClick={() => handleSubmit()}>
                {msg.room}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;