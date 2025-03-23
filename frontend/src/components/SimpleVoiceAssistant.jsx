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

// Create a simple text-to-viseme mapping function that generates visemes with relative timings
const textToVisemes = (text) => {
  console.log("===== textToVisemes called with: =====", text);
  if (!text) {
    console.log("Empty text provided to textToVisemes");
    return [];
  }
  
  // Simple mapping of phonemes to viseme indices
  const phonemeToViseme = {
    'a': 10, // Open mouth
    'e': 11,
    'i': 12,
    'o': 13,
    'u': 14,
    'm': 15, // Closed mouth
    'b': 15,
    'p': 15,
    'f': 16,
    'v': 16,
    's': 11,
    'th': 17,
    'default': 0 // Neutral
  };
  
  const visemes = [];
  let timestamp = 0; // Start at 0 as we'll sync with audio timing
  
  // Calculate approximate duration based on characters
  // Average English speaking rate is ~150 words per minute or ~5 characters per second
  // So each character takes about 200ms on average
  const characterDuration = 150; // ms per character (slightly faster)
  
  // Split text into chunks/syllables for viseme generation
  const chunks = text.toLowerCase().split(/\s+|(?=[,.!?])/);
  console.log("Text split into chunks:", chunks);
  
  chunks.forEach((chunk, chunkIndex) => {    
    // For each chunk, generate visemes
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];
      
      // Find the appropriate viseme for this character
      let visemeIndex = phonemeToViseme.default;
      
      Object.keys(phonemeToViseme).forEach(phoneme => {
        if (phoneme.length === 1 && char === phoneme) {
          visemeIndex = phonemeToViseme[phoneme];
        } else if (phoneme.length > 1 && chunk.substring(i, i + phoneme.length) === phoneme) {
          visemeIndex = phonemeToViseme[phoneme];
        }
      });
      
      // Add the viseme with its timestamp
      visemes.push([timestamp, visemeIndex]);
      
      // Increment timestamp for next viseme
      timestamp += characterDuration; 
    }
    
    // Add a small pause between chunks (words)
    timestamp += 50;
    
    // Add neutral viseme at word boundaries
    visemes.push([timestamp, 0]);
    timestamp += 50;
  });
  
  // Add a final neutral viseme
  visemes.push([timestamp, 0]);
  
  console.log("Generated total visemes:", visemes.length);
  console.log("Total animation duration:", timestamp, "ms");
  
  return visemes;
};

// Helper function to save chat history to a file
const saveChatHistory = (chatHistory) => {
  try {
    // In a real implementation, you would use a server endpoint to write to a file
    // For now, we'll log to console and use localStorage as a demo
    console.log("Saving chat history:", chatHistory);
    localStorage.setItem('interviewChatHistory', JSON.stringify(chatHistory));
    
    // In a production environment, you would use something like:
    // fetch('/api/saveChatHistory', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(chatHistory),
    // });
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

  // State for messages
  const [messages, setMessages] = useState([]);
  const [latestAgentMessage, setLatestAgentMessage] = useState(null);
  
  // Ref to track when speech begins
  const speechStartTimeRef = useRef(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  
  // Function to create and dispatch a viseme event
  const dispatchVisemeEvent = (text, visemes) => {
    window.dispatchEvent(new CustomEvent('visemeUpdate', {
      detail: {
        visemes,
        text,
        speechStartTime: speechStartTimeRef.current || Date.now()
      }
    }));
  };

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

  // Handle state changes (speaking/not speaking)
  useEffect(() => {
    console.log("===== Voice Assistant State: ", state);
    
    if (state === 'speaking' || state === 'streaming') {
      // Record the timestamp when speech starts
      if (!speechStartTimeRef.current) {
        speechStartTimeRef.current = Date.now();
        console.log("Speech started at:", speechStartTimeRef.current);
      }
      
      // Always start talking animation
      window.dispatchEvent(new CustomEvent('animationUpdate', { 
        detail: { animation: 'Talking' } 
      }));
      
      // If we don't have any transcriptions yet, use dummy visemes
      if (!agentTranscriptions || agentTranscriptions.length === 0) {
        console.log("No transcription yet, using dummy visemes");
        const dummyVisemes = [];
        for (let i = 0; i < 50; i++) {
          dummyVisemes.push([i * 200, [10, 12, 14, 15, 0][i % 5]]);
        }
        dispatchVisemeEvent("Speaking...", dummyVisemes);
      }
    } else {
      // Reset speech start time when speech ends
      speechStartTimeRef.current = null;
      console.log("Speech ended, reset timing");
      
      // Return to idle
      window.dispatchEvent(new CustomEvent('animationUpdate', { 
        detail: { animation: 'Idle' } 
      }));
    }
  }, [state, agentTranscriptions]);

  // Handle agent transcription updates
  useEffect(() => {
    // Skip if there are no transcriptions
    if (!agentTranscriptions || agentTranscriptions.length === 0) return;
    
    console.log("===== Transcription update =====");
    console.log("Agent transcriptions:", agentTranscriptions);
    
    // Find the latest non-empty agent message
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
      
      // Generate visemes and dispatch event
      const visemes = textToVisemes(latest.text);
      dispatchVisemeEvent(latest.text, visemes);
      
      // Update the shared message store
      updateLatestAgentMessage(latest.text);
      
      // Check if this is a technical question
      checkForTechnicalQuestion(latest.text);
      
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
    
    console.log("===== User transcription update =====");
    console.log("User transcriptions:", userTranscriptions);
    
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
      {/* Debug section - can be removed in production */}
      <div className="p-2 text-xs text-gray-500 border-t border-gray-200">
        Messages: {chatHistory.length}
      </div>
    </div>
  );
};

export default SimpleVoiceAssistant;