import React from 'react';
import axios from 'axios';

const ActionProvider = ({ createChatBotMessage, setPoints, setState, children }) => {
  const msgHandler = async (message) => {
    const response = await axios.post("http://127.0.0.1:5000/get_landmarks", {
      question: message,
    });
    const data = response.data
    const botMessage = createChatBotMessage(data["response"]);
    setPoints(data["points"]);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: { msgHandler, },
        });
      })}
    </div>
  );
};

export default ActionProvider;
