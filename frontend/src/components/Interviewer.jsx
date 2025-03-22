import { useFBX, useGLTF, useAnimations } from '@react-three/drei'
import React, { useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

// Define the randInt function
const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

//load the model
const interviewers = ["girl"]

const Interviewer = ({ interviewer, currentAnimation = 'Thinking', ...props }) => {
  const group = useRef()
  const { scene } = useGLTF(`/models/Interview_${interviewer}.glb`)
  const [blink, setBlink] = useState(false) 
  
  // Add states for lip sync
  const [currentVisemes, setCurrentVisemes] = useState([]);
  const [speechStartTime, setSpeechStartTime] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentVisemeIndex, setCurrentVisemeIndex] = useState(0);
  const [animation, setAnimation] = useState(currentAnimation);
  
  // Add ref for continuous animation
  const activeVisemeRef = useRef(0);
  const blendingFactorRef = useRef(0);
  const prevVisemeRef = useRef(0);

  // Listen for viseme updates from SimpleVoiceAssistant
  useEffect(() => {
    const handleVisemeUpdate = (event) => {
      const { visemes, text, speechStartTime: startTime } = event.detail;
      
      console.log('===== INTERVIEWER: Received visemeUpdate event =====');
      console.log('Text:', text);
      console.log('Viseme count:', visemes?.length || 0);
      
      if (!visemes || visemes.length === 0) {
        console.error('No visemes received or empty viseme array');
        return;
      }
      
      // Use the speech start time provided by SimpleVoiceAssistant
      // This ensures our animation is synchronized with the actual audio
      setSpeechStartTime(startTime);
      setCurrentVisemes(visemes);
      setCurrentVisemeIndex(0);
      setIsAnimating(true);
      
      // Reset viseme blending
      activeVisemeRef.current = 0;
      blendingFactorRef.current = 0;
      prevVisemeRef.current = 0;
      
      // Set animation to talking
      setAnimation('Talking');
      
      console.log('Speech start time:', startTime);
      console.log('Animation synchronized to speech');
    };
    
    // Listen for animation updates
    const handleAnimationUpdate = (event) => {
      const { animation } = event.detail;
      console.log('===== INTERVIEWER: Received animationUpdate event =====');
      console.log('New animation:', animation);
      setAnimation(animation);
      
      // If switching to idle, stop lip sync animation
      if (animation === 'Idle' && isAnimating) {
        setIsAnimating(false);
      }
    };
    
    // Add event listeners
    window.addEventListener('visemeUpdate', handleVisemeUpdate);
    window.addEventListener('animationUpdate', handleAnimationUpdate);
    
    console.log('===== INTERVIEWER: Event listeners registered =====');
    
    return () => {
      window.removeEventListener('visemeUpdate', handleVisemeUpdate);
      window.removeEventListener('animationUpdate', handleAnimationUpdate);
    };
  }, [isAnimating]);

  // Blinking animation
  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 100);
      }, randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []); 

  // Function to smoothly apply morph targets
  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  // Load all animations
  const { animations: greetingAnimations } = useFBX(`/animations/bow.fbx`)
  const { animations: idleAnimations } = useFBX(`/animations/StandingIdle.fbx`)
  const { animations: thinkingAnimations } = useFBX(`/animations/Thinking.fbx`)
  const { animations: talkingAnimations } = useFBX(`/animations/Talking.fbx`)

  // Rename animations
  greetingAnimations[0].name = "Greeting"
  idleAnimations[0].name = "Idle"
  thinkingAnimations[0].name = "Thinking"
  talkingAnimations[0].name = "Talking"
  
  // Combine all animations into one array
  const [allAnimations, setAllAnimations] = useState([])
  
  // Initial rotation state and target
  const [rotationY, setRotationY] = useState(0)
  const targetRotationY = useRef(0)
  
  // Frame counter for less frequent logging
  const frameCounter = useRef(0);
  const lastLogTime = useRef(0);
  
  // Handle rotation, lip sync, and eye blinking in the frame loop
  useFrame(() => {
    if (group.current) {
      frameCounter.current++;
      const now = Date.now();
      const shouldLog = now - lastLogTime.current > 1000; // Log at most once per second
      
      if (shouldLog) {
        lastLogTime.current = now;
        console.log(`Animation active: ${isAnimating}, Frame: ${frameCounter.current}`);
      }
      
      // If talking, gradually rotate to the left
      if (animation === 'Talking') {
        targetRotationY.current = -0.2; // Less extreme rotation
      } else {
        // Otherwise, return to neutral position
        targetRotationY.current = 0;
      }
      
      // Smooth interpolation for rotation
      setRotationY(prev => prev + (targetRotationY.current - prev) * 0.05);
      
      // Apply rotation
      group.current.rotation.y = rotationY;
      
      // Apply eye blinking using morph targets
      lerpMorphTarget("eye_close", blink ? 1 : 0, 0.5);
      
      // Reset all mouth morph targets before applying new ones
      for (let i = 0; i <= 21; i++) {
        lerpMorphTarget(i, 0, 0.1); // reset morph targets
      }
      
      // Apply lip sync if we're currently animating visemes
      if (isAnimating && currentVisemes.length > 0 && speechStartTime) {
        // Calculate time elapsed since speech started
        const elapsed = now - speechStartTime;
        
        if (shouldLog) {
          console.log(`Speech elapsed: ${elapsed}ms, Visemes: ${currentVisemes.length}`);
        }
        
        // Find the correct viseme for the current time
        let activeVisemeIndex = 0;
        let nextVisemeIndex = 0;
        let blendFactor = 0;
        
        // Find current and next viseme based on elapsed time
        for (let i = 0; i < currentVisemes.length; i++) {
          if (currentVisemes[i][0] <= elapsed) {
            activeVisemeIndex = i;
          } else {
            nextVisemeIndex = i;
            break;
          }
        }
        
        // Calculate blend factor between current and next viseme
        if (nextVisemeIndex < currentVisemes.length) {
          const currentTime = currentVisemes[activeVisemeIndex][0];
          const nextTime = currentVisemes[nextVisemeIndex][0];
          const timeDiff = nextTime - currentTime;
          
          if (timeDiff > 0) {
            blendFactor = (elapsed - currentTime) / timeDiff;
            blendFactor = Math.max(0, Math.min(1, blendFactor)); // Clamp between 0 and 1
          }
        }
        
        // Store values in refs for stability
        activeVisemeRef.current = activeVisemeIndex;
        blendingFactorRef.current = blendFactor;
        
        // Get current and next viseme values
        const currentVisemeValue = currentVisemes[activeVisemeIndex][1];
        const nextVisemeValue = nextVisemeIndex < currentVisemes.length ? 
                               currentVisemes[nextVisemeIndex][1] : 0;
        
        if (shouldLog) {
          console.log(`Active viseme: ${activeVisemeIndex} (${currentVisemeValue}), Next: ${nextVisemeIndex} (${nextVisemeValue}), Blend: ${blendFactor.toFixed(2)}`);
        }
        
        // Apply current viseme with full strength
        lerpMorphTarget(currentVisemeValue, 1, 0.3);
        
        // If we're close to the next viseme, start blending it in
        if (blendFactor > 0.5 && nextVisemeIndex < currentVisemes.length) {
          lerpMorphTarget(nextVisemeValue, blendFactor, 0.3);
        }
        
        // Check if we've reached the end of all visemes with some buffer
        const lastVisemeTime = currentVisemes[currentVisemes.length - 1][0];
        if (elapsed > lastVisemeTime + 500) {
          if (shouldLog) {
            console.log('Animation complete - elapsed time exceeds last viseme');
          }
          // Don't automatically end animation - let the speech state control it
        }
      }
    }
  });
  
  useEffect(() => {
    // Combine animations from all sources
    const combinedAnimations = [
      ...greetingAnimations,
      ...idleAnimations,
      ...thinkingAnimations,
      ...talkingAnimations
    ];
    setAllAnimations(combinedAnimations);
  }, []);
  
  // Use the combined animations
  const { actions, names } = useAnimations(allAnimations, group);
  
  // Play the selected animation when it changes
  useEffect(() => {
    if (actions) {
      // Identify the current animation name
      const animationName = animation === 'Idle' ? 'Idle' : 
                           animation === 'Greeting' ? 'Greeting' : 
                           animation === 'Talking' ? 'Talking' : 'Thinking';
      
      // Reset all animations that are not the target animation
      Object.entries(actions).forEach(([name, action]) => {
        if (name !== animationName) {
          // Fade out any playing animations that aren't the target
          if (action.isRunning) {
            action.fadeOut(0.3);
          }
        }
      });
      
      // After a short delay to allow fade out, play the new animation
      setTimeout(() => {
        if (actions[animationName]) {
          actions[animationName].reset().fadeIn(0.3).play();
        }
      }, 20); // Small delay to prevent overlap
    }
  }, [animation, actions]);

  return (
    <group {...props} ref={group}> 
      <primitive object={scene} />
    </group>
  );
};

export default Interviewer;

interviewers.forEach(interviewer => {
  useGLTF.preload(`/models/Interview_${interviewer}.glb`);
});