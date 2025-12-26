export interface Wish {
  id: string;
  x: number; // Percentage relative to container width
  y: number; // Percentage relative to container height
  message: string;
  author: string;
  password?: string; // Stored in plain text for this demo (would be hashed in real backend)
  color: string;
  createdAt: number;
}

export interface SongRequest {
  query: string;
  status: 'pending' | 'playing' | 'failed';
  message?: string;
}

export enum DecorationType {
  LIGHTS = 'LIGHTS',
  GIFTS = 'GIFTS'
}