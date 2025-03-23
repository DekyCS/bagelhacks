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

// Keeping your original viseme mapping, just making sure it works
const VOWEL_VISEMES = {
  'A': 1, // Replace with actual morph target ID for "A" shape
  'E': 2, // Replace with actual morph target ID for "E" shape
  'I': 3, // Replace with actual morph target ID for "I" shape
  'O': 4, // Replace with actual morph target ID for "O" shape
  'U': 5, // Replace with actual morph target ID for "U" shape
};

// Sequence of vowels to cycle through for speech
const VOWEL_SEQUENCE = ['A', 'E', 'I', 'O', 'U'];

const Interviewer = ({ interviewer, currentAnimation = 'Idle', ...props }) => {
  const group = useRef()
  const { scene } = useGLTF(`/models/Interview_${interviewer}.glb`)
  const [blink, setBlink] = useState(false) 
  
  // Lip sync states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animation, setAnimation] = useState(currentAnimation);
  
  // Viseme state
  const currentVowelIndex = useRef(0);
  const lastVisemeChangeTime = useRef(0);

  // Listen for viseme updates from SimpleVoiceAssistant
  useEffect(() => {
    const handleVisemeUpdate = (event) => {
      console.log('===== INTERVIEWER: Received visemeUpdate event =====');
      
      // Start the speaking state
      setIsSpeaking(true);
      
      console.log('Lip sync activated');
    };
    
    // Listen for animation updates
    const handleAnimationUpdate = (event) => {
      const { animation } = event.detail;
      console.log('===== INTERVIEWER: Received animationUpdate event =====');
      console.log('New animation:', animation);
      
      setAnimation(animation);
      
      // If switching to Idle, stop lip sync
      if (animation === 'Idle' && isSpeaking) {
        setIsSpeaking(false);
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
  }, [isSpeaking]);

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

  // Function to smoothly apply morph targets - keeping your original implementation
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
        // Log less frequently to reduce console spam
        if (frameCounter.current % 60 === 0) {
          console.log(`Animation: ${animation}, Speaking: ${isSpeaking}`);
        }
      }
      
      // Apply eye blinking using morph targets
      lerpMorphTarget("eye_close", blink ? 1 : 0, 0.5);
      
      // Reset all mouth morph targets before applying new ones
      for (let i = 0; i <= 21; i++) {
        lerpMorphTarget(i, 0, 0.1); // reset morph targets
      }
      
      // Apply lip sync if speaking
      if (isSpeaking) {
        // Change vowel every 100-200ms for natural rhythm
        const visemeChangeInterval = randInt(100, 200);
        if (now - lastVisemeChangeTime.current > visemeChangeInterval) {
          // Cycle through vowels: A -> E -> I -> O -> U -> A
          currentVowelIndex.current = (currentVowelIndex.current + 1) % VOWEL_SEQUENCE.length;
          lastVisemeChangeTime.current = now;
          
          // Occasional logging
          if (shouldLog && frameCounter.current % 120 === 0) {
            console.log(`Current vowel: ${VOWEL_SEQUENCE[currentVowelIndex.current]}`);
          }
        }
        
        // Apply current vowel's morph target
        const currentVowel = VOWEL_SEQUENCE[currentVowelIndex.current];
        const visemeTarget = VOWEL_VISEMES[currentVowel];
        if (visemeTarget !== undefined) {
          lerpMorphTarget(visemeTarget, 0.6, 0.3);
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
      // Reset all animations that are not the target animation
      Object.entries(actions).forEach(([name, action]) => {
        if (name !== animation) {
          // Fade out any playing animations that aren't the target
          if (action.isRunning) {
            action.fadeOut(0.3);
          }
        }
      });
      
      // After a short delay to allow fade out, play the new animation
      setTimeout(() => {
        if (actions[animation]) {
          actions[animation].reset().fadeIn(0.3).play();
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