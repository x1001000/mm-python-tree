import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ControlsProps {
  showLights: boolean;
  toggleLights: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  showLights,
  toggleLights
}) => {
  return (
    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-40">
      <button
        onClick={toggleLights}
        className={`
          p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border
          ${showLights
            ? 'bg-yellow-100/80 border-yellow-400 text-yellow-700 shadow-yellow-200'
            : 'bg-white/80 border-white text-gray-500 hover:bg-gray-100'}
        `}
      >
        <Lightbulb size={20} className={showLights ? 'fill-yellow-400' : ''} />
      </button>
    </div>
  );
};

export default Controls;