import React, { createContext, useContext, useState } from 'react';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  generation_time: number;
  tokens: number;
};

type ChatContextType = {
  chatHistory: Message[];
  addMessage: (msg: Message) => void;
  clearHistory: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const addMessage = (msg: Message) => {
    setChatHistory((prev) => [...prev, msg]);
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, addMessage, clearHistory }}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
