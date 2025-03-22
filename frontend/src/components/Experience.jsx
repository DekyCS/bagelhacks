import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, CameraControls } from "@react-three/drei";
import Interviewer from "./Interviewer";
import ChatInputPanel from "./ChatInputPanel"; 
import { useControls } from "leva";
import { Vector3 } from "three";

function Experience() {
  const [sceneFocus, setSceneFocus] = useState("model"); // "model" or "input"
  const [messageInput, setMessageInput] = useState("");
  const [modelRotation, setModelRotation] = useState([-Math.PI / -15, 0, 0]);
  
  // Update model rotation based on scene focus
  useEffect(() => {
    if (sceneFocus === "model") {
      // Default rotation when only model is shown
      setModelRotation([-Math.PI / -15, 0, 0]);
    } else {
      // Turn slightly towards left when both are shown
      setModelRotation([-Math.PI / -15, -Math.PI / 2, 0]); // Turn left instead of right
    }
  }, [sceneFocus]);
  
  // Animation state
  const [animation, setAnimation] = useState('Idle');
  
  // Animation dropdown
  const { scene } = useControls({
    animation: {
      value: animation,
      options: ['Thinking', 'Greeting', 'Idle', 'Talking'],
      onChange: (value) => {
        setAnimation(value);
        // Dispatch animation update event for consistency
        window.dispatchEvent(new CustomEvent('animationUpdate', { 
          detail: { animation: value } 
        }));
      }
    },
    scene: {
      value: 'Model Only',
      options: ['Model Only', 'Text Input'],
      onChange: (value) => {
        setSceneFocus(value === 'Model Only' ? 'model' : 'input');
      }
    }
  });

  return (
    <Canvas 
      style={{ height: "100vh" }} 
      camera={{
        position: [10, -10, 0],
        fov: 50,
      }}
    >
      <SceneManager sceneFocus={sceneFocus} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.8} color="white" /> 
      
      {/* Model on the left with dynamic rotation towards left */}
      <Interviewer 
        interviewer="girl" 
        position={[-1.04, -1.2, 3]}
        scale={1.2} 
        rotation={modelRotation} 
        currentAnimation={animation}
      />
      
      {/* Only show the ChatInputPanel when not in "model" focus mode */}
      {sceneFocus !== "model" && (
        <ChatInputPanel 
          sceneFocus={sceneFocus}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
        />
      )}
    </Canvas>
  );
}

// Camera manager component that handles camera transitions
const SceneManager = ({ sceneFocus }) => {
  const cameraControlsRef = useRef();
  
  // Define camera positions - adjusted for better framing
  const modelFocusPosition = new Vector3(-1, 0, 5); // Camera position when only showing model
  const inputFocusPosition = new Vector3(0, 0, 7); // Pulled back and centered when showing both
  
  useFrame(() => {
    if (cameraControlsRef.current) {
      if (sceneFocus === "model") {
        // When in model-only mode, focus directly on the model
        cameraControlsRef.current.setLookAt(
          modelFocusPosition.x, modelFocusPosition.y, modelFocusPosition.z,
          -1, 0, 0, // Look at model position
          true // Enable smooth transition
        );
      } else if (sceneFocus === "input") {
        // When showing both, pull back and position camera to see everything
        cameraControlsRef.current.setLookAt(
          inputFocusPosition.x, inputFocusPosition.y, inputFocusPosition.z,
          0.5, -0.6, 0, // Look at a point between model and input
          true 
        );
      }
    }
  });

  return (
    <CameraControls
      ref={cameraControlsRef}
      enableZoom={true}
      zoomSpeed={0.5}
      maxDistance={10}
      minDistance={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      smoothTime={0.5}
    />
  );
};

export default Experience;