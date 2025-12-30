import React, { useState, useRef, useEffect } from 'react';
import { Wish, DecorationType } from '../types';
import WishCard from './WishCard';
import WishModal from './WishModal';
import { Speaker, AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';

interface WishTreeProps {
  wishes: Wish[];
  onAddWish: (wish: Omit<Wish, 'id' | 'createdAt'>) => void;
  onEditWish: (wish: Wish) => void;
  onDeleteWish: (id: string) => void;
  decorations: DecorationType[];
  onOpenMusicPlayer: () => void;
  onToggleLights: () => void;
}

const WishTree: React.FC<WishTreeProps> = ({
  wishes,
  onAddWish,
  onEditWish,
  onDeleteWish,
  decorations,
  onOpenMusicPlayer,
  onToggleLights,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [isRadioGlowing, setIsRadioGlowing] = useState(false);

  // Random glow effect for the radio/speaker
  useEffect(() => {
    const triggerRandomGlow = () => {
      setIsRadioGlowing(true);
      setTimeout(() => setIsRadioGlowing(false), 2000); // Match animation duration
    };

    // Initial glow after a short delay
    const initialTimeout = setTimeout(triggerRandomGlow, 3000);

    // Set up random interval for subsequent glows
    const scheduleNextGlow = () => {
      const randomDelay = 5000 + Math.random() * 10000; // 5-15 seconds
      return setTimeout(() => {
        triggerRandomGlow();
        glowInterval = scheduleNextGlow();
      }, randomDelay);
    };

    let glowInterval = scheduleNextGlow();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(glowInterval);
    };
  }, []);

  // Speaker trigger bounds (percentage-based)
  const speakerBounds = { left: 31, top: 67, width: 10, height: 8 };

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    position?: { x: number; y: number };
    editData?: Wish;
  }>({ isOpen: false });


  const handleTreeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Ignore clicks on UI elements
    if ((e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('.speaker-trigger') ||
        (e.target as HTMLElement).closest('.ui-control')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Block card placement in speaker area
    const inSpeakerArea =
      x >= speakerBounds.left &&
      x <= speakerBounds.left + speakerBounds.width &&
      y >= speakerBounds.top &&
      y <= speakerBounds.top + speakerBounds.height;

    if (inSpeakerArea) {
      return;
    }

    setModalState({
      isOpen: true,
      position: { x, y }
    });
  };

  const closeModal = () => setModalState({ isOpen: false });

  const handleSaveWish = (data: Omit<Wish, 'id' | 'createdAt'>) => {
    if (modalState.editData) {
      const updatedWish: Wish = {
        id: String(modalState.editData.id),
        createdAt: Number(modalState.editData.createdAt),
        message: String(data.message),
        author: String(data.author),
        color: String(data.color),
        x: Number(data.x),
        y: Number(data.y),
        password: data.password ? String(data.password) : (modalState.editData.password || ''),
      };
      onEditWish(updatedWish);
    } else {
      onAddWish(data);
    }
  };

  const handleRequestEdit = (wish: Wish) => {
    // Strictly reconstruction to avoid reference pollution
    const safeWish: Wish = {
        id: String(wish.id),
        x: Number(wish.x),
        y: Number(wish.y),
        message: String(wish.message),
        author: String(wish.author),
        color: String(wish.color),
        createdAt: Number(wish.createdAt),
        password: wish.password ? String(wish.password) : ''
    };
    
    setModalState({
      isOpen: true,
      editData: safeWish 
    });
  };

  const retryImageLoad = () => {
    setImgLoadError(false);
    setImageKey(Date.now());
  };

  const showLights = decorations.includes(DecorationType.LIGHTS);

  // Light positions matching the palm tree shape:
  // - Wide foliage canopy at top (5-45% vertical, spreading 10-90% horizontal)
  // - Narrow trunk below (45-75% vertical, centered 40-60% horizontal)
  const lightPositions = useRef(
    Array.from({ length: 30 }).map((_, i) => {
      let left: number, top: number;

      if (i < 24) {
        // 80% of lights on the foliage canopy (top portion)
        top = 5 + Math.random() * 40; // 5% to 45% from top
        // Canopy centered horizontally
        left = 25 + Math.random() * 50; // 25% to 75% horizontal
      } else {
        // 20% of lights on the trunk area
        top = 45 + Math.random() * 30; // 45% to 75% from top
        left = 40 + Math.random() * 20; // 40% to 60% (narrow trunk)
      }

      return {
        left: left + '%',
        top: top + '%',
        delay: Math.random() * 2 + 's',
        color: ['bg-yellow-200', 'bg-white', 'bg-red-300', 'bg-green-300', 'bg-blue-300'][Math.floor(Math.random() * 5)]
      };
    })
  ).current;

  const imageSrc = imageKey === 0 ? "image.png" : `image.png?t=${imageKey}`;

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[9/16] md:aspect-auto md:h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-gray-900 border-4 border-gray-800 group/tree">
      
      {/* Background/Tree Image */}
      <div 
        ref={containerRef}
        onClick={handleTreeClick}
        className="w-full h-full relative cursor-crosshair bg-gray-800 overflow-hidden"
      >
        {!imgLoadError ? (
          <img
            key={imageKey}
            src={imageSrc}
            alt="MM Python Tree"
            className="w-full h-full object-contain pointer-events-none select-none"
            onError={() => setImgLoadError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-800">
             <AlertCircle size={48} className="mb-4 text-gray-500" />
             <p className="mb-2">Tree image not found.</p>
             <p className="text-xs text-gray-500 mb-4">Expected file: <span className="font-mono bg-gray-700 px-1 rounded">image.png</span> in project root.</p>
             <button 
               onClick={retryImageLoad}
               className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
             >
               <RefreshCw size={18} />
               Retry Load
             </button>
          </div>
        )}


        {/* Overlay: Lights */}
        {showLights && !imgLoadError && (
          <div className="absolute inset-0 pointer-events-none">
            {lightPositions.map((pos, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 rounded-full shadow-[0_0_20px_8px_rgba(255,255,0,0.9)] ${pos.color} animate-twinkle`}
                style={{ left: pos.left, top: pos.top, animationDelay: pos.delay }}
              />
            ))}
          </div>
        )}


        {/* Wishes */}
        {wishes.map(wish => (
          <WishCard 
            key={wish.id} 
            wish={wish} 
            onEdit={handleRequestEdit}
            onDelete={(w) => onDeleteWish(w.id)}
          />
        ))}

        {/* Speaker trigger - positioned on the desk speaker */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenMusicPlayer();
          }}
          className="speaker-trigger absolute top-[67%] left-[31%] w-[10%] h-[8%] cursor-pointer z-10 group"
          title="Click to play music"
        >
          {/* Random glow effect */}
          {isRadioGlowing && (
            <div className="absolute inset-[-60%] rounded-full bg-pink-500/60 blur-xl animate-radio-glow pointer-events-none"></div>
          )}
          {/* Strong glow on hover */}
          <div className="absolute inset-[-50%] rounded-full bg-pink-500 opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-300"></div>
          <Speaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 text-white/0 group-hover:text-white" size={20} />
        </div>

        {/* Lights toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLights();
          }}
          className={`absolute bottom-[5%] left-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border z-20
            ${showLights
              ? 'bg-yellow-100/80 border-yellow-400 text-yellow-700'
              : 'bg-white/80 border-white/50 text-gray-500 hover:bg-white'}
          `}
        >
          <Lightbulb size={18} className={showLights ? 'fill-yellow-400' : ''} />
        </button>
      </div>

      {/* Modal */}
      <WishModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSave={handleSaveWish}
        initialData={modalState.editData}
        position={modalState.position}
      />
    </div>
  );
};

export default WishTree;