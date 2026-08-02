import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Sliders } from 'lucide-react';

export default function Fabric3DVisualizer({ fabricName = 'Denim Twill', color = '#1e3a8a', gsm = 420 }) {
  const mountRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.8);
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    // Create 3D Cloth Physics Mesh Plane with sinusoidal waves
    const geometry = new THREE.PlaneGeometry(3.2, 3.2, 40, 40);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.65,
      metalness: 0.15,
      wireframe: false,
      side: THREE.DoubleSide
    });

    const clothMesh = new THREE.Mesh(geometry, material);
    scene.add(clothMesh);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Deform vertices for realistic fabric fold drape animation
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 2.5 + time * 1.5) * 0.15 + Math.cos(v * 2.0 + time * 1.2) * 0.12;
        pos.setZ(i, z);
      }
      geometry.computeVertexNormals();
      pos.needsUpdate = true;

      if (isRotating) {
        clothMesh.rotation.y = Math.sin(time * 0.5) * 0.25;
        clothMesh.rotation.x = Math.cos(time * 0.4) * 0.15;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [color, isRotating]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 border border-slate-700/60 shadow-2xl overflow-hidden group">
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/30 text-xs font-semibold text-indigo-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>3D Cloth Simulation Engine</span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700">
        <button
          onClick={() => setIsRotating(prev => !prev)}
          className={`p-1.5 rounded-md transition ${isRotating ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={mountRef}
        className="w-full h-64 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      />

      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-white">{fabricName}</span>
          <span className="text-slate-400">({gsm} GSM)</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <span>Drag to inspect 3D drape</span>
        </div>
      </div>
    </div>
  );
}
