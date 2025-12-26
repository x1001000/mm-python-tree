// JSONBin.io configuration
// 1. Go to https://jsonbin.io and sign up (free)
// 2. Get your API key from Account Settings
// 3. Create a new bin with initial content: []
// 4. Copy the Bin ID
// 5. Add these to your .env.local file

const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || '';
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || '';
const BASE_URL = 'https://api.jsonbin.io/v3';

console.log('JSONBin config:', { hasApiKey: !!API_KEY, hasBinId: !!BIN_ID, binId: BIN_ID });

export interface Wish {
  id: string;
  x: number;
  y: number;
  message: string;
  author: string;
  password?: string;
  color: string;
  createdAt: number;
}

export const wishesApi = {
  // Fetch all wishes
  async getWishes(): Promise<Wish[]> {
    if (!API_KEY || !BIN_ID) {
      console.warn('JSONBin not configured, using localStorage');
      return [];
    }

    try {
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}/latest`, {
        headers: {
          'X-Access-Key': API_KEY,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch wishes');

      const data = await response.json();
      return data.record || [];
    } catch (error) {
      console.error('Error fetching wishes:', error);
      return [];
    }
  },

  // Save all wishes
  async saveWishes(wishes: Wish[]): Promise<boolean> {
    if (!API_KEY || !BIN_ID) {
      console.warn('JSONBin not configured, using localStorage');
      return false;
    }

    try {
      console.log('Saving to JSONBin...', wishes);
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': API_KEY,
        },
        body: JSON.stringify(wishes),
      });

      const data = await response.json();
      console.log('JSONBin save response:', response.ok, data);

      return response.ok;
    } catch (error) {
      console.error('Error saving wishes:', error);
      return false;
    }
  },
};
