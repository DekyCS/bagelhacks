import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState, useRef } from "react";
import { updateLatestAgentMessage } from "./MessageStore";

// Simple helper to trigger mouth movement events
const triggerMouthMovement = (isActive) => {
  // Always maintain the current animation but trigger viseme updates
  if (isActive) {
    // Trigger viseme update to start mouth movement
    window.dispatchEvent(new CustomEvent('visemeUpdate', {
      detail: {
        text: "Speaking",
        speechStartTime: Date.now()
      }
    }));
  } else {
    // Stop mouth movement by setting Idle animation
    window.dispatchEvent(new CustomEvent('animationUpdate', { 
      detail: { animation: 'Idle' } 
    }));
  }
};

// Helper function to save chat history to a file
const saveChatHistory = (chatHistory) => {
  try {
    localStorage.setItem('interviewChatHistory', JSON.stringify(chatHistory));
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [latestAgentMessage, setLatestAgentMessage] = useState(null);
  
  // Ref to track when speech begins
  const speechStartTimeRef = useRef(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  
  // New function to check for "technical question" phrase
  const checkForTechnicalQuestion = (text) => {
    if (text && text.toLowerCase().includes("review and describe the following code snippet")) {
      console.log("Technical question detected! Opening text input...");
      // Dispatch a custom event to signal opening the text input
      window.dispatchEvent(new CustomEvent('openTextInput', {
        detail: { reason: 'technicalQuestion' }
      }));
    }
  };

  // Check for closing sentence
  const checkForCloseSentence = (text) => {
    if (text && text.trim().toLowerCase().includes("it's been great speaking with you.")) {
      console.log("closing");
      window.location.href = '/report';
    }
  };
  
  // Handle state changes (speaking/not speaking)
  useEffect(() => {
    console.log("===== Voice Assistant State: ", state);
    
    if (state === 'speaking' || state === 'streaming') {
      // Record the timestamp when speech starts
      if (!speechStartTimeRef.current) {
        speechStartTimeRef.current = Date.now();
        console.log("Speech started at:", speechStartTimeRef.current);
      }
      
      // Start mouth movement
      triggerMouthMovement(true);
    } else {
      // Reset speech start time when speech ends
      speechStartTimeRef.current = null;
      console.log("Speech ended, reset timing");
      
      // Stop mouth movement
      triggerMouthMovement(false);
    }
  }, [state]);

  // Handle agent transcription updates
  useEffect(() => {
    // Skip if there are no transcriptions
    if (!agentTranscriptions || agentTranscriptions.length === 0) return;
    
    // Filter out empty transcriptions
    const agentMessages = agentTranscriptions.filter(t => t.text && t.text.trim() !== '');
    if (agentMessages.length === 0) return;
    
    const latest = agentMessages[agentMessages.length - 1];
    
    // Only update if it's a new message or significant change
    const shouldUpdate = !latestAgentMessage || 
                        latest.id !== latestAgentMessage.id || 
                        latest.text !== latestAgentMessage.text;
    
    if (shouldUpdate) {
      console.log("New/updated message:", latest.text);
      setLatestAgentMessage(latest);
      
      // Update the shared message store
      updateLatestAgentMessage(latest.text);
      
      // Check if this is a technical question
      checkForTechnicalQuestion(latest.text);

      // Check if this is a closing sentence
      checkForCloseSentence(latest.text);
      
      // Add to chat history
      setChatHistory(prev => {
        const newHistory = [...prev];
        // Check if we're updating an existing message or adding a new one
        const existingMessageIndex = newHistory.findIndex(
          msg => msg.role === 'agent' && msg.id === latest.id
        );
        
        if (existingMessageIndex >= 0) {
          // Update existing message
          newHistory[existingMessageIndex] = {
            ...newHistory[existingMessageIndex],
            content: latest.text,
            timestamp: new Date().toISOString()
          };
        } else {
          // Add new message
          newHistory.push({
            id: latest.id,
            role: 'agent',
            content: latest.text,
            timestamp: new Date().toISOString()
          });
        }
        
        // Save updated history
        saveChatHistory(newHistory);
        return newHistory;
      });
    }
  }, [agentTranscriptions, latestAgentMessage]);

  // Handle user transcription updates
  useEffect(() => {
    if (!userTranscriptions || userTranscriptions.length === 0) return;
    
    // Process user messages similar to agent messages
    const userMessages = userTranscriptions.filter(t => t.text && t.text.trim() !== '');
    if (userMessages.length === 0) return;
    
    userMessages.forEach(message => {
      setChatHistory(prev => {
        const newHistory = [...prev];
        // Check if message already exists
        const existingMessageIndex = newHistory.findIndex(
          msg => msg.role === 'user' && msg.id === message.id
        );
        
        if (existingMessageIndex >= 0) {
          // Update existing message
          newHistory[existingMessageIndex] = {
            ...newHistory[existingMessageIndex],
            content: message.text,
            timestamp: new Date().toISOString()
          };
        } else {
          // Add new message
          newHistory.push({
            id: message.id,
            role: 'user',
            content: message.text,
            timestamp: new Date().toISOString()
          });
        }
        
        // Save updated history
        saveChatHistory(newHistory);
        return newHistory;
      });
    });
  }, [userTranscriptions]);

  // Style for visualizer
  const visualizerStyles = {
    "--lk-bar-visualizer-bar-color": "#3b82f6",
    "--lk-bar-visualizer-bar-width": "6px",
    "--lk-bar-visualizer-gap": "4px",
    "--lk-bar-visualizer-max-height": "40px",
  };

  return (
    <div className="flex flex-col max-w-xs mx-auto rounded-xl overflow-hidden shadow bg-gray-50">
      <div className="h-16 p-2 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center" style={visualizerStyles}>
          <BarVisualizer 
            state={state} 
            barCount={5} 
            trackRef={audioTrack} 
            className="w-full h-full" 
          />
        </div>
      </div>
      <div className="p-3 flex justify-center">
        <VoiceAssistantControlBar />
      </div>
      <div className="p-2 text-xs text-gray-500 border-t border-gray-200">
        Messages: {chatHistory.length}
      </div>
    </div>
  );
};

export default SimpleVoiceAssistant;