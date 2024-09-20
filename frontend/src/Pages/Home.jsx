import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import '../App.css'

const socket = io.connect("http://localhost:3005");

function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]); 
  const [customMessages, setCustomMessages] = useState({}); 
  const [receivedMessage, setReceivedMessage] = useState(""); 
  const email = localStorage.getItem("email");

  // const handleInputChange = (event) => {
  //   setUserInput(event.target.value);
  // };

  const handleCustomMessageChange = (socketId, event) => {
    setCustomMessages((prevMessages) => ({ ...prevMessages, [socketId]: event.target.value }));
  };

  // const handleButtonClick = () => {
  //   socket.emit("get_string_length", userInput);
  // };

  const handleSendMessage = (socketId, message) => {
    socket.emit("send_message", socketId, message);
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("login", email);
    });

    // socket.on("string_length", (length) => {
    //   setResult(`The length of the string is: ${length}`);
    // });

    socket.on("online_users", (users) => {
      setConnectedUsers(users.filter(user => user.id !== socket.id));
    });

    socket.on("message", (message) => {
      setReceivedMessage(message);
    });

    socket.on("broadcast_message", (message) => {
      setReceivedMessage(message); 
    });
  }, [socket, email]);

  return (
    <div className="App">
      <h3>{email}:- {socket.id}</h3>
      {/* <input type="text" value={userInput} onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Get String Length</button>
      <p>{result}</p> */}
      <h2>Connected Users (except current one):</h2>
      <ul className="socketList">
        {connectedUsers.map((user, index) => (
          <li key={index}>
            {user.email}
            <input
              type="text"
              value={customMessages[user.id] || ""} 
              onChange={(event) => handleCustomMessageChange(user.id, event)}
              placeholder="Enter custom message"
            />
            <button onClick={() => handleSendMessage(user.id, customMessages[user.id])}>Send Message</button>
          </li>
        ))}
      </ul>
      <h3>{receivedMessage}</h3>
    </div>
  );
}

export default Home;