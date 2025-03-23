import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import Interviewer from "./Interviewer";
import { useControls } from "leva";
import ChatInterface from "./ChatInterface"; // Import the new component

// Background component that uses an image
function Background({ url }) {
  const texture = useTexture(url);
  
  return (
    <mesh position={[0, 4, -20]}>
      <planeGeometry args={[80, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function Experience() {
  const [sceneFocus, setSceneFocus] = useState("model"); // "model" or "input"
  const [messageInput, setMessageInput] = useState("");
  const modelRef = useRef();
  
  // Animation state
  const [animation, setAnimation] = useState('Idle');
  
  // Model rotation state
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  
  // Add event listener for technical questions
  useEffect(() => {
    const handleOpenTextInput = (event) => {
      console.log("Received openTextInput event:", event.detail);
      setSceneFocus("input");
      
      // Also update the Leva controls to match the new state
      if (window.__leva && window.__leva.setValueAtPath) {
        window.__leva.setValueAtPath('scene', 'Text Input');
      }
    };
    
    window.addEventListener('openTextInput', handleOpenTextInput);
    
    return () => {
      window.removeEventListener('openTextInput', handleOpenTextInput);
    };
  }, []);
  
  // Animation dropdown and controls
  // const { scene, rotationX } = useControls({
  //   animation: {
  //     value: animation,
  //     options: ['Thinking', 'Greeting', 'Idle', 'Talking'],
  //     onChange: (value) => {
  //       setAnimation(value);
  //       // Dispatch animation update event for consistency
  //       window.dispatchEvent(new CustomEvent('animationUpdate', {
  //         detail: { animation: value }
  //       }));
  //     }
  //   },
  //   scene: {
  //     value: 'Model Only',
  //     options: ['Model Only', 'Text Input'],
  //     onChange: (value) => {
  //       setSceneFocus(value === 'Model Only' ? 'model' : 'input');
  //     }
  //   },
  //   rotationX: {
  //     value: 0.1,
  //     min: -0.5,
  //     max: 0.5,
  //     step: 0.01,
  //     onChange: (value) => {
  //       setModelRotation([value, modelRotation[1], modelRotation[2]]);
  //     }
  //   }
  // });
  
  // Background image URL - replace with your actual image path
  const backgroundImageUrl = "/bg.jpg"; // Your actual image path
  
  return (
    <div className="flex h-screen w-full">
      {/* 3D Canvas - Takes full screen in model mode, half screen in chat mode */}
      <div className={`transition-all duration-300 ${sceneFocus === "model" ? "w-full" : "w-1/2"}`}>
        <Canvas
          className="w-full h-full"
          camera={{
            position: [-0.5, 0, 5],
            fov: 45,
          }}
        >
          {/* Background image */}
          <Background url={backgroundImageUrl} />
          
          <Environment preset="sunset" />
          <ambientLight intensity={0.8} color="white" />
          
          {/* Fixed camera with disabled controls */}
          <OrbitControls
            enableZoom={false}
            enableRotate={false}
            enablePan={false}
          />
          
          {/* Model with rotation */}
          <Interviewer
            ref={modelRef}
            interviewer="girl"
            position={[-0.4, -2, 3]}
            scale={1.8}
            rotation={modelRotation}
            currentAnimation={animation}
          />
        </Canvas>
      </div>
      
      {/* 2D Chat Interface - Takes half the screen when visible */}
      {sceneFocus !== "model" && (
        <div className="w-1/2">
          <ChatInterface
            messageInput={messageInput}
            setMessageInput={setMessageInput}
          />
        </div>
      )}
    </div>
  );
}
export default Experience;