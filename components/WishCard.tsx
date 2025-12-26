import React, { useState } from 'react';
import { Wish } from '../types';
import { X, Edit2, Lock } from 'lucide-react';

interface WishCardProps {
  wish: Wish;
  onEdit: (wish: Wish) => void;
  onDelete: (wish: Wish) => void;
}

const WishCard: React.FC<WishCardProps> = ({ wish, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState<'edit' | 'delete' | null>(null);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [error, setError] = useState('');

  const handleAction = (type: 'edit' | 'delete') => {
    setShowPasswordInput(type);
    setPasswordAttempt('');
    setError('');
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wish.password && passwordAttempt !== wish.password) {
      setError('Wrong password');
      return;
    }

    // Success
    if (showPasswordInput === 'edit') {
      onEdit(wish);
    } else {
      onDelete(wish);
    }
    setShowPasswordInput(null);
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
      style={{ left: `${wish.x}%`, top: `${wish.y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPasswordInput(null);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* The Wish Card */}
      <div
        className={`
          relative p-2 rounded-lg shadow-lg cursor-pointer transition-all duration-300
          ${isHovered ? 'scale-110 z-30 opacity-100' : 'scale-100 opacity-50'}
          w-20 md:w-24 text-center text-[10px] md:text-xs
        `}
        style={{ backgroundColor: wish.color }}
      >
        <div className="font-christmas font-bold text-gray-800 text-xs md:text-sm mb-0.5 leading-tight line-clamp-2">
          {wish.message}
        </div>
        <div className="text-gray-600 font-semibold truncate text-[9px] md:text-[10px]">
          - {wish.author}
        </div>

        {/* Action Buttons (visible on hover) */}
        {isHovered && !showPasswordInput && (
          <div className="absolute -top-3 -right-3 flex space-x-1">
            <button 
              onClick={() => handleAction('edit')}
              className="bg-white p-1 rounded-full shadow hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <Edit2 size={12} />
            </button>
            <button 
              onClick={() => handleAction('delete')}
              className="bg-white p-1 rounded-full shadow hover:bg-red-100 text-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Password Modal (mini popup attached to card) */}
        {showPasswordInput && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-xl w-36 z-40 border border-gray-200">
            <form onSubmit={submitPassword} className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase">
                Enter Password
              </label>
              <input
                type="password"
                value={passwordAttempt}
                onChange={(e) => setPasswordAttempt(e.target.value)}
                className="w-full text-xs p-1 border rounded focus:outline-none focus:border-blue-500"
                placeholder="******"
                autoFocus
              />
              {error && <span className="text-[10px] text-red-500">{error}</span>}
              <div className="flex gap-1 justify-between">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordInput(null)}
                  className="text-[10px] text-gray-500 hover:text-gray-700 px-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded hover:bg-black"
                >
                  {showPasswordInput === 'edit' ? 'Edit' : 'Del'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* String hanging the card */}
      <div className="absolute top-0 left-1/2 w-px h-3 bg-gray-400 -translate-x-1/2 -translate-y-full opacity-50"></div>
    </div>
  );
};

export default WishCard;