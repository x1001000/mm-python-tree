// JSONBin.io configuration
// 1. Go to https://jsonbin.io and sign up (free)
// 2. Get your API key from Account Settings
// 3. Create a new bin with initial content: []
// 4. Copy the Bin ID
// 5. Add these to your .env.local file

const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || '';
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || '';
const BASE_URL = 'https://api.jsonbin.io/v3';


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

/**
 * Validate that a value is a valid Wish object
 */
function isValidWish(obj: any): obj is Wish {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.message === 'string' &&
    typeof obj.author === 'string' &&
    (obj.password === undefined || typeof obj.password === 'string') &&
    typeof obj.color === 'string' &&
    typeof obj.createdAt === 'number' &&
    // Additional validation
    obj.x >= 0 && obj.x <= 100 &&
    obj.y >= 0 && obj.y <= 100 &&
    obj.message.length <= 100 &&
    obj.author.length <= 20 &&
    obj.createdAt > 0
  );
}

/**
 * Sanitize and validate an array of wishes
 */
function validateWishesArray(data: any): Wish[] {
  if (!Array.isArray(data)) {
    console.warn('API response is not an array');
    return [];
  }

  // Filter and validate each wish
  return data.filter((item, index) => {
    if (!isValidWish(item)) {
      console.warn(`Invalid wish at index ${index}:`, item);
      return false;
    }
    return true;
  });
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
          'X-Master-Key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wishes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response structure');
      }

      // Validate and sanitize the wishes array
      const wishes = validateWishesArray(data.record || []);
      return wishes;
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

    // Validate wishes before sending
    const validWishes = validateWishesArray(wishes);
    if (validWishes.length !== wishes.length) {
      console.warn(`Filtered out ${wishes.length - validWishes.length} invalid wishes before saving`);
    }

    try {
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify(validWishes),
      });

      if (!response.ok) {
        throw new Error(`Failed to save wishes: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving wishes:', error);
      return false;
    }
  },
};
