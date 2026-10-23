import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound } from '../utils/soundEffects';

// Modular angular damping function to prevent 360-degree wrap-around spin
function dampAngle(current, target, smoothing, delta) {
  let diff = (target - current) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  return current + diff * (1 - Math.exp(-smoothing * delta));
}

// Check whether an animation track corresponds to arm, shoulder, or hand bones
function isUpperArmTrack(trackName) {
  const n = trackName.toLowerCase();
  return (
    n.includes('arm') ||
    n.includes('hand') ||
    n.includes('shoulder') ||
    n.includes('forearm') ||
    n.includes('finger') ||
    n.includes('thumb') ||
    n.includes('index') ||
    n.includes('middle') ||
    n.includes('ring') ||
    n.includes('pinky')
  );
}

export default function Character({
  modelUrl = (process.env.PUBLIC_URL || '') + '/my-meshy-model.glb',
  cameraFollow = true,
  lockArms = true,
  controlMode = 'gta',
  onTelemetryChange,
}) {
  const root = useRef();
  const modelRoot = useRef();
  const { scene, animations } = useGLTF(modelUrl);

  // GTA Camera and Character Orientations
  // charYaw: character body rotation (starts facing forward at Math.PI = 180° towards user/camera as in Image 1)
  // camYaw: camera orbital horizontal azimuth (starts at Math.PI = 180° looking into command deck from front)
  // camPitch: camera vertical angle (starts at 0.14 slightly elevated hero view)
  const charYaw = useRef(Math.PI); // Starts facing forward towards the user (Image 1)
  const camYaw = useRef(Math.PI);  // Starts at front hero angle framing character and screens (Image 1)
  const camPitch = useRef(0.14);   // Slightly elevated view showing full character and ceiling above
  const camDistance = useRef(5.2); // Wide panoramic view matching Image 1
  const hasUserMoved = useRef(false);
  const isPointerLocked = useRef(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastMouseTime = useRef(0);

  // Procedural leg-walk shader uniforms (used when model has no skeleton, e.g. unrigged Meshy scan)
  const proceduralUniforms = useRef({
    uWalkPhase: { value: 0 },
    uWalkIntensity: { value: 0 },
    uStandAtEase: { value: 0 },
  });
  const walkPhase = useRef(0);
  const hasWalked = useRef(false);
  const footstepRingRef = useRef();

  // Hologram Materialization State & Uniforms (Sci-Fi Red Creation Beam)
  const holoUniforms = useRef({
    uHoloProgress: { value: 0.0 },
    uHoloTime: { value: 0.0 },
    uHoloActive: { value: 1.0 },
    uHoloColor: { value: new THREE.Color('#FF1E27') },
  });
  const holoTimeElapsed = useRef(0.0);
  const isHoloComplete = useRef(false);
  const [holoProgress, setHoloProgress] = useState(0.0);
  const [isHoloActive, setIsHoloActive] = useState(true);

  const triggerHologram = (playSound = true) => {
    isHoloComplete.current = false;
    holoTimeElapsed.current = 0.0;
    holoUniforms.current.uHoloProgress.value = 0.0;
    holoUniforms.current.uHoloActive.value = 1.0;
    setIsHoloActive(true);
    setHoloProgress(0.0);
    if (playSound) {
      playClickSound('hologram');
    }
  };

  useEffect(() => {
    triggerHologram(true);
  }, [modelUrl]);

  useEffect(() => {
    const handleHoloRescan = () => triggerHologram(true);
    window.addEventListener('charan-hologram-rescan', handleHoloRescan);
    return () => window.removeEventListener('charan-hologram-rescan', handleHoloRescan);
  }, []);

  // Stop / Brake & Stuck-Key Prevention
  const isBraked = useRef(false);
  const nativeKeys = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
    stop: false,
  });

  // Global window listeners for instant Stop / Brake (Space), Hologram Replay (R), and clearing stuck keys on blur
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyR') {
        triggerHologram(true);
      } else if (e.code === 'Space' || e.code === 'KeyX') {
        e.preventDefault();
        isBraked.current = true;
        nativeKeys.current.stop = true;
        nativeKeys.current.forward = false;
        nativeKeys.current.back = false;
        nativeKeys.current.left = false;
        nativeKeys.current.right = false;
        playClickSound('brake');
        // Instantly halt procedural walk motion
        proceduralUniforms.current.uWalkIntensity.value = 0;
        if (hasWalked.current) {
          proceduralUniforms.current.uStandAtEase.value = 1.0;
        }
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        isBraked.current = false;
        nativeKeys.current.forward = true;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        isBraked.current = false;
        nativeKeys.current.back = true;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        nativeKeys.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        nativeKeys.current.right = true;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        nativeKeys.current.run = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        nativeKeys.current.forward = false;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        nativeKeys.current.back = false;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        nativeKeys.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        nativeKeys.current.right = false;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        nativeKeys.current.run = false;
      } else if (e.code === 'Space' || e.code === 'KeyX') {
        nativeKeys.current.stop = false;
      }
    };

    const handleBlur = () => {
      // Clear all stuck movement keys when window loses focus
      isBraked.current = true;
      nativeKeys.current = { forward: false, back: false, left: false, right: false, run: false, stop: false };
    };

    const handleCustomStop = () => {
      isBraked.current = true;
      nativeKeys.current.forward = false;
      nativeKeys.current.back = false;
      nativeKeys.current.left = false;
      nativeKeys.current.right = false;
      nativeKeys.current.stop = true;
      playClickSound('brake');
      proceduralUniforms.current.uWalkIntensity.value = 0;
      if (hasWalked.current) {
        proceduralUniforms.current.uStandAtEase.value = 1.0;
      }
    };

    const handleMaterialize = () => {
      triggerHologram(true);
    };

    const handleCharacterKeyEvent = (e) => {
      const { action, active } = e.detail || {};
      if (!action) return;
      if (action === 'forward') {
        isBraked.current = false;
        nativeKeys.current.forward = !!active;
      } else if (action === 'back') {
        isBraked.current = false;
        nativeKeys.current.back = !!active;
      } else if (action === 'left') {
        nativeKeys.current.left = !!active;
      } else if (action === 'right') {
        nativeKeys.current.right = !!active;
      } else if (action === 'run') {
        nativeKeys.current.run = !!active;
      } else if (action === 'stop') {
        if (active) {
          handleCustomStop();
        } else {
          nativeKeys.current.stop = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('character-stop', handleCustomStop);
    window.addEventListener('character-materialize', handleMaterialize);
    window.addEventListener('character-key-event', handleCharacterKeyEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('character-stop', handleCustomStop);
      window.removeEventListener('character-materialize', handleMaterialize);
      window.removeEventListener('character-key-event', handleCharacterKeyEvent);
    };
  }, []);

  // 1. ANIMATION SANITIZATION & STEADY HAND LOCK
  // Locks forward root translation drift while keeping natural Y hip bounce.
  // When lockArms is true, locks arms & hands to steady resting pose from Idle.
  const sanitizedAnimations = useMemo(() => {
    if (!animations || animations.length === 0) return [];

    // Find Idle clip to extract natural resting arm pose
    const idleClip =
      animations.find((c) => c.name.toLowerCase().includes('idle')) ||
      animations[0];

    const idleTrackMap = new Map();
    if (idleClip) {
      idleClip.tracks.forEach((track) => {
        idleTrackMap.set(track.name, track);
      });
    }

    return animations.map((clip) => {
      const cloned = clip.clone();
      cloned.tracks = cloned.tracks.map((track) => {
        // A. Root motion locking on Hips/Root translation (in-place walk/run)
        if (
          track.name.endsWith('.position') &&
          (track.name.toLowerCase().includes('hip') ||
            track.name.toLowerCase().includes('root'))
        ) {
          const newValues = new Float32Array(track.values.length);
          const startX = track.values[0];
          const startZ = track.values[2];
          for (let i = 0; i < track.values.length; i += 3) {
            newValues[i] = startX; // Lock X drift
            newValues[i + 1] = track.values[i + 1]; // Keep natural Y bounce
            newValues[i + 2] = startZ; // Lock forward Z drift
          }
          return new THREE.VectorKeyframeTrack(track.name, track.times, newValues);
        }

        // B. Steady hands & arms (user requested: legs walk, hands don't move)
        if (lockArms && isUpperArmTrack(track.name)) {
          const idleTrack = idleTrackMap.get(track.name);
          const sourceValues = idleTrack ? idleTrack.values : track.values;
          const stride = track.getValueSize();
          const restValue = sourceValues.slice(0, stride);

          const newValues = new Float32Array(track.values.length);
          for (let i = 0; i < newValues.length; i += stride) {
            for (let j = 0; j < stride; j++) {
              newValues[i + j] = restValue[j];
            }
          }

          if (track instanceof THREE.QuaternionKeyframeTrack) {
            return new THREE.QuaternionKeyframeTrack(track.name, track.times, newValues);
          } else {
            return new THREE.VectorKeyframeTrack(track.name, track.times, newValues);
          }
        }

        return track;
      });

      return cloned;
    });
  }, [animations, lockArms]);

  // Bind animation mixer directly to scene where the bones and skinned mesh reside
  const { actions, names } = useAnimations(sanitizedAnimations, scene);
  const [, getKeys] = useKeyboardControls();

  // Robust animation clip detection
  const clips = useMemo(() => {
    if (!names || names.length === 0) return null;

    const findMatch = (terms, excludeTerms = []) => {
      return names.find((rawName) => {
        const n = rawName.toLowerCase();
        const matches = terms.some((t) => n.includes(t.toLowerCase()));
        const excluded = excludeTerms.some((e) => n.includes(e.toLowerCase()));
        return matches && !excluded;
      });
    };

    let idle = findMatch(['idle', 'stand', 'breathe', 'rest', 'pose'], ['tpose']);
    let walk = findMatch(['walk', 'strut', 'march', 'trot']);
    let run = findMatch(['run', 'sprint', 'jog', 'dash']);

    // Fallbacks if clip names are generic
    if (!walk && names.length > 0) {
      if (names.length === 1) {
        walk = names[0];
      } else if (names.length >= 2) {
        idle = idle || names[0];
        walk = names[1];
        if (names.length >= 3) {
          run = names[2];
        }
      }
    }

    return { idle, walk, run };
  }, [names]);

  // Dynamic ground offset ensuring feet touch Y=0 for any model
  const groundOffset = useMemo(() => {
    if (!scene) return 0;
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    return box.min.y < -0.02 ? -box.min.y : 0;
  }, [scene]);

  const activeClipName = useRef(null);
  const currentAction = useRef(null);
  const hasSkeletalAnimations = !!(clips && (clips.walk || clips.run || clips.idle));

  // 2. PROCEDURAL LEG-LOCOMOTION SHADER (FOR UNRIGGED MESHES)
  // Articulates left and right legs with calibrated symmetric stride from gravity vertical,
  // compensating for any rest-pose scan tilt so left leg reaches fully forward matching right leg!
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
            // Keep clothing and skin natural, matte, organic and non-metallic (real cloth & skin)
            child.material.metalness = 0.0;
            child.material.roughness = Math.max(child.material.roughness !== undefined ? child.material.roughness : 0.9, 0.88);
            child.material.envMapIntensity = 0.15;
          }
        }

        if (!hasSkeletalAnimations && child.material) {
          const mat = child.material.clone ? child.material.clone() : child.material;
          mat.transparent = true;
          mat.depthWrite = true;
          mat.onBeforeCompile = (shader) => {
            shader.uniforms.uWalkPhase = proceduralUniforms.current.uWalkPhase;
            shader.uniforms.uWalkIntensity = proceduralUniforms.current.uWalkIntensity;
            shader.uniforms.uStandAtEase = proceduralUniforms.current.uStandAtEase;
            shader.uniforms.uHoloProgress = holoUniforms.current.uHoloProgress;
            shader.uniforms.uHoloTime = holoUniforms.current.uHoloTime;
            shader.uniforms.uHoloActive = holoUniforms.current.uHoloActive;
            shader.uniforms.uHoloColor = holoUniforms.current.uHoloColor;

            shader.vertexShader = `
              uniform float uWalkPhase;
              uniform float uWalkIntensity;
              uniform float uStandAtEase;
              uniform float uHoloProgress;
              uniform float uHoloTime;
              uniform float uHoloActive;
              varying vec3 vHoloPos;
              varying vec3 vHoloNormal;
              ${shader.vertexShader}
            `;

            // Articulate legs (Y < -0.05) with Stand At Ease ground planting, symmetrical walk kinematics & Hologram Jitter
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
              #include <begin_vertex>

              vHoloPos = position;
              vHoloNormal = normal;

              // Digital assembly vibration / jitter right at the holographic scan slice (Images 2 & 3)
              if (uHoloActive > 0.01) {
                float scanY = mix(-1.05, 1.05, uHoloProgress);
                float distToScan = abs(position.y - scanY);
                if (distToScan < 0.12 && uHoloProgress < 0.98) {
                  float jitterFactor = (1.0 - distToScan / 0.12);
                  float jitter = sin(uHoloTime * 48.0 + position.y * 90.0) * cos(position.x * 70.0);
                  transformed += normal * jitter * jitterFactor * 0.022;
                }
              }

              // 1. STAND AT EASE BASELINE POSTURE
              // When the model stops walking after having walked, blend into Stand At Ease:
              // bringing the left leg forward and lowering the left heel flat on the land/floor.
              if (uStandAtEase > 0.001) {
                if (transformed.y < -0.16) {
                  float legFactor = smoothstep(-0.16, -0.45, transformed.y);
                  float legSeparation = smoothstep(0.016, 0.045, abs(transformed.x));
                  float legWeight = legFactor * legSeparation;
                  
                  // Left Leg (X > 0.015): bring forward level with right leg & plant left heel on ground
                  if (transformed.x > 0.015) {
                    float easeShiftZ = 0.13 * legWeight * uStandAtEase;
                    transformed.z += easeShiftZ;
                    
                    // Lower the elevated heel down to ground level
                    float footFactor = clamp((-transformed.y - 0.72) / 0.20, 0.0, 1.0);
                    float heelDist = max(0.0, -(transformed.z - easeShiftZ)) / 0.18;
                    float easeLowerY = clamp(heelDist, 0.0, 1.0) * 0.024 * footFactor * legSeparation * uStandAtEase;
                    transformed.y -= easeLowerY;
                  }
                  // Right Leg (X < -0.015): align slightly with hip line for perfect symmetry
                  else if (transformed.x < -0.015) {
                    float easeShiftZ = -0.018 * legWeight * uStandAtEase;
                    transformed.z += easeShiftZ;
                  }
                }
              }

              // 2. ACTIVE WALKING / RUNNING STRIDE LOCOMOTION
              // Minimal angle realistic stride: subtle, elegant leg movement with zero crotch/inseam mesh tearing
              if (uWalkIntensity > 0.005) {
                if (transformed.y < -0.16) {
                  float legHeightFactor = smoothstep(-0.16, -0.45, transformed.y);
                  float legSeparation = smoothstep(0.016, 0.048, abs(transformed.x));
                  float legWeight = legHeightFactor * legSeparation;

                  float hipY = -0.18;
                  float hipZ = 0.02;
                  // Minimal, realistic walk stride angle (approx 9.5 degrees = 0.165 rad)
                  float strideAngle = 0.165 * uWalkIntensity;
                  
                  // Left Leg (X > 0.015)
                  if (transformed.x > 0.015) {
                    float phi = uWalkPhase;
                    float swing = sin(phi) * strideAngle * legWeight;
                    float forwardSwing = max(0.0, sin(phi));
                    float kneeBend = (transformed.y < -0.48) ? forwardSwing * 0.12 * uWalkIntensity * legWeight : 0.0;
                    float footLift = forwardSwing * 0.016 * uWalkIntensity * legWeight;
                    
                    float yRel = transformed.y - hipY;
                    float zRel = transformed.z - hipZ;
                    
                    float yBent = yRel;
                    float zBent = zRel;
                    if (transformed.y < -0.48) {
                      float yKnee = transformed.y + 0.48;
                      yBent = -0.48 + (yKnee * cos(kneeBend) + zRel * sin(kneeBend));
                      zBent = (-yKnee * sin(kneeBend) + zRel * cos(kneeBend));
                    }
                    
                    transformed.y = hipY + (yBent * cos(swing) + zBent * sin(swing)) + footLift;
                    transformed.z = hipZ + (-yBent * sin(swing) + zBent * cos(swing));
                  }
                  // Right Leg (X < -0.015) - exactly opposite stride phase (uWalkPhase + PI)
                  else if (transformed.x < -0.015) {
                    float phi = uWalkPhase + 3.14159265;
                    float swing = sin(phi) * strideAngle * legWeight;
                    float forwardSwing = max(0.0, sin(phi));
                    float kneeBend = (transformed.y < -0.48) ? forwardSwing * 0.12 * uWalkIntensity * legWeight : 0.0;
                    float footLift = forwardSwing * 0.016 * uWalkIntensity * legWeight;
                    
                    float yRel = transformed.y - hipY;
                    float zRel = transformed.z - hipZ;
                    
                    float yBent = yRel;
                    float zBent = zRel;
                    if (transformed.y < -0.48) {
                      float yKnee = transformed.y + 0.48;
                      yBent = -0.48 + (yKnee * cos(kneeBend) + zRel * sin(kneeBend));
                      zBent = (-yKnee * sin(kneeBend) + zRel * cos(kneeBend));
                    }
                    
                    transformed.y = hipY + (yBent * cos(swing) + zBent * sin(swing)) + footLift;
                    transformed.z = hipZ + (-yBent * sin(swing) + zBent * cos(swing));
                  }
                } else {
                  // Upper body / hips: subtle natural walking bounce (arms & hands stay steady!)
                  transformed.y += abs(cos(uWalkPhase)) * 0.010 * uWalkIntensity;
                }
              }
              `
            );

            // Fragment Shader: Holographic Materialization Overlay
            shader.fragmentShader = `
              uniform float uHoloProgress;
              uniform float uHoloTime;
              uniform float uHoloActive;
              uniform vec3 uHoloColor;
              varying vec3 vHoloPos;
              varying vec3 vHoloNormal;
              ${shader.fragmentShader}
            `;

            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              `
              #include <dithering_fragment>

              if (uHoloActive > 0.001) {
                float scanY = mix(-1.08, 1.08, uHoloProgress);
                float distToBeam = vHoloPos.y - scanY;

                // 1. Intense Glowing Red & White Laser Scanline Slice (Images 1 & 4)
                float beamCore = exp(-distToBeam * distToBeam * 550.0);
                float beamGlow = exp(-distToBeam * distToBeam * 45.0);
                vec3 beamColor = mix(uHoloColor, vec3(1.0, 0.75, 0.8), beamCore * 0.9) * (beamCore * 3.2 + beamGlow * 1.8);

                // 2. Hologram 3D Wireframe Grid (Images 1 & 4)
                vec3 gridCoord = vHoloPos * vec3(28.0, 44.0, 28.0);
                vec3 gridFract = abs(fract(gridCoord) - 0.5);
                float gridLine = smoothstep(0.42, 0.49, max(gridFract.x, max(gridFract.y, gridFract.z)));

                // 3. Horizontal CRT Scanlines & Digital Flicker
                float scanlines = sin((vHoloPos.y * 110.0) - (uHoloTime * 10.0)) * 0.5 + 0.5;
                float flicker = 0.86 + 0.14 * sin(uHoloTime * 65.0);

                // 4. Fresnel Holographic Edge Glow (Rim Light)
                vec3 vDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vDir)), 2.2);

                // Composite Holographic Color
                vec3 holoColor = uHoloColor * (0.35 + 0.65 * gridLine + 0.4 * scanlines + 1.4 * fresnel) * flicker;

                // State 1: Above Scanline (Pre-materialized Hologram)
                if (distToBeam > 0.0) {
                  gl_FragColor.rgb = holoColor + beamColor;
                  gl_FragColor.a = 0.80 + 0.20 * gridLine;
                }
                // State 2: Below Scanline (Materialized Solid Character with trailing ripple)
                else {
                  float trail = exp(-(-distToBeam) * 7.5);
                  vec3 materialized = gl_FragColor.rgb;
                  vec3 blended = mix(materialized, materialized + holoColor * 0.7, trail);
                  gl_FragColor.rgb = blended + beamColor;
                  gl_FragColor.a = 1.0;
                }

                // Final materialization flash when completing (progress 0.92 -> 1.0)
                if (uHoloProgress > 0.92) {
                  float flash = (1.0 - uHoloProgress) / 0.08;
                  gl_FragColor.rgb += uHoloColor * flash * 0.45;
                }
              }
              `
            );
          };
          mat.needsUpdate = true;
          child.material = mat;
        }
      }
    });
  }, [scene, hasSkeletalAnimations]);

  // 3. MOUSE VIEW CONTROLS (GTA THIRD-PERSON ORBITAL CAMERA)
  // Mouse rotates the camera view freely around the player without rotating the player.
  useEffect(() => {
    const onPointerDown = (e) => {
      // Don't drag orbit if interacting with button, link, input, or modal element
      if (
        e.target &&
        (e.target.closest('button') ||
          e.target.closest('a') ||
          e.target.closest('input') ||
          e.target.closest('select') ||
          e.target.closest('[role="button"]'))
      ) {
        return;
      }
      lastMouseTime.current = performance.now();
      // Left or right click starts drag orbit
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        hasUserMoved.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e) => {
      if (document.pointerLockElement) {
        lastMouseTime.current = performance.now();
        // Pointer locked (GTA full PC game mode)
        const sensitivity = 0.0028;
        camYaw.current -= e.movementX * sensitivity;
        camPitch.current = Math.max(
          -0.2,
          Math.min(1.25, camPitch.current + e.movementY * sensitivity)
        );
      } else if (isDragging.current) {
        lastMouseTime.current = performance.now();
        // Drag to rotate view
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        dragStart.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.0045;
        camYaw.current -= deltaX * sensitivity;
        camPitch.current = Math.max(
          -0.2,
          Math.min(1.25, camPitch.current + deltaY * sensitivity)
        );
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
      lastMouseTime.current = performance.now();
    };

    const onWheel = (e) => {
      // Don't intercept scroll if inside a scrollable modal container
      if (e.target && (e.target.closest('input') || e.target.closest('select'))) return;
      lastMouseTime.current = performance.now();
      // Zoom in and out with mouse wheel
      camDistance.current = Math.max(
        2.0,
        Math.min(9.0, camDistance.current + e.deltaY * 0.004)
      );
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = !!document.pointerLockElement;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, []);

  // Initial animation setup
  useEffect(() => {
    if (!hasSkeletalAnimations || !actions) return;

    const initialClipName = clips.idle || clips.walk || names[0];
    if (initialClipName && actions[initialClipName]) {
      const action = actions[initialClipName];
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.fadeIn(0.25).play();
      currentAction.current = action;
      activeClipName.current = initialClipName;
    }

    return () => {
      Object.values(actions).forEach((action) => {
        if (action) action.stop();
      });
      currentAction.current = null;
      activeClipName.current = null;
    };
  }, [actions, clips, hasSkeletalAnimations, names]);

  // 4. MAIN FRAME LOOP: GTA CONTROLS, ANIMATIONS, & CAMERA
  useFrame((state, delta) => {
    if (!root.current) return;

    // Progress Holographic Materialization Animation
    if (!isHoloComplete.current) {
      holoTimeElapsed.current += delta;
      const duration = 3.2; // 3.2s materialization sequence
      const prog = Math.min(1.0, holoTimeElapsed.current / duration);
      holoUniforms.current.uHoloProgress.value = prog;
      holoUniforms.current.uHoloTime.value = state.clock.getElapsedTime();
      setHoloProgress(prog);

      if (prog >= 1.0) {
        isHoloComplete.current = true;
        holoUniforms.current.uHoloActive.value = 0.0;
        setIsHoloActive(false);
      }
    }

    const dreiKeys = getKeys();
    const isStopKeyActive = !!(dreiKeys.stop || nativeKeys.current.stop);

    // If stop key is pressed or brake triggered, enforce brake
    if (isStopKeyActive) {
      isBraked.current = true;
    }

    // Determine raw intentions
    const rawForward = !!(dreiKeys.forward || nativeKeys.current.forward);
    const rawBack = !!(dreiKeys.back || nativeKeys.current.back);
    const rawLeft = !!(dreiKeys.left || nativeKeys.current.left);
    const rawRight = !!(dreiKeys.right || nativeKeys.current.right);
    const rawRun = !!(dreiKeys.run || nativeKeys.current.run);

    // Fast-forward hologram completion if user starts moving so controls are immediately responsive
    if (!isHoloComplete.current && (rawForward || rawBack || rawLeft || rawRight)) {
      isHoloComplete.current = true;
      holoUniforms.current.uHoloProgress.value = 1.0;
      holoUniforms.current.uHoloActive.value = 0.0;
      setIsHoloActive(false);
    }

    // If braked, but user released Stop and pressed a fresh forward/back, release the brake
    if (isBraked.current && !isStopKeyActive && (rawForward || rawBack)) {
      isBraked.current = false;
    }

    const forwardActive = !isBraked.current && rawForward;
    const backActive = !isBraked.current && rawBack;
    const leftActive = rawLeft;
    const rightActive = rawRight;

    const hasMoveInput = forwardActive || backActive;
    const hasTurnInput = leftActive || rightActive;
    const moving = hasMoveInput || hasTurnInput;

    const baseWalkSpeed = 1.6;
    const baseRunSpeed = 3.2;
    const turnRate = 3.0; // Radians per second for A/D turning
    const currentSpeed = rawRun ? baseRunSpeed : baseWalkSpeed;

    // A. GTA MODEL ROTATIONS (A & D KEYS)
    // Turning model with A or D keys
    if (leftActive) {
      charYaw.current += turnRate * delta;
      hasUserMoved.current = true;
    }
    if (rightActive) {
      charYaw.current -= turnRate * delta;
      hasUserMoved.current = true;
    }
    root.current.rotation.y = charYaw.current;

    // GTA CAMERA AUTO-ADJUST:
    // When model turns using A,D keys (or moves with W,S), camera view auto-adjusts to the back of the model like in GTA.
    // If the user uses mouse controls, manual mouse view rotation takes precedence!
    const rearCameraYaw = charYaw.current + Math.PI;
    const now = performance.now();
    const isActivelyUsingMouse = isDragging.current || (now - lastMouseTime.current < 650);

    if (!isActivelyUsingMouse && hasUserMoved.current) {
      if (hasTurnInput) {
        // Swift, smooth auto-adjust behind the model while turning with A or D keys
        camYaw.current = dampAngle(camYaw.current, rearCameraYaw, 4.2, delta);
      } else if (hasMoveInput) {
        // Smooth auto-centering behind character while walking
        camYaw.current = dampAngle(camYaw.current, rearCameraYaw, 2.4, delta);
      }
    }

    // B. GTA FRONT AND BACK WALKS (W & S KEYS)
    // Moves along the character's current facing direction
    if (forwardActive) {
      if (!hasUserMoved.current) {
        hasUserMoved.current = true;
        // On first forward move, seamlessly pivot character to face into the workspace towards screens
        charYaw.current = 0;
        root.current.rotation.y = 0;
      }
      const fwdX = Math.sin(charYaw.current);
      const fwdZ = Math.cos(charYaw.current);
      root.current.position.x += fwdX * currentSpeed * delta;
      root.current.position.z += fwdZ * currentSpeed * delta;
    } else if (backActive) {
      hasUserMoved.current = true;
      const fwdX = Math.sin(charYaw.current);
      const fwdZ = Math.cos(charYaw.current);
      // Walking backward (reverse of forward vector, calibrated pace)
      const backwardSpeed = currentSpeed * 0.7;
      root.current.position.x -= fwdX * backwardSpeed * delta;
      root.current.position.z -= fwdZ * backwardSpeed * delta;
    }

    // =========================================================================
    // REAL-WORLD PHYSICAL 3D COLLISION SYSTEM
    // Real solid obstacles: character smoothly bypasses kiosks, pedestals, furniture & walls
    // =========================================================================
    const posX = root.current.position.x;
    const posZ = root.current.position.z;

    // 1. Center Hologram Globe Pedestal Collision (circular base at [0, 4.2], radius 1.5m)
    const pedX = 0;
    const pedZ = 4.2;
    const distFromPed = Math.hypot(posX - pedX, posZ - pedZ);
    const minPedDist = 1.5;
    if (distFromPed < minPedDist && distFromPed > 0.001) {
      const angle = Math.atan2(posZ - pedZ, posX - pedX);
      root.current.position.x = pedX + Math.cos(angle) * minPedDist;
      root.current.position.z = pedZ + Math.sin(angle) * minPedDist;
    }

    // 2. Quick Access Kiosk Terminal Collision (freestanding kiosk at [-5.0, 0.5], radius 1.85m)
    // Prevents character from walking into or through the kiosk; smoothly bypasses around it!
    const kioskX = -5.0;
    const kioskZ = 0.5;
    const distFromKiosk = Math.hypot(root.current.position.x - kioskX, root.current.position.z - kioskZ);
    const minKioskDist = 1.85;
    if (distFromKiosk < minKioskDist && distFromKiosk > 0.001) {
      const angle = Math.atan2(root.current.position.z - kioskZ, root.current.position.x - kioskX);
      root.current.position.x = kioskX + Math.cos(angle) * minKioskDist;
      root.current.position.z = kioskZ + Math.sin(angle) * minKioskDist;
    }

    // 3. Modern Lounge Furniture Collision (corner lounge at [4.5, 2.2], radius 1.65m)
    const loungeX = 4.5;
    const loungeZ = 2.2;
    const distFromLounge = Math.hypot(root.current.position.x - loungeX, root.current.position.z - loungeZ);
    const minLoungeDist = 1.65;
    if (distFromLounge < minLoungeDist && distFromLounge > 0.001) {
      const angle = Math.atan2(root.current.position.z - loungeZ, root.current.position.x - loungeX);
      root.current.position.x = loungeX + Math.cos(angle) * minLoungeDist;
      root.current.position.z = loungeZ + Math.sin(angle) * minLoungeDist;
    }

    // 4. Cyber Command Pylon Collision (pylon base at [-5.2, 3.4], radius 1.35m)
    const plantX = -5.2;
    const plantZ = 3.4;
    const distFromPlant = Math.hypot(root.current.position.x - plantX, root.current.position.z - plantZ);
    const minPlantDist = 1.35;
    if (distFromPlant < minPlantDist && distFromPlant > 0.001) {
      const angle = Math.atan2(root.current.position.z - plantZ, root.current.position.x - plantX);
      root.current.position.x = plantX + Math.cos(angle) * minPlantDist;
      root.current.position.z = plantZ + Math.sin(angle) * minPlantDist;
    }

    // 5. Command Center Platform Deck Perimeter & Wall Screen Clamping
    // Deck is centered at [0, 4.0]. Radius 7.5m keeps character safely on the platform deck
    // in front of all wall-mounted screens (Screen 7 at z=11.2, Screen 8 at x=-8.8, Screen 9 at x=8.8)
    // so the character can walk up to any wall screen, inspect it, and bypass along the perimeter!
    const deckCenterX = 0;
    const deckCenterZ = 4.0;
    const distFromCenter = Math.hypot(root.current.position.x - deckCenterX, root.current.position.z - deckCenterZ);
    const maxDeckRadius = 7.5;
    if (distFromCenter > maxDeckRadius && distFromCenter > 0.001) {
      const angle = Math.atan2(root.current.position.z - deckCenterZ, root.current.position.x - deckCenterX);
      root.current.position.x = deckCenterX + Math.cos(angle) * maxDeckRadius;
      root.current.position.z = deckCenterZ + Math.sin(angle) * maxDeckRadius;
    }

    // Forward clamping: keeps character 3.4m in front of Main Featured Projects screen at z=11.2
    if (root.current.position.z > 7.8) {
      root.current.position.z = 7.8;
    }
    // Backward clamping: keeps character on platform boundary
    if (root.current.position.z < -2.2) {
      root.current.position.z = -2.2;
    }

    // C. ANIMATION CROSSFADING & STRIDE SYNCHRONIZATION
    if (hasSkeletalAnimations && actions) {
      let targetClipName = clips.idle;
      let targetTimeScale = 1.0;

      if (forwardActive) {
        targetClipName = rawRun ? clips.run || clips.walk : clips.walk;
        targetTimeScale = rawRun
          ? currentSpeed / baseRunSpeed
          : currentSpeed / baseWalkSpeed;
      } else if (backActive) {
        // Step backward animation (reversed walk cycle)
        targetClipName = clips.walk;
        targetTimeScale = -0.85;
      } else if (hasTurnInput) {
        // Rotating in place (A or D held alone): subtle walking steps while turning
        targetClipName = clips.walk;
        targetTimeScale = 0.65;
      }

      if (targetClipName && targetClipName !== activeClipName.current) {
        const nextAction = actions[targetClipName];
        const prevAction = currentAction.current;

        if (nextAction) {
          nextAction.reset();
          nextAction.setLoop(THREE.LoopRepeat, Infinity);
          nextAction.clampWhenFinished = false;
          nextAction.timeScale = targetTimeScale;
          nextAction.fadeIn(0.2).play();

          if (prevAction && prevAction !== nextAction) {
            prevAction.fadeOut(0.2);
          }

          currentAction.current = nextAction;
          activeClipName.current = targetClipName;
        }
      }

      // Smooth timeScale adjustment during locomotion
      if (currentAction.current && moving) {
        currentAction.current.timeScale = THREE.MathUtils.damp(
          currentAction.current.timeScale,
          targetTimeScale,
          8,
          delta
        );
      }
    }

    // D. PROCEDURAL LEG WALKING FOR UNRIGGED MESHES (my-meshy-model.glb)
    if (!hasSkeletalAnimations) {
      if (moving && !isBraked.current) {
        hasWalked.current = true;
        const strideRate = rawRun ? 8.8 : backActive ? -4.8 : 6.0;
        walkPhase.current += strideRate * delta;
        proceduralUniforms.current.uWalkPhase.value = walkPhase.current;
        proceduralUniforms.current.uWalkIntensity.value = THREE.MathUtils.damp(
          proceduralUniforms.current.uWalkIntensity.value,
          1.0,
          8,
          delta
        );
        proceduralUniforms.current.uStandAtEase.value = THREE.MathUtils.damp(
          proceduralUniforms.current.uStandAtEase.value,
          1.0,
          4,
          delta
        );
      } else {
        proceduralUniforms.current.uWalkIntensity.value = THREE.MathUtils.damp(
          proceduralUniforms.current.uWalkIntensity.value,
          0.0,
          14,
          delta
        );
        // When stopped after walking, settle into Stand At Ease posture (both feet flat on ground)
        if (hasWalked.current || isBraked.current) {
          proceduralUniforms.current.uStandAtEase.value = THREE.MathUtils.damp(
            proceduralUniforms.current.uStandAtEase.value,
            1.0,
            6,
            delta
          );
        }
      }
    }

    // E. GTA THIRD-PERSON CHASE CAMERA
    // Mouse freely controls camYaw & camPitch around the character.
    // The camera smoothly tracks the character position without turning when character rotates!
    if (cameraFollow) {
      const charPos = root.current.position;
      const targetPoint = new THREE.Vector3(
        charPos.x,
        charPos.y + 1.35, // Focal target: upper chest / neck
        charPos.z
      );

      const dist = camDistance.current;
      const pitch = camPitch.current;
      const yaw = camYaw.current;

      const desiredCamPos = new THREE.Vector3(
        targetPoint.x + dist * Math.cos(pitch) * Math.sin(yaw),
        targetPoint.y + dist * Math.sin(pitch),
        targetPoint.z + dist * Math.cos(pitch) * Math.cos(yaw)
      );

      // Smooth camera interpolation
      state.camera.position.lerp(desiredCamPos, 0.16);
      state.camera.lookAt(targetPoint);
    }

    // F. TELEMETRY REPORTING
    if (onTelemetryChange) {
      const facingDeg = Math.round(
        (((charYaw.current * 180) / Math.PI) % 360 + 360) % 360
      );
      const camDeg = Math.round(
        (((camYaw.current * 180) / Math.PI) % 360 + 360) % 360
      );

      let actionDesc = hasWalked.current ? 'Stand At Ease' : 'Initial Pose';
      if (!isHoloComplete.current && holoUniforms.current.uHoloActive.value > 0.01) {
        actionDesc = `⚡ Materializing Hologram (${Math.round(holoUniforms.current.uHoloProgress.value * 100)}%)`;
      } else if (isBraked.current || isStopKeyActive) {
        actionDesc = 'Stopped / Braked (Space)';
      } else if (forwardActive) {
        actionDesc = rawRun ? 'Sprint Forward' : 'Walk Forward';
      } else if (backActive) {
        actionDesc = 'Step Backward';
      } else if (hasTurnInput) {
        actionDesc = 'Turn in Place (A/D)';
      }

      onTelemetryChange({
        moving: moving && !isBraked.current,
        running: !!rawRun,
        speed: moving && !isBraked.current ? currentSpeed : 0,
        pos: {
          x: root.current.position.x.toFixed(2),
          z: root.current.position.z.toFixed(2),
        },
        facingDeg,
        camDeg,
        hasAnimations: hasSkeletalAnimations,
        activeClip: hasSkeletalAnimations
          ? `${activeClipName.current || 'Walk'} (${actionDesc})`
          : `${actionDesc} (Procedural Leg Rig)`,
        lockArms,
        activeKeys: {
          forward: forwardActive,
          back: backActive,
          left: leftActive,
          right: rightActive,
          run: !!rawRun,
          stop: isBraked.current || isStopKeyActive,
        },
      });
    }
    // Dynamic Footstep Floor Pulse Ring (Active Stage Sensor)
    if (footstepRingRef.current) {
      const isCharacterMoving = moving && !isBraked.current;
      const targetScale = isCharacterMoving ? 1.0 + Math.sin(state.clock.getElapsedTime() * 10) * 0.15 : 1.0;
      footstepRingRef.current.scale.set(targetScale, targetScale, 1.0);
      if (footstepRingRef.current.material) {
        footstepRingRef.current.material.opacity = isCharacterMoving ? 0.75 : 0.22;
      }
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      {/* Ground offset ensures feet touch ground plane at Y=0 */}
      <group ref={modelRoot} position={[0, groundOffset, 0]}>
        <primitive object={scene} />
      </group>


      {/* Dynamic Sensor Footstep Energy Ring */}
      <mesh ref={footstepRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.26, 0.40, 32]} />
        <meshBasicMaterial
          color="#FF1E27"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Holographic Projector Base & Scanning Laser Ray Slice (Images 1, 2, 3, 4, 5) */}
      {isHoloActive && (
        <group position={[0, 0, 0]}>
          {/* A. Floor Projector Concentric Rotating Rings & Column */}
          <group position={[0, 0.003, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, holoTimeElapsed.current * 0.9]}>
              <ringGeometry args={[0.72, 0.82, 48]} />
              <meshBasicMaterial color="#FF1E27" transparent opacity={0.75} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, -holoTimeElapsed.current * 0.6]}>
              <ringGeometry args={[0.02, 0.52, 32]} />
              <meshBasicMaterial color="#FF1E27" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.55, 0.80, 2.0, 32, 1, true]} />
              <meshBasicMaterial
                color="#FF1E27"
                transparent
                opacity={0.12 * (1.0 - holoProgress * 0.8)}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>

          {/* B. Scanning Laser Disc & Radiant Assembly Rays (Images 1, 2, 3, 4, 5) */}
          {(() => {
            const currentScanY = THREE.MathUtils.lerp(-1.05, 1.05, holoProgress);
            const currentBeamY = groundOffset + currentScanY;
            return (
              <group position={[0, currentBeamY, 0]}>
                {/* Glowing Laser Scan Disc Slice */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.02, 0.68, 48]} />
                  <meshBasicMaterial
                    color="#FF1E27"
                    transparent
                    opacity={0.85 * (1.0 - holoProgress * 0.4)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
                {/* Intense Laser Edge */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.66, 0.72, 48]} />
                  <meshBasicMaterial
                    color="#FFA3A7"
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
                {/* Radiant Laser Rays Shooting Out (Images 2, 3, 5) */}
                <group rotation={[0, holoProgress * Math.PI * 4, 0]}>
                  {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map(
                    (deg, idx) => {
                      const rad = (deg * Math.PI) / 180;
                      return (
                        <mesh key={idx} rotation={[0, rad, 0]} position={[0.64, 0, 0]}>
                          <planeGeometry args={[0.55, 0.022]} />
                          <meshBasicMaterial
                            color="#FF2E36"
                            transparent
                            opacity={0.75}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                          />
                        </mesh>
                      );
                    }
                  )}
                </group>
              </group>
            );
          })()}
        </group>
      )}
    </group>
  );
}

useGLTF.preload((process.env.PUBLIC_URL || '') + '/my-meshy-model.glb');
useGLTF.preload((process.env.PUBLIC_URL || '') + '/models/sample_rigged_character.glb');

