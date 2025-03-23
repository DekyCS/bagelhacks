// inputStore.js
import { useState, useEffect } from 'react';

// Create a store for the message input
let messageInput = "";
const listeners = new Set();
const settersSet = new Set();

// Function to update the message input
export const updateMessageInput = (newInput) => {
  messageInput = newInput;
  // Notify all listeners of the change
  listeners.forEach(listener => listener(newInput));
};

// Hook to subscribe to the message input
export const useMessageInput = () => {
  const [input, setInput] = useState(messageInput);
  
  useEffect(() => {
    // Add listener
    const listener = (newInput) => {
      setInput(newInput);
    };
    
    listeners.add(listener);
    
    // Set initial state if available
    setInput(messageInput);
    
    // Cleanup listener on unmount
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  // Create a setter function that updates both local state and the global store
  const setMessageInput = (newInput) => {
    // If newInput is a function, call it with the current input
    const updatedInput = typeof newInput === 'function' 
      ? newInput(messageInput) 
      : newInput;
      
    updateMessageInput(updatedInput);
  };
  
  // Register this setter
  useEffect(() => {
    settersSet.add(setMessageInput);
    return () => {
      settersSet.delete(setMessageInput);
    };
  }, []);
  
  return [input, setMessageInput];
};

// Export getter function for non-React environments
export const getMessageInput = () => messageInput;

// Export function to get all setters (useful for components that need to trigger updates)
export const getAllSetters = () => Array.from(settersSet);