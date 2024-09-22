import React, { createContext, useState } from 'react';

// Create History Context
export const HistoryContext = createContext();

// HistoryProvider Component
export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  // Function to add a new history entry with a timestamp
  const addHistoryEntry = (action, description) => {
    const newEntry = {
      id: Date.now(), // Unique ID based on current timestamp
      action, // Action type (e.g., 'Approved', 'Rejected')
      description, // Description of the action
      timestamp: new Date().toLocaleString(), // Timestamp of the action
    };
    setHistory((prevHistory) => [...prevHistory, newEntry]);
  };

  // Function to clear the history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};
