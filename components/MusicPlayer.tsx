import React, { useState, useRef, useEffect } from 'react';
import { Disc, Music, Volume2, X, Search, Loader2 } from 'lucide-react';
import { requestSongFromDJ } from '../services/geminiService';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SONG_URL = '/Lady_Antebellum_2012_-_On_This_Winter_s_Night_-_A_Holly_Jolly_Christmas.mp3';

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSong, setCurrentSong] = useState('A Holly Jolly Christmas');
  const [requestQuery, setRequestQuery] = useState('');
  const [djMessage, setDjMessage] = useState('Welcome to MM Radio! Request a song below.');
  const [isSearching, setIsSearching] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Autoplay functionality handled carefully due to browser policies
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestQuery.trim()) return;

    setIsSearching(true);
    setDjMessage("DJ is searching the crates...");
    
    // Simulate finding logic and use Gemini for flavor
    const response = await requestSongFromDJ(requestQuery);
    
    setIsSearching(false);
    setDjMessage(response.message);
    
    // In a real implementation with a backend proxy, we would swap the src here.
    // For this frontend-only demo, we'll just update the title to pretend we found it
    // or provide a link if Gemini found one (which is rare without tools).
    setCurrentSong(requestQuery); 
    
    // Reset query
    setRequestQuery('');
    
    // Ensure it's playing
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-80 overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-pink-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wide">MM Radio 24/7</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* DJ Message */}
          <div className="bg-gray-800 rounded p-2 text-xs text-gray-300 italic border-l-2 border-pink-500">
            " {djMessage} "
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center shadow-inner ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
               <Disc size={48} className="text-gray-600" />
               <div className="absolute w-8 h-8 bg-pink-500 rounded-full opacity-20"></div>
            </div>
            
            <div className="text-center w-full">
              <h3 className="font-bold text-sm text-pink-300 truncate px-2">{currentSong}</h3>
              <p className="text-xs text-gray-500">Now Playing</p>
            </div>

            <div className="flex items-center gap-4 w-full justify-center mt-1">
               <button 
                 onClick={togglePlay}
                 className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-pink-500/20"
               >
                 {isPlaying ? (
                   <div className="flex gap-1 h-3">
                     <div className="w-1 bg-black animate-[bounce_1s_infinite]"></div>
                     <div className="w-1 bg-black animate-[bounce_1s_infinite_0.2s]"></div>
                     <div className="w-1 bg-black animate-[bounce_1s_infinite_0.4s]"></div>
                   </div>
                 ) : (
                   <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                 )}
               </button>
            </div>
            
            {/* Volume */}
            <div className="flex items-center gap-2 w-full px-4 mt-2">
              <Volume2 size={14} className="text-gray-400" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleRequestSubmit} className="relative mt-2">
            <input 
              type="text" 
              placeholder="Request a song..." 
              value={requestQuery}
              onChange={(e) => setRequestQuery(e.target.value)}
              className="w-full bg-gray-800 text-xs text-white p-2 pr-8 rounded-md border border-gray-700 focus:border-pink-500 focus:outline-none placeholder-gray-500"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </form>
          
          <div className="text-[10px] text-gray-600 text-center">
             Song finder powered by mp3.pm & Gemini
          </div>
        </div>
      </div>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={DEFAULT_SONG_URL} 
        loop
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPlayer;