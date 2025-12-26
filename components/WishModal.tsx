import React, { useState, useEffect } from 'react';
import { Wish } from '../types';

interface WishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wishData: Omit<Wish, 'id' | 'createdAt'>) => void;
  initialData?: Partial<Wish>;
  position?: { x: number; y: number };
}

const COLORS = [
  '#FFB7B2', // Pastel Red
  '#FFDAC1', // Pastel Orange
  '#E2F0CB', // Pastel Green
  '#B5EAD7', // Pastel Mint
  '#C7CEEA', // Pastel Purple
  '#FFF2CC', // Pastel Yellow
];

const WishModal: React.FC<WishModalProps> = ({ isOpen, onClose, onSave, initialData, position }) => {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMessage(initialData.message || '');
        setAuthor(initialData.author || '');
        setColor(initialData.color || COLORS[0]);
        // Password not pre-filled for security (even in this demo)
        setPassword(''); 
      } else {
        setMessage('');
        setAuthor('');
        setPassword('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !author.trim()) return;

    onSave({
      message,
      author,
      password,
      color,
      x: initialData?.x ?? position?.x ?? 50,
      y: initialData?.y ?? position?.y ?? 50,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="bg-white/50 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white/50 border border-white/30 rounded-lg p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none h-16 placeholder-gray-500"
            placeholder="Your wish..."
            maxLength={100}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-white/50 border border-white/30 rounded-lg p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none placeholder-gray-500"
              placeholder="Name"
              maxLength={20}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-white/30 rounded-lg p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none placeholder-gray-500"
              placeholder="Password"
            />
          </div>

          <div className="flex gap-1.5 justify-center">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-600 scale-110' : 'border-white/50'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 text-sm border border-white/30 rounded-lg text-gray-700 hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 text-sm bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors"
            >
              Hang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WishModal;