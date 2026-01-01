// Vercel Serverless Function for /api/dj/request-song
// Handles POST requests for DJ song requests via Gemini AI

import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { songName } = req.body;

    if (!songName || typeof songName !== 'string') {
      return res.status(400).json({ error: 'Song name is required' });
    }

    if (songName.length > 100) {
      return res.status(400).json({ error: 'Song name too long' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        response: `🎵 Now playing: ${songName}! Great choice!`
      });
    }

    const genai = new GoogleGenAI({ apiKey });

    const prompt = `You are a fun, enthusiastic radio DJ at a festive wish tree celebration!
Someone just requested the song: "${songName}"

Give a short, energetic 1-2 sentence intro for this song as if you're about to play it on the radio.
Be creative and match the vibe of the song title. Keep it under 50 words.`;

    const result = await genai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    const response = result.text;

    return res.status(200).json({ response });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(200).json({
      response: `🎵 Playing ${req.body?.songName || 'your song'} for you!`
    });
  }
}
