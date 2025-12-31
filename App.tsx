import React, { useState, useEffect, useRef } from 'react';
import WishTree from './components/WishTree';
import MusicPlayer from './components/MusicPlayer';
import { Wish, DecorationType } from './types';
import { wishesApi } from './services/wishesApi';
import { v4 as uuidv4 } from 'uuid'; 

// Helper to strictly sanitize a wish object
const sanitizeWish = (w: any): Wish => {
  return {
    id: String(w.id || uuidv4()),
    createdAt: Number(w.createdAt || Date.now()),
    message: String(w.message || ''),
    author: String(w.author || ''),
    color: String(w.color || '#fff'),
    x: Number(w.x ?? 50),
    y: Number(w.y ?? 50),
    password: w.password ? String(w.password) : '',
  };
};

// Safe stringify to handle circular refs and DOM nodes if they sneak in
const safeStringify = (obj: any) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    // Filter out DOM nodes and Events explicitly
    if (value && (
        (typeof value === 'object' && value instanceof Node) || 
        (typeof value === 'object' && value.nativeEvent instanceof Event) || // React synthetic events
        (value instanceof Event)
      )) {
      return undefined; 
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  });
};

const App: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [decorations, setDecorations] = useState<DecorationType[]>([DecorationType.LIGHTS]);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load wishes from API on mount
  useEffect(() => {
    const loadWishes = async () => {
      try {
        const apiWishes = await wishesApi.getWishes();
        if (apiWishes.length > 0) {
          setWishes(apiWishes.map(sanitizeWish));
        } else {
          // Fallback to localStorage
          const savedWishes = localStorage.getItem('mm-wishes');
          if (savedWishes) {
            const parsed = JSON.parse(savedWishes);
            if (Array.isArray(parsed)) {
              setWishes(parsed.map(sanitizeWish));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load wishes", e);
      }
      setIsLoaded(true);
    };
    loadWishes();
  }, []);

  // Save wishes to API (debounced) and localStorage
  useEffect(() => {
    if (!isLoaded) return;

    const cleanWishes = wishes.map(sanitizeWish);

    // Always save to localStorage as backup
    try {
      localStorage.setItem('mm-wishes', safeStringify(cleanWishes));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }

    // Debounce API saves to avoid too many requests
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      wishesApi.saveWishes(cleanWishes);
    }, 500);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [wishes, isLoaded]);

  const addWish = (data: Omit<Wish, 'id' | 'createdAt'>) => {
    const newWish = sanitizeWish({
      ...data,
      id: uuidv4(),
      createdAt: Date.now()
    });
    setWishes(prev => [...prev, newWish]);
  };

  const editWish = (updatedWish: Wish) => {
    const cleanWish = sanitizeWish(updatedWish);
    setWishes(prev => prev.map(w => w.id === cleanWish.id ? cleanWish : w));
  };

  const deleteWish = (id: string) => {
    setWishes(prev => prev.filter(w => w.id !== id));
  };

  const toggleDecoration = (type: DecorationType) => {
    setDecorations(prev => 
      prev.includes(type) 
        ? prev.filter(d => d !== type) 
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center py-8 px-4 font-sans text-gray-800 relative overflow-hidden">
      
      {/* Header */}
      <header className="mb-6 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-christmas font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 drop-shadow-md">
          MM Python Tree
        </h1>
      </header>

      {/* Main Stage */}
      <main className="w-full flex-grow flex justify-center items-center z-10">
        <WishTree
          wishes={wishes}
          onAddWish={addWish}
          onEditWish={editWish}
          onDeleteWish={deleteWish}
          decorations={decorations}
          onOpenMusicPlayer={() => setIsMusicPlayerOpen(true)}
          onToggleLights={() => toggleDecoration(DecorationType.LIGHTS)}
        />
      </main>


      <MusicPlayer 
        isOpen={isMusicPlayerOpen} 
        onClose={() => setIsMusicPlayerOpen(false)} 
      />

      {/* Footer */}
      <footer className="mt-8 text-gray-500 text-xs text-center z-10">
        <p>© {new Date().getFullYear()} MacroMicro. Built with ❤️ for MMers.</p>
      </footer>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20"></div>
    </div>
  );
};

export default App;