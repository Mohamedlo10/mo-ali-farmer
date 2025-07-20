import React, { useState } from 'react';
import { PlanProposal } from '@/interface/type';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanVisualizer3DProps {
  plan: PlanProposal | null;
}

const PlanVisualizer3D: React.FC<PlanVisualizer3DProps> = ({ plan }) => {
  const [rotation, setRotation] = useState({ x: 15, y: 45 });
  const [zoom, setZoom] = useState(1);

  const colors = [
    '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ];

  const resetView = () => {
    setRotation({ x: 15, y: 45 });
    setZoom(1);
  };

  return (
    <div className="w-full h-full flex flex-col bg-accent/20 rounded-lg p-6">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-card-foreground">Vue 3D Interactive</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="flex-1 flex items-center justify-center relative">
        <div 
          className="relative transition-transform duration-300"
          style={{
            transform: `scale(${zoom}) perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base terrain */}
          <div 
            className="relative bg-gradient-to-br from-secondary to-accent border border-border rounded-lg shadow-2xl"
            style={{
              width: '300px',
              height: '200px',
              transform: 'translateZ(-10px)'
            }}
          />
          
          {/* Parcelles en 3D */}
          <div className="absolute inset-0 grid grid-cols-4 gap-1 p-2">
            {plan?.parcelles.map((parcelle, index) => {
              const color = parcelle.culture.couleur || colors[index % colors.length];
              const height = Math.max(parcelle.pourcentage * 2, 20);
              
              return (
                <div
                  key={index}
                  className="relative rounded-md shadow-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: color,
                    height: `${height}px`,
                    transform: `translateZ(${height / 2}px)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Top face */}
                  <div
                    className="absolute inset-0 rounded-md border border-white/20"
                    style={{
                      backgroundColor: color,
                      transform: `translateZ(${height / 2}px)`
                    }}
                  />
                  
                  {/* Side faces */}
                  <div
                    className="absolute left-0 top-0 w-full rounded-l-md"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 80%, black)`,
                      height: `${height}px`,
                      transform: 'rotateY(-90deg) translateZ(0px)',
                      transformOrigin: 'left center'
                    }}
                  />
                  
                  <div
                    className="absolute right-0 top-0 w-full rounded-r-md"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 60%, black)`,
                      height: `${height}px`,
                      transform: 'rotateY(90deg) translateZ(0px)',
                      transformOrigin: 'right center'
                    }}
                  />
                  
                  {/* Label */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold z-10"
                    style={{ transform: `translateZ(${height / 2 + 1}px)` }}
                  >
                    {parcelle.pourcentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rotation controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Rotation Y:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation.y}
            onChange={(e) => setRotation(prev => ({ ...prev, y: parseInt(e.target.value) }))}
            className="w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Rotation X:</label>
          <input
            type="range"
            min="-30"
            max="60"
            value={rotation.x}
            onChange={(e) => setRotation(prev => ({ ...prev, x: parseInt(e.target.value) }))}
            className="w-20"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {plan?.parcelles.map((parcelle, index) => (
          <div key={index} className="flex items-center gap-2 bg-card p-2 rounded-md shadow-sm">
            <div
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: parcelle.culture.couleur || colors[index % colors.length] }}
            />
            <span className="text-xs font-medium text-card-foreground truncate">
              {parcelle.culture.nom || `Culture ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanVisualizer3D;