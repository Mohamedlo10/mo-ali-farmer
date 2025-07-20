import React from 'react';
import { PlanProposal } from '@/interface/type';

interface PlanVisualizer2DProps {
  plan: PlanProposal | null;
}

const PlanVisualizer2D: React.FC<PlanVisualizer2DProps> = ({ plan }) => {
  const colors = [
    '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ];

  const gridSize = 8;
  const cellSize = 40;

  // Create a grid representation
  const createGrid = () => {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    plan?.parcelles.forEach((parcelle, index) => {
      const color = parcelle.culture?.couleur || colors[index % colors.length];
      const startX = parcelle.proprietes?.grid_x || 0;
      const startY = parcelle.proprietes?.grid_y || 0;
      
      // Calculate how many cells this parcelle should occupy based on percentage
      const totalCells = gridSize * gridSize;
      const parcelleSize = Math.ceil((parcelle.pourcentage / 100) * totalCells);
      
      // Fill grid cells for this parcelle
      let cellsFilled = 0;
      for (let y = startY; y < gridSize && cellsFilled < parcelleSize; y++) {
        for (let x = startX; x < gridSize && cellsFilled < parcelleSize; x++) {
          if (grid[y] && grid[y][x] === null) {
            grid[y][x] = {
              culture: parcelle.culture?.nom || `Culture ${index + 1}`,
              color: color,
              percentage: parcelle.pourcentage
            };
            cellsFilled++;
          }
        }
      }
    });
    
    return grid;
  };

  const grid = createGrid();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 rounded-lg p-6">
      <div className="grid grid-cols-8 gap-1 mb-6" style={{ 
        width: gridSize * cellSize + (gridSize - 1) * 4,
        height: gridSize * cellSize + (gridSize - 1) * 4 
      }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="border border-border rounded transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? cell.color : '#f3f4f6',
                opacity: cell ? 0.8 : 0.3
              }}
              title={cell ? `${cell.culture} (${cell.percentage}%)` : 'Terrain libre'}
            >
              {cell && (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  {cell.percentage}%
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-md">
        {plan?.parcelles.map((parcelle, index) => (
          <div key={index} className="flex items-center gap-2 bg-card p-2 rounded-md shadow-sm">
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: parcelle.culture?.couleur || colors[index % colors.length] }}
            />
            <span className="text-xs font-medium text-card-foreground truncate">
              {parcelle.culture?.nom || `Culture ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanVisualizer2D;