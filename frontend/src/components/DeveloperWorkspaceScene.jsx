import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound } from '../utils/soundEffects';
import {
  createProjectsScreenTexture,
  createWelcomeTopScreenTexture,
  createWelcomeBottomScreenTexture,
  createTechStackScreenTexture,
  createPhilosophyScreenTexture,
  createQuickAccessScreenTexture,
} from './workspaceScreenTextures';

// =============================================================================
// 1. LUXURY BLACK LEATHER BEANBAG COUCH & FLARING OVAL TABLE (MATCHING IMAGE 4)
// Sunken black leather circular couch with deep folds, flared table, glowing red lamp, mug
// Replaces the green plant with 100% black/crimson cyberpunk luxury lounge
// =============================================================================
function ModernLoungeSofa({ position = [-3.8, 0, 0.8], rotation = [0, 0.55, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark Circular Lounge Floor Rug (Image 4) */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.75, 36]} />
        <meshStandardMaterial color="#08090e" roughness={0.92} metalness={0.08} />
      </mesh>
      {/* Subtle Red Perimeter Ring on Rug */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.58, 1.62, 36]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Sunken Circular Black Leather Beanbag Couch (Exact Shape from Image 4) */}
      <group position={[-0.25, 0, 0]}>
        {/* Low Dark Floor Plinth */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.84, 0.88, 0.08, 32]} />
          <meshStandardMaterial color="#0b0c12" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Outer Plump Beanbag Body (Flattened Sphere with Organic Leather Folds) */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.88, 28, 20]} />
          <meshStandardMaterial color="#0f1016" roughness={0.55} metalness={0.24} />
        </mesh>

        {/* Sloped Organic Backrest Cushion */}
        <mesh position={[0, 0.58, -0.28]} rotation={[0.32, 0, 0]} castShadow>
          <sphereGeometry args={[0.68, 24, 18]} />
          <meshStandardMaterial color="#0b0c12" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Sunken Seat Depression / Well (Deep comfortable indentation matching Image 4) */}
        <mesh position={[0, 0.34, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 24]} />
          <meshStandardMaterial color="#07070b" roughness={0.75} />
        </mesh>

        {/* Soft Leather Crease / Seam Rings */}
        {[0.24, 0.42].map((ringY, ri) => (
          <mesh key={ri} position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.82 - ri * 0.12, 0.035, 12, 32]} />
            <meshStandardMaterial color="#14151f" roughness={0.45} metalness={0.25} />
          </mesh>
        ))}
      </group>

      {/* Low Oval Coffee Table on Flared Base (Exact Match to Image 4) */}
      <group position={[0.78, 0, 0.18]}>
        {/* Flared Dark Conical Pedestal Base */}
        <mesh position={[0, 0.12, 0]} receiveShadow>
          <cylinderGeometry args={[0.22, 0.36, 0.24, 28]} />
          <meshStandardMaterial color="#0d0e15" roughness={0.28} metalness={0.92} />
        </mesh>

        {/* Flared Foot Collar */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.38, 0.4, 0.03, 28]} />
          <meshStandardMaterial color="#090a10" roughness={0.3} metalness={0.95} />
        </mesh>

        {/* Oval Obsidian Tabletop Disc */}
        <mesh position={[0, 0.26, 0]} scale={[1.35, 1, 0.9]} castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.04, 32]} />
          <meshStandardMaterial color="#07080d" roughness={0.12} metalness={0.96} />
        </mesh>

        {/* Ambient Red Cylindrical Cyber Lamp on Table (Matching Image 4) */}
        <group position={[0.06, 0.28, 0.02]}>
          {/* Metal Base */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.04, 24]} />
            <meshStandardMaterial color="#181a24" metalness={0.92} roughness={0.2} />
          </mesh>
          {/* Glowing Red Translucent Glass Cylinder */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.22, 24]} />
            <meshBasicMaterial color="#FF2E36" />
          </mesh>
          {/* Inner Filament Core */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.18, 16]} />
            <meshBasicMaterial color="#FFA3A7" />
          </mesh>
          {/* Metal Top Cap */}
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.078, 0.078, 0.02, 20]} />
            <meshStandardMaterial color="#181a24" metalness={0.92} roughness={0.2} />
          </mesh>
          {/* Localized Warm Red Point Light */}
          <pointLight position={[0, 0.16, 0]} intensity={2.6} distance={3.5} color="#FF2E36" decay={2} />
        </group>

        {/* GitHub Coffee Mug with White Octocat Face (Matching Image 4) */}
        <group position={[-0.18, 0.28, -0.04]}>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.048, 0.044, 0.11, 20]} />
            <meshStandardMaterial color="#161720" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Mug Handle */}
          <mesh position={[-0.052, 0.055, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.028, 0.007, 8, 16]} />
            <meshStandardMaterial color="#161720" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Octocat Silhouette on Mug */}
          <mesh position={[0, 0.055, 0.049]}>
            <circleGeometry args={[0.016, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Utility to create a 3D Cyberpunk Banner Shape matching Image 5
function createCyberBannerShape(w, h) {
  const shape = new THREE.Shape();
  const halfW = w / 2;
  const halfH = h / 2;
  const r = 0.16;
  const notchOffset = 0.58;
  const stepDown = 0.22;
  const chamfer = 0.36;

  // Top-left starting point after rounded corner
  shape.moveTo(-halfW + r, halfH);
  // Top horizontal edge up to notch
  shape.lineTo(halfW - notchOffset, halfH);
  // Stepped notch down
  shape.lineTo(halfW - notchOffset, halfH - stepDown);
  // Stepped notch horizontal to right corner
  shape.lineTo(halfW - r, halfH - stepDown);
  // Top-right corner arc
  shape.quadraticCurveTo(halfW, halfH - stepDown, halfW, halfH - stepDown - r);
  // Right edge down to 45-deg chamfer
  shape.lineTo(halfW, -halfH + chamfer);
  // 45-deg chamfer cut
  shape.lineTo(halfW - chamfer, -halfH);
  // Bottom edge to bottom-left corner
  shape.lineTo(-halfW + r, -halfH);
  // Bottom-left corner arc
  shape.quadraticCurveTo(-halfW, -halfH, -halfW, -halfH + r);
  // Left edge up to top-left corner
  shape.lineTo(-halfW, halfH - r);
  // Top-left corner arc
  shape.quadraticCurveTo(-halfW, halfH, -halfW + r, halfH);

  return shape;
}

// Generate normalized UV ShapeGeometry and extruded casing matching Image 5
function createCyberBannerGeometries(w, h) {
  const shape = createCyberBannerShape(w, h);

  // 1. Screen Face Geometry with normalized [0, 1] UVs
  const faceGeom = new THREE.ShapeGeometry(shape);
  faceGeom.computeBoundingBox();
  const bb = faceGeom.boundingBox;
  const pos = faceGeom.attributes.position;
  const uv = faceGeom.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x),
      (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)
    );
  }
  uv.needsUpdate = true;

  // 2. Extruded Dark Backing Chassis
  // Crucial: Translate casing backward so it sits entirely behind the screen face at z <= 0
  const casingGeom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: false,
  });
  casingGeom.translate(0, 0, -0.12);

  // 3. Glowing Perimeter Border Points
  const points = shape.getPoints(24);
  const borderGeom = new THREE.BufferGeometry().setFromPoints(points);

  return { faceGeom, casingGeom, borderGeom };
}

// Reusable 3D Floating Cyber Banner Panel matching Image 5
function CyberBannerPanel({
  width = 4.8,
  height = 2.9,
  texture,
  onClick,
  onPointerOver,
  onPointerOut,
  hasHazard = true,
}) {
  const geometries = useMemo(() => {
    return createCyberBannerGeometries(width, height);
  }, [width, height]);

  useEffect(() => {
    return () => {
      geometries.faceGeom.dispose();
      geometries.casingGeom.dispose();
      geometries.borderGeom.dispose();
    };
  }, [geometries]);

  const halfW = width / 2;
  const halfH = height / 2;
  const notchOffset = 0.58;
  const stepDown = 0.22;
  const chamfer = 0.36;

  return (
    <group
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* 1. Dark Cyber Metallic Extruded Casing (Positioned behind screen) */}
      <mesh
        geometry={geometries.casingGeom}
        position={[0, 0, -0.005]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#0b0c12"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* 2. Red Neon Perimeter Glow Border Line */}
      <lineLoop geometry={geometries.borderGeom} position={[0, 0, 0.022]}>
        <lineBasicMaterial color="#FF1E27" linewidth={3} />
      </lineLoop>

      {/* 3. Outer Cyber Corner Accent Brackets (Exact Image 5) */}
      {/* Top-Left Outer L-Bracket */}
      <mesh position={[-halfW - 0.04, halfH + 0.04, 0.025]}>
        <boxGeometry args={[0.38, 0.045, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>
      <mesh position={[-halfW - 0.04, halfH - 0.14, 0.025]}>
        <boxGeometry args={[0.045, 0.36, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Top-Right Stepped Notch Bracket */}
      <mesh position={[halfW - notchOffset + 0.12, halfH - stepDown + 0.04, 0.025]}>
        <boxGeometry args={[0.32, 0.045, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>
      <mesh position={[halfW + 0.04, halfH - stepDown - 0.14, 0.025]}>
        <boxGeometry args={[0.045, 0.32, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Bottom-Right Chamfer Corner Bracket */}
      <mesh
        position={[halfW - chamfer / 2 + 0.04, -halfH + chamfer / 2 - 0.04, 0.025]}
        rotation={[0, 0, Math.PI / 4]}
      >
        <boxGeometry args={[chamfer * 1.35, 0.045, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Bottom-Left Notch Tab */}
      <mesh position={[-halfW + 0.36, -halfH - 0.035, 0.025]}>
        <boxGeometry args={[0.26, 0.04, 0.02]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* 4. Front Screen Surface with Normalized UVs (Unambiguously in front) */}
      <mesh geometry={geometries.faceGeom} position={[0, 0, 0.015]}>
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={1.0}
          roughness={0.15}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// =============================================================================
// 2. INTERACTIVE QUICK ACCESS CONSOLE KIOSK (FOREGROUND NEAR CHARACTER MODEL)
// Positioned in viewer's left foreground [2.4, 0, -0.1] directly visible on load!
// Elevated at Y=1.15 and tilted towards camera eye, completely clear of bottom WASD overlay
// =============================================================================
function QuickAccessKiosk({ textureObj, onAction }) {
  const geometries = useMemo(() => {
    return createCyberBannerGeometries(1.82, 1.28);
  }, []);

  useEffect(() => {
    return () => {
      geometries.faceGeom.dispose();
      geometries.casingGeom.dispose();
      geometries.borderGeom.dispose();
    };
  }, [geometries]);

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 720;

    let hov = -1;
    if (canvasX >= 48 && canvasX <= 976) {
      if (canvasY >= 140 && canvasY <= 290) hov = 0;
      else if (canvasY >= 314 && canvasY <= 464) hov = 1;
      else if (canvasY >= 488 && canvasY <= 638) hov = 2;
    }
    if (textureObj?.redraw) textureObj.redraw(hov);
    document.body.style.cursor = hov !== -1 ? 'pointer' : 'auto';
  };

  const handlePointerOut = () => {
    if (textureObj?.redraw) textureObj.redraw(-1);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 720;

    let row = -1;
    if (canvasX >= 48 && canvasX <= 976) {
      if (canvasY >= 140 && canvasY <= 290) row = 0;
      else if (canvasY >= 314 && canvasY <= 464) row = 1;
      else if (canvasY >= 488 && canvasY <= 638) row = 2;
    }
    if (row !== -1 && onAction) {
      onAction(row);
    }
  };

  return (
    <group position={[2.4, 0, -0.1]} rotation={[0, -2.86, 0]}>
      {/* Floor Base: Heavy Ring & Halo */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.08, 32]} />
        <meshStandardMaterial color="#0b0c12" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.08, 36]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Cyber Pylon Riser Column */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.72, 16]} />
        <meshStandardMaterial color="#11131a" roughness={0.25} metalness={0.92} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.68, 16]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Elevated Console Head Tilted Toward Camera Eye */}
      <group position={[0, 1.15, 0]} rotation={[-0.18, 0, 0]}>
        {/* Dark Back Chassis Shell (Extruded Cyber Shape positioned behind screen) */}
        <mesh geometry={geometries.casingGeom} position={[0, 0, -0.005]} castShadow receiveShadow>
          <meshStandardMaterial color="#0c0e14" roughness={0.25} metalness={0.92} />
        </mesh>

        {/* Glowing Red Perimeter Border Line */}
        <lineLoop geometry={geometries.borderGeom} position={[0, 0, 0.022]}>
          <lineBasicMaterial color="#FF1E27" linewidth={2.5} />
        </lineLoop>

        {/* Outer Red Accent Square Tabs (Matching Media 2 top-left & bottom-right) */}
        <mesh position={[-0.92, 0.65, 0.025]}>
          <boxGeometry args={[0.18, 0.18, 0.02]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>
        <mesh position={[0.92, -0.65, 0.025]}>
          <boxGeometry args={[0.18, 0.18, 0.02]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* Interactive Screen Surface (Unambiguously in front) */}
        <mesh
          geometry={geometries.faceGeom}
          position={[0, 0, 0.015]}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial
            map={textureObj?.texture}
            emissiveMap={textureObj?.texture}
            emissive="#ffffff"
            emissiveIntensity={1.0}
            roughness={0.15}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================================
// 3. CENTRAL HOLOGRAPHIC RED EARTH PEDESTAL
// Rotating wireframe globe with latitude/longitude, continent clusters & orbital rings
// =============================================================================
function HolographicEarthPedestal({ onInteract }) {
  const globeRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.45;
      globeRef.current.position.y = 0.95 + Math.sin(state.clock.getElapsedTime() * 1.8) * 0.025;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.35;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.28;
      ringRef2.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group
      position={[0, 0, 4.2]}
      onClick={onInteract}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Tiered Technological Pedestal Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.45, 0.24, 32]} />
        <meshStandardMaterial color="#11131a" metalness={0.85} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.15, 0.14, 32]} />
        <meshStandardMaterial color="#171922" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Glowing Red Emitter Ring on Pedestal */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.04, 32]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Projector Cone Glass Rim */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.6, 0.72, 0.08, 32]} />
        <meshStandardMaterial color="#000000" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Upward Hologram Beam (Compact low-profile beam) */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.42, 0.25, 0.42, 32, 1, true]} />
        <meshBasicMaterial
          color="#FF1E27"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating Holographic Wireframe Earth Globe */}
      <group ref={globeRef} position={[0, 0.95, 0]}>
        {/* Main Outer Wireframe Grid */}
        <mesh>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshBasicMaterial
            color="#FF1E27"
            wireframe
            transparent
            opacity={0.78}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Inner Glowing Red Core */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            color="#FF5259"
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Continent Nodes / Satellite Points */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.sin(rad) * 0.46, Math.sin(rad * 2) * 0.16, Math.cos(rad) * 0.46]}
            >
              <sphereGeometry args={[0.026, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          );
        })}
      </group>

      {/* Universal Rotating Holographic Orbital Rings */}
      <mesh ref={ringRef1} position={[0, 0.95, 0]} rotation={[0.4, 0.2, 0]}>
        <ringGeometry args={[0.62, 0.65, 48]} />
        <meshBasicMaterial
          color="#FF1E27"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ringRef2} position={[0, 0.95, 0]} rotation={[-0.5, 0.4, 0.3]}>
        <ringGeometry args={[0.72, 0.75, 48]} />
        <meshBasicMaterial
          color="#FF6B72"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// =============================================================================
// 4. ATMOSPHERIC PARTICLES & FLOOR CONDUITS
// =============================================================================
function CyberAtmosphericMotes({ count = 90 }) {
  const motesRef = useRef();
  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = 0.5 + Math.random() * 5.6;
      pos[i * 3 + 2] = -3 + Math.random() * 15;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!motesRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = motesRef.current.geometry.attributes.position;
    const arr = posAttr.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 1] += Math.sin(t * 1.2 + phases[i]) * 0.0025;
      arr[idx] += Math.cos(t * 0.7 + phases[i]) * 0.0018;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={motesRef} geometry={geom}>
      <pointsMaterial
        size={0.08}
        color="#FF3B44"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CyberFloorConduits() {
  const packetRef = useRef();

  useFrame((state) => {
    if (packetRef.current) {
      const p = (state.clock.getElapsedTime() * 0.45) % 1.0;
      packetRef.current.position.z = 4.2 + p * 5.6;
    }
  });

  return (
    <group position={[0, 0.004, 0]}>
      {/* Pedestal to Curved Projects Screen */}
      <mesh position={[0, 0, 7.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 5.6]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Traveling Data Packet */}
      <mesh ref={packetRef} position={[0, 0.006, 7.0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Pedestal to Left Screen (Viewer's Left, World +X) */}
      <mesh position={[3.8, 0, 5.6]} rotation={[-Math.PI / 2, 0, -0.62]}>
        <planeGeometry args={[0.04, 7.6]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Pedestal to Right Screen (Viewer's Right, World -X) */}
      <mesh position={[-3.8, 0, 5.6]} rotation={[-Math.PI / 2, 0, 0.62]}>
        <planeGeometry args={[0.04, 7.6]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// =============================================================================
// MAIN WORKSPACE SCENE COMPONENT
// =============================================================================
export default function DeveloperWorkspaceScene({ onClose }) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [, setTick] = useState(0);
  const [strobeState, setStrobeState] = useState(false);
  const beaconRef = useRef();

  // 1. Textures for the exact physical screen panels shown in the reference image
  const projectsTextureObj = useMemo(() => {
    return createProjectsScreenTexture(null, publicUrl, () => {
      setTick((t) => t + 1);
    });
  }, [publicUrl]);

  const welcomeTopTextureObj = useMemo(() => {
    return createWelcomeTopScreenTexture(publicUrl, () => {
      setTick((t) => t + 1);
    });
  }, [publicUrl]);

  const welcomeBottomTextureObj = useMemo(() => {
    return createWelcomeBottomScreenTexture();
  }, []);

  const techStackTextureObj = useMemo(() => {
    return createTechStackScreenTexture();
  }, []);

  const philosophyTextureObj = useMemo(() => {
    return createPhilosophyScreenTexture();
  }, []);

  const quickAccessTextureObj = useMemo(() => {
    return createQuickAccessScreenTexture();
  }, []);

  // 2. High-precision Curved Geometries for the IMAX Projects Screen
  // Inverting UV.X solves the mirror / flip issue completely so text reads left-to-right naturally!
  const curvedProjectsGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(18, 18, 5.05, 48, 1, true, -0.31, 0.62);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, 1 - uv.getX(i));
    }
    uv.needsUpdate = true;
    return g;
  }, []);

  const curvedCasingGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(18.15, 18.15, 5.25, 48, 1, true, -0.315, 0.63);
  }, []);

  const curvedBezelGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(18.1, 18.1, 5.16, 48, 1, true, -0.312, 0.624);
  }, []);

  // Celestial deep-space starfield visible through the high clerestory
  const starsGeometry = useMemo(() => {
    const count = 450;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = 0.15 + Math.random() * 0.95;
      const r = 26 + Math.random() * 10;
      positions[i * 3] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 1] = 6.0 + r * Math.cos(phi);
      positions[i * 3 + 2] = 4.2 + r * Math.sin(phi) * Math.cos(theta);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  // Cleanup WebGL textures and geometries on unmount
  useEffect(() => {
    return () => {
      projectsTextureObj?.texture?.dispose();
      welcomeTopTextureObj?.texture?.dispose();
      welcomeBottomTextureObj?.texture?.dispose();
      techStackTextureObj?.texture?.dispose();
      philosophyTextureObj?.texture?.dispose();
      quickAccessTextureObj?.texture?.dispose();
      curvedProjectsGeometry?.dispose();
      curvedCasingGeometry?.dispose();
      curvedBezelGeometry?.dispose();
      starsGeometry?.dispose();
    };
  }, [
    projectsTextureObj,
    welcomeTopTextureObj,
    welcomeBottomTextureObj,
    techStackTextureObj,
    philosophyTextureObj,
    quickAccessTextureObj,
    curvedProjectsGeometry,
    curvedCasingGeometry,
    curvedBezelGeometry,
    starsGeometry,
  ]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      const s = 1.0 + Math.sin(t * 2.5) * 0.12;
      beaconRef.current.scale.set(s, s, s);
    }
    const isStrobe = Math.floor(t * 1.5) % 3 === 0;
    if (isStrobe !== strobeState) {
      setStrobeState(isStrobe);
    }
  });

  // Action Dispatcher for Quick Access Console
  const handleQuickAction = (row) => {
    playClickSound('click');
    if (row === 0) {
      if (onClose) onClose();
      setTimeout(() => {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (row === 1) {
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
    } else if (row === 2) {
      if (onClose) onClose();
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Main Curved Projects Screen Interaction Handlers (Carousel + App Launch)
  const handleProjectsPointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;

    let isClickable = false;
    let hoveredIdx = -1;
    let viewAllHov = false;
    let prevHov = false;
    let nextHov = false;
    let leftChev = false;
    let rightChev = false;

    // VIEW ALL -> button (top right: btnX: 1773..1973, btnY: 62..110)
    if (canvasY >= 60 && canvasY <= 112 && canvasX >= 1765 && canvasX <= 1980) {
      isClickable = true;
      viewAllHov = true;
    }
    // Bottom ‹ PREV Button (x: 720..870, y: 980..1030)
    else if (canvasY >= 975 && canvasY <= 1035 && canvasX >= 715 && canvasX <= 875) {
      isClickable = true;
      prevHov = true;
    }
    // Bottom NEXT › Button (x: 1178..1328, y: 980..1030)
    else if (canvasY >= 975 && canvasY <= 1035 && canvasX >= 1170 && canvasX <= 1335) {
      isClickable = true;
      nextHov = true;
    }
    // Left Edge Chevron ‹ (x <= 70, y: 500..580)
    else if (canvasX <= 72 && canvasY >= 500 && canvasY <= 580) {
      isClickable = true;
      leftChev = true;
    }
    // Right Edge Chevron › (x >= 1976, y: 500..580)
    else if (canvasX >= 1976 && canvasY >= 500 && canvasY <= 580) {
      isClickable = true;
      rightChev = true;
    }
    // 4 Project Cards (y: 150..930)
    else if (canvasY >= 150 && canvasY <= 930) {
      for (let i = 0; i < 4; i++) {
        const cardX = 74 + i * 482;
        if (canvasX >= cardX && canvasX <= cardX + 440) {
          isClickable = true;
          hoveredIdx = i;
          break;
        }
      }
    }

    if (projectsTextureObj?.setHoveredState) {
      projectsTextureObj.setHoveredState(hoveredIdx, viewAllHov, prevHov, nextHov, leftChev, rightChev);
    }
    document.body.style.cursor = isClickable ? 'pointer' : 'auto';
  };

  const handleProjectsPointerOut = () => {
    if (projectsTextureObj?.setHoveredState) {
      projectsTextureObj.setHoveredState(-1, false, false, false, false, false);
    }
    document.body.style.cursor = 'auto';
  };

  const handleProjectsClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;

    // VIEW ALL -> button
    if (canvasY >= 60 && canvasY <= 112 && canvasX >= 1765 && canvasX <= 1980) {
      playClickSound('click');
      if (onClose) onClose();
      setTimeout(() => {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    }

    // ‹ PREV Button or Left Chevron
    if (
      (canvasY >= 975 && canvasY <= 1035 && canvasX >= 715 && canvasX <= 875) ||
      (canvasX <= 72 && canvasY >= 500 && canvasY <= 580)
    ) {
      playClickSound('switch');
      projectsTextureObj?.prevPage();
      return;
    }

    // NEXT › Button or Right Chevron
    if (
      (canvasY >= 975 && canvasY <= 1035 && canvasX >= 1170 && canvasX <= 1335) ||
      (canvasX >= 1976 && canvasY >= 500 && canvasY <= 580)
    ) {
      playClickSound('switch');
      projectsTextureObj?.nextPage();
      return;
    }

    // Project Cards Click: Launches Application Live Demo / Site
    if (canvasY >= 150 && canvasY <= 930) {
      const currentList = projectsTextureObj?.getCurrentProjects ? projectsTextureObj.getCurrentProjects() : [];
      for (let i = 0; i < 4; i++) {
        const cardX = 74 + i * 482;
        if (canvasX >= cardX && canvasX <= cardX + 440) {
          const proj = currentList[i];
          if (proj) {
            playClickSound('click');
            window.open(proj.liveUrl || `https://github.com/${proj.repo}`, '_blank', 'noopener,noreferrer');
          }
          return;
        }
      }
    }
  };

  return (
    <group name="DeveloperWorkspaceEnvironment">
      {/* =========================================================================
          1. LIGHTING SETUP — HIGH CLARITY STUDIO & CRIMSON NEON ACCENTS
         ========================================================================= */}
      <ambientLight intensity={1.45} color="#ffffff" />
      <hemisphereLight skyColor="#ffffff" groundColor="#1a1c24" intensity={0.65} />

      {/* Main Overhead Key Light */}
      <directionalLight
        position={[0, 8, 3]}
        intensity={1.1}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Gentle Camera-Side Fill Light */}
      <directionalLight position={[0, 3, -6]} intensity={0.55} color="#ffffff" />

      {/* Red Volumetric Glow over Central Pedestal */}
      <pointLight position={[0, 1.8, 4.2]} intensity={2.8} distance={6.5} color="#FF1E27" decay={2} />

      {/* Red Floor Uplight under Main Curved Projects Screen */}
      <pointLight position={[0, 0.6, 9.2]} intensity={2.2} distance={6} color="#FF1E27" decay={2} />

      {/* =========================================================================
          2. ENVIRONMENT FLOOR & PLATFORM (REFLECTIVE CARBON WITH CONCENTRIC RINGS)
         ========================================================================= */}
      {/* Primary Circular Stage Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4]} receiveShadow>
        <circleGeometry args={[14.5, 64]} />
        <meshStandardMaterial
          color="#0c0e14"
          roughness={0.22}
          metalness={0.78}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Outer Horizon Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#050608" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Floor Grid Pattern */}
      <gridHelper args={[29, 29, '#FF1E27', '#1a1d2e']} position={[0, 0.002, 4]} />

      {/* Concentric Glowing Red Neon Floor Rings */}
      {/* Ring Under Character (at z = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.85, 0.92, 48]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[1.35, 1.4, 48]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Central Pedestal Rings (at z = 4.2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4.2]}>
        <ringGeometry args={[1.5, 1.58, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4.2]}>
        <ringGeometry args={[2.4, 2.45, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Mid Platform Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[5.8, 5.88, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Workspace Platform Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[10.5, 10.62, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[14.2, 14.38, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Radial Laser Tracks */}
      {[-0.6, -0.2, 0.2, 0.6].map((angle, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, angle]}
          position={[Math.sin(angle) * 7.5, 0.003, 4 + Math.cos(angle) * 3.5]}
        >
          <planeGeometry args={[0.06, 6]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* =========================================================================
          3. FOREGROUND INTERACTIVE QUICK ACCESS CONSOLE KIOSK
             Positioned in viewer's left foreground [2.0, 0, -0.6] directly visible on load!
             Clear of bottom WASD overlay, facing camera with dot product 0.99
         ========================================================================= */}
      <QuickAccessKiosk textureObj={quickAccessTextureObj} onAction={handleQuickAction} />

      {/* =========================================================================
          4. CENTRAL HOLOGRAPHIC RED EARTH PEDESTAL
         ========================================================================= */}
      <HolographicEarthPedestal
        onInteract={() => {
          playClickSound('hologram');
        }}
      />

      {/* =========================================================================
          5. MAIN CENTER CURVED PANORAMIC DISPLAY — "MY PROJECTS" (IMAX CURVE)
             Curved horizontally toward the user with 4 featured cards + carousel navigation
         ========================================================================= */}
      <group position={[0, 4.15, -8.2]}>
        {/* Dark Metallic Outer Backing Shell */}
        <mesh geometry={curvedCasingGeometry} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#08090f"
            roughness={0.25}
            metalness={0.92}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer Red Glowing Bezel Edge */}
        <mesh geometry={curvedBezelGeometry} position={[0, 0, 0]}>
          <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
        </mesh>

        {/* Interactive Curved 3D WebGL Screen Surface (Inverted UV.X for natural left-to-right reading) */}
        <mesh
          geometry={curvedProjectsGeometry}
          position={[0, 0, 0]}
          onClick={handleProjectsClick}
          onPointerMove={handleProjectsPointerMove}
          onPointerOut={handleProjectsPointerOut}
        >
          <meshStandardMaterial
            map={projectsTextureObj.texture}
            emissiveMap={projectsTextureObj.texture}
            emissive="#ffffff"
            emissiveIntensity={0.88}
            roughness={0.18}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* =========================================================================
          6. LEFT WALL FLOATING PANELS (VIEWER'S LEFT: WORLD +X)
             Welcome card + 32 Repositories card (Shaped matching Image 5)
         ========================================================================= */}
      <group position={[7.8, 0, 6.2]} rotation={[0.05, Math.PI + 0.44, 0]}>
        {/* Top Panel: Welcome to my Developer Workspace (Shaped matching Image 5) */}
        <group position={[0, 4.4, 0]}>
          <CyberBannerPanel
            width={4.8}
            height={2.9}
            texture={welcomeTopTextureObj.texture}
            hasHazard={true}
            onClick={() => {
              playClickSound('click');
              window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          />
        </group>

        {/* Bottom Panel: 32 Repositories & 5+ Ideas */}
        <group position={[0, 1.85, 0]}>
          <CyberBannerPanel
            width={4.8}
            height={1.7}
            texture={welcomeBottomTextureObj.texture}
            hasHazard={false}
            onClick={() => {
              playClickSound('click');
              window.open('https://github.com/Charan-718?tab=repositories', '_blank', 'noopener,noreferrer');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          />
        </group>
      </group>

      {/* =========================================================================
          7. RIGHT WALL FLOATING PANELS (VIEWER'S RIGHT: WORLD -X)
             Tech Stack card + "Build • Innovate • Inspire" quote card
         ========================================================================= */}
      <group position={[-7.8, 0, 6.2]} rotation={[0.05, Math.PI - 0.44, 0]}>
        {/* Top Panel: Tech Stack with 6 icons */}
        <group position={[0, 4.25, 0]}>
          <CyberBannerPanel
            width={4.8}
            height={3.4}
            texture={techStackTextureObj.texture}
            hasHazard={true}
            onClick={() => {
              playClickSound('click');
              window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          />
        </group>

        {/* Bottom Panel: Philosophy Quote */}
        <group position={[0, 1.75, 0]}>
          <CyberBannerPanel
            width={4.8}
            height={1.1}
            texture={philosophyTextureObj.texture}
            hasHazard={false}
          />
        </group>
      </group>

      {/* Viewer's Right Floor: Modern Curved Black Leather Lounge Sofa, Lamp & Mug (Image 4) */}
      <ModernLoungeSofa />

      {/* =========================================================================
          8. PERIMETER BACK WALL & CYBER BULKHEAD COLUMNS
         ========================================================================= */}
      <group position={[0, 3.2, 4]}>
        <mesh>
          <cylinderGeometry args={[14.6, 14.6, 7.5, 48, 1, true, 0, Math.PI * 2]} />
          <meshStandardMaterial
            color="#07080c"
            metalness={0.92}
            roughness={0.15}
            transparent
            opacity={0.88}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Vertical Structural Columns with Red Neon Grooves */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.sin(rad) * 14.5;
          const z = Math.cos(rad) * 14.5;
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, -rad, 0]}>
              <mesh>
                <boxGeometry args={[0.45, 7.5, 0.45]} />
                <meshStandardMaterial color="#11131a" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, -0.23]}>
                <boxGeometry args={[0.06, 7.2, 0.02]} />
                <meshBasicMaterial color="#FF1E27" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* =========================================================================
          9. FUTURISTIC STARSHIP DOME CEILING & CONCENTRIC LED LIGHTING RIG
         ========================================================================= */}
      <group position={[0, 7.35, 4.2]}>
        {/* Outer Bulkhead Rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[11.2, 14.2, 64]} />
          <meshStandardMaterial color="#0a0c13" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[13.8, 14.2, 0.45, 64, 1, true]} />
          <meshStandardMaterial color="#08090e" metalness={0.92} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Outer Glowing Neon Red Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[10.35, 10.55, 64]} />
          <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
        </mesh>

        {/* Middle Stepped Soffit */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[7.4, 10.15, 64]} />
          <meshStandardMaterial color="#0f121a" metalness={0.88} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>

        {/* Middle Red Neon Accent Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[7.15, 7.32, 64]} />
          <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
        </mesh>

        {/* Inner Brilliant Halo Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[4.55, 4.75, 64]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
        </mesh>

        {/* Central Core Star Pod */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[3.2, 3.4, 0.4, 48]} />
          <meshStandardMaterial color="#080a10" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Center Glowing Red Star Beacon */}
        <mesh ref={beaconRef} position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* 12 Radial Structural Trusses */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <group key={`ceiling-rafter-${i}`} rotation={[0, rad, 0]}>
              <mesh position={[0, 0.14, 7.3]}>
                <boxGeometry args={[0.16, 0.28, 8.2]} />
                <meshStandardMaterial color="#11141e" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.01, 7.3]}>
                <boxGeometry args={[0.04, 0.03, 8.2]} />
                <meshBasicMaterial color="#FF1E27" />
              </mesh>
            </group>
          );
        })}

        {/* 6 Overhead Studio Downlight Projector Cans along the Ring */}
        {[30, 90, 150, 210, 270, 330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = Math.cos(rad) * 6.8;
          const pz = Math.sin(rad) * 6.8;
          return (
            <group key={`overhead-can-${i}`} position={[px, -0.05, pz]} rotation={[0.2 * Math.sin(rad), -rad, 0.2 * Math.cos(rad)]}>
              <mesh>
                <cylinderGeometry args={[0.14, 0.18, 0.35, 16]} />
                <meshStandardMaterial color="#0c0e14" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.13, 16]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* =========================================================================
          10. MICRO-DETAILS: FLOOR CONDUITS & VOLUMETRIC CYBER PARTICLES
         ========================================================================= */}
      <CyberFloorConduits />
      <CyberAtmosphericMotes count={90} />

      {/* Celestial Deep Space Starfield */}
      <points geometry={starsGeometry}>
        <pointsMaterial size={0.18} color="#ffffff" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
}
