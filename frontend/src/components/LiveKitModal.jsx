// Import necessary components and hooks
import { useState, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles"; // CSS styles for LiveKit components
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";

// Component definition with props
const LiveKitModal = ({ setShowSupport }) => {
  // Controls whether name form or LiveKit room is shown
  const [isSubmittingName, setIsSubmittingName] = useState(true);
  
  // Hardcoded username instead of using form input
  const name = "omar";
  
  // State to store the LiveKit authentication token
  const [token, setToken] = useState(null);

  // Function to get LiveKit token from API
  const getToken = useCallback(async (userName) => {
    try {
      console.log("run")
      // API call to get token using the p
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent(userName)}`
      );
      
      // Parse the response as JSON instead of text
      const data = await response.json();
      
      // Extract the token from the response data
      const tokenValue = data.token;
      
      // Store token and update state to show LiveKit room
      setToken(tokenValue);
      setIsSubmittingName(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  console.log(import.meta.env.VITE_LIVEKIT_URL);

  // Handle form submission
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      getToken(name);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="support-room">
          {isSubmittingName ? (
            // Initial view - form with connect/cancel buttons
            <form onSubmit={handleNameSubmit} className="name-form">
              <button type="submit">Connect</button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowSupport(false)} // Closes the modal
              >
                Cancel
              </button>
            </form>
          ) : token ? (
            // Connected view - LiveKit room
            <LiveKitRoom
              className="flex flex-row"
              serverUrl={import.meta.env.VITE_LIVEKIT_URL} // LiveKit server URL from environment
              token={token} // Authentication token
              connect={true} // Auto-connect when component mounts
              video={false} // Disable video
              audio={true} // Enable audio
              onDisconnected={() => {
                // Reset state when disconnected
                setShowSupport(false);
                setIsSubmittingName(true);
              }}
            >
              <RoomAudioRenderer /> {/* Handles audio rendering */}
              <SimpleVoiceAssistant /> {/* Your custom voice assistant component */}
            </LiveKitRoom>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LiveKitModal;