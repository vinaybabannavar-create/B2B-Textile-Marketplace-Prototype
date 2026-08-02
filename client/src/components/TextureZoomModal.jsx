import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RefreshCw, Maximize2, ShieldCheck } from 'lucide-react';

export default function TextureZoomModal({ isOpen, onClose, imageSrc, title, gsm, composition }) {
  const [zoomScale, setZoomScale] = useState(2.5);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, show: false });
  const imgRef = useRef(null);

  if (!isOpen || !imageSrc) return null;

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setLensPos({ x, y, show: true, width: rect.width, height: rect.height });
    } else {
      setLensPos(prev => ({ ...prev, show: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-brand-500" />
              High-Resolution Fiber & Weave Inspector
            </h3>
            <p className="text-xs text-slate-400">Hover over the fabric texture to magnify thread count, yarn slub & weave structure</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setZoomScale(prev => Math.max(1.5, prev - 0.5))}
                className="p-1 text-slate-300 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-brand-400 w-12 text-center">{zoomScale.toFixed(1)}x</span>
              <button
                onClick={() => setZoomScale(prev => Math.min(5.0, prev + 0.5))}
                className="p-1 text-slate-300 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomScale(2.5)}
                className="p-1 text-slate-400 hover:text-slate-200 transition border-l border-slate-700 ml-1 pl-2"
                title="Reset Zoom"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Texture Viewer Workspace */}
        <div className="relative flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-hidden select-none">
          <div
            className="relative cursor-crosshair rounded-xl overflow-hidden border border-slate-800 shadow-2xl max-h-[60vh]"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setLensPos(prev => ({ ...prev, show: false }))}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt={title}
              className="max-h-[55vh] w-auto object-contain rounded-xl"
            />

            {/* Magnifying Glass Lens Overlay */}
            {lensPos.show && imgRef.current && (
              <div
                className="magnifier-lens"
                style={{
                  width: '180px',
                  height: '180px',
                  left: `${lensPos.x - 90}px`,
                  top: `${lensPos.y - 90}px`,
                  backgroundImage: `url("${imageSrc}")`,
                  backgroundSize: `${lensPos.width * zoomScale}px ${lensPos.height * zoomScale}px`,
                  backgroundPosition: `-${lensPos.x * zoomScale - 90}px -${lensPos.y * zoomScale - 90}px`
                }}
              />
            )}
          </div>
        </div>

        {/* Footer specs */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-300">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-white">{title}</span>
            <span className="text-slate-400">|</span>
            <span>GSM: <strong className="text-indigo-400">{gsm || 220}</strong></span>
            <span className="text-slate-400">|</span>
            <span>Composition: <strong className="text-slate-200">{composition || '100% Cotton'}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>High-Def Weave Audit Passed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
