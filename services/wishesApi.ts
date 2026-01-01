/**
 * Wishes API - Now proxied through backend server
 * JSONBin API keys are securely stored on the server, not exposed to the client
 *
 * Backend configuration (in .env.local on server):
 * - JSONBIN_API_KEY: Your JSONBin.io API key
 * - JSONBIN_BIN_ID: Your JSONBin.io bin ID
 */


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
  // Fetch all wishes from backend
  async getWishes(): Promise<Wish[]> {
    try {
      const response = await fetch('/api/wishes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 503) {
          console.warn('JSONBin not configured on backend, using localStorage');
          return [];
        }
        throw new Error(`Failed to fetch wishes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate and sanitize the wishes array
      const wishes = validateWishesArray(data.wishes || []);
      return wishes;
    } catch (error) {
      console.error('Error fetching wishes:', error);
      return [];
    }
  },

  // Save all wishes to backend
  async saveWishes(wishes: Wish[]): Promise<boolean> {
    // Validate wishes before sending
    const validWishes = validateWishesArray(wishes);
    if (validWishes.length !== wishes.length) {
      console.warn(`Filtered out ${wishes.length - validWishes.length} invalid wishes before saving`);
    }

    try {
      const response = await fetch('/api/wishes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wishes: validWishes }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          console.warn('JSONBin not configured on backend, using localStorage');
          return false;
        }
        throw new Error(`Failed to save wishes: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving wishes:', error);
      return false;
    }
  },
};
