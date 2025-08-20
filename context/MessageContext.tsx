import React, { createContext, useState, useContext } from 'react';

interface MessageContextType {
  messages: any[];
  setMessages: (messages: any[]) => void;
  lastMessages: { [key: string]: string };
  setLastMessages: (messages: { [key: string]: string }) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});

  return (
    <MessageContext.Provider 
      value={{ 
        messages, 
        setMessages, 
        lastMessages, 
        setLastMessages 
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};