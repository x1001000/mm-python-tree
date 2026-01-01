import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Rate limiting configuration
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
  }

  userLimit.count++;
  rateLimitMap.set(ip, userLimit);

  return userLimit.count <= MAX_REQUESTS_PER_WINDOW;
}

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini DJ endpoint
app.post('/api/dj/request-song', async (req, res) => {
  try {
    const { songName } = req.body;

    if (!songName || typeof songName !== 'string') {
      return res.status(400).json({ error: 'Song name is required' });
    }

    // Validate input
    if (songName.length > 100) {
      return res.status(400).json({ error: 'Song name too long' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy-key') {
      return res.status(503).json({
        error: 'Gemini API not configured',
        fallback: `🎵 Now playing: ${songName}! Great choice!`
      });
    }

    const genai = new GoogleGenAI({ apiKey });
    const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a fun, enthusiastic radio DJ at a festive wish tree celebration!
Someone just requested the song: "${songName}"

Give a short, energetic 1-2 sentence intro for this song as if you're about to play it on the radio.
Be creative and match the vibe of the song title. Keep it under 50 words.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'Failed to get DJ response',
      fallback: `🎵 Playing ${req.body.songName} for you!`
    });
  }
});

// JSONBin - Get wishes endpoint
app.get('/api/wishes', async (req, res) => {
  try {
    const apiKey = process.env.JSONBIN_API_KEY;
    const binId = process.env.JSONBIN_BIN_ID;

    if (!apiKey || !binId) {
      return res.status(503).json({ error: 'JSONBin not configured' });
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        'X-Master-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ wishes: data.record || [] });
  } catch (error) {
    console.error('Error fetching wishes:', error);
    res.status(500).json({ error: 'Failed to fetch wishes' });
  }
});

// JSONBin - Save wishes endpoint
app.put('/api/wishes', async (req, res) => {
  try {
    const { wishes } = req.body;

    if (!Array.isArray(wishes)) {
      return res.status(400).json({ error: 'Wishes must be an array' });
    }

    // Validate wishes array size (prevent abuse)
    if (wishes.length > 1000) {
      return res.status(400).json({ error: 'Too many wishes' });
    }

    const apiKey = process.env.JSONBIN_API_KEY;
    const binId = process.env.JSONBIN_BIN_ID;

    if (!apiKey || !binId) {
      return res.status(503).json({ error: 'JSONBin not configured' });
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
      },
      body: JSON.stringify(wishes),
    });

    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving wishes:', error);
    res.status(500).json({ error: 'Failed to save wishes' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎄 Backend server running on http://localhost:${PORT}`);
  console.log(`🔒 API keys secured on backend`);
  console.log(`✅ CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
