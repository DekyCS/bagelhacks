import * as React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import Experience from "@/components/Experience"
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"
import SimpleVoiceAssistant from "@/components/SimpleVoiceAssistant"
import AgentDock from "@/components/AgentDock"

export default function Interview() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [token, setToken] = useState(null);
    
    // Reference to LiveKit room for control
    const roomRef = useRef(null);
    
    // Hardcoded username
    const name = "user";
    
    // Listen for scene focus changes from ChatInterface
    useEffect(() => {
        const handleSceneFocusChange = (event) => {
            if (event.detail && event.detail.focus === 'model') {
                // Update Leva controls if they exist
                if (window.__leva && window.__leva.setValueAtPath) {
                    window.__leva.setValueAtPath('scene', 'Model Only');
                }
            }
        };
        
        window.addEventListener('sceneFocusChange', handleSceneFocusChange);
        return () => {
            window.removeEventListener('sceneFocusChange', handleSceneFocusChange);
        };
    }, []);
    
    // Function to get LiveKit token from API
    const getToken = useCallback(async () => {
        setIsConnecting(true);
        try {
            // API call to get token
            const response = await fetch(
                `/api/getToken?name=${encodeURIComponent(name)}`
            );
            
            // Parse the response as JSON
            const data = await response.json();
            
            // Extract the token from the response data
            const tokenValue = data.token;
            
            // Store token and update state to show LiveKit room
            setToken(tokenValue);
            setIsConnected(true);
            setIsConnecting(false);
        } catch (error) {
            console.error("Failed to get token:", error);
            setIsConnecting(false);
        }
    }, []);

    // Handle disconnect
    const handleDisconnect = () => {
        setIsConnected(false);
        setToken(null);
    };

    return (
        <div className="relative">
            {/* Main Experience component */}
            <main className="relative">
                <Experience />
                
                {/* MagicUI Dock with play button at the bottom center */}
                <AgentDock 
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                    onConnect={getToken}
                    onDisconnect={handleDisconnect}
                />
            </main>

            {/* LiveKit Room that runs in the background when connected */}
            {isConnected && token && (
                <div className="hidden">
                    <LiveKitRoom
                        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                        token={token}
                        connect={true}
                        video={false}
                        audio={true}
                        onDisconnected={handleDisconnect}
                        ref={roomRef}
                    >
                        <RoomAudioRenderer />
                        <SimpleVoiceAssistant />
                    </LiveKitRoom>
                </div>
            )}
        </div>
    )
}