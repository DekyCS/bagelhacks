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

// Simple vowel visemes mapping - you'll need to replace these with 
// the actual morph target IDs that correspond to these vowel shapes
const VOWEL_VISEMES = {
  A: 1, // Replace with actual morph target ID for "A" shape
  E: 2, // Replace with actual morph target ID for "E" shape
  I: 3, // Replace with actual morph target ID for "I" shape
  O: 4, // Replace with actual morph target ID for "O" shape
  U: 5, // Replace with actual morph target ID for "U" shape
};

const Interviewer = ({ interviewer, currentAnimation = 'Thinking', ...props }) => {
  const group = useRef()
  const { scene } = useGLTF(`/models/Interview_${interviewer}.glb`)
  const [blink, setBlink] = useState(false) 
  
  // Add states for lip sync
  const [isAnimating, setIsAnimating] = useState(false);
  const [animation, setAnimation] = useState(currentAnimation);
  
  // Simple viseme cycle counter
  const visemeCycleRef = useRef(0);
  const lastVisemeChangeTime = useRef(0);
  const currentVisemeRef = useRef(null);

  // Listen for viseme updates from SimpleVoiceAssistant
  useEffect(() => {
    const handleVisemeUpdate = (event) => {
      const { text } = event.detail;
      
      console.log('===== INTERVIEWER: Received visemeUpdate event =====');
      console.log('Text:', text);
      
      // Start the talking animation
      setIsAnimating(true);
      
      // Set animation to talking
      setAnimation('Talking');
      
      console.log('Starting simple A E I O U viseme cycle');
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
      
      // Apply simple A E I O U viseme cycle if talking
      if (isAnimating && animation === 'Talking') {
        // Change viseme every 150ms for a natural speech rhythm
        const visemeChangeInterval = 150;
        if (now - lastVisemeChangeTime.current > visemeChangeInterval) {
          // Cycle through vowels: A -> E -> I -> O -> U -> A
          visemeCycleRef.current = (visemeCycleRef.current + 1) % 5;
          lastVisemeChangeTime.current = now;
          
          // Map cycle index to vowel
          const vowels = ['A', 'E', 'I', 'O', 'U'];
          const currentVowel = vowels[visemeCycleRef.current];
          currentVisemeRef.current = currentVowel;
          
          if (shouldLog) {
            console.log(`Current viseme: ${currentVowel}`);
          }
        }
        
        // Apply the current vowel viseme
        if (currentVisemeRef.current) {
          const visemeId = VOWEL_VISEMES[currentVisemeRef.current];
          lerpMorphTarget(visemeId, 1, 0.3);
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