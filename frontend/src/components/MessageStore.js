// messageStore.js
import { useState, useEffect } from 'react';

// Create a store for the latest agent message
let latestAgentMessage = null;
const listeners = new Set();

// Function to update the message
export const updateLatestAgentMessage = (message) => {
  latestAgentMessage = message;
  // Notify all listeners of the change
  listeners.forEach(listener => listener(message));
};

// Hook to subscribe to the latest message
export const useLatestAgentMessage = () => {
  const [message, setMessage] = useState(latestAgentMessage);
  
  useEffect(() => {
    // Add listener
    const listener = (newMessage) => {
      setMessage(newMessage);
    };
    
    listeners.add(listener);
    
    // Set initial state if available
    if (latestAgentMessage) {
      setMessage(latestAgentMessage);
    }
    
    // Cleanup listener on unmount
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  return message;
};

// Export getter function for non-React environments
export const getLatestAgentMessage = () => latestAgentMessage;