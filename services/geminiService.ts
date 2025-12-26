import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

export const requestSongFromDJ = async (songName: string): Promise<{ message: string; audioUrl?: string }> => {
  try {
    const ai = getClient();
    
    // We are simulating a search here since we can't scrape mp3.pm directly from client-side easily without CORS.
    // However, we will use Gemini to generate a fun DJ response.
    const prompt = `
      You are a festive virtual DJ for a company called MacroMicro (MM). 
      The user wants to request the song: "${songName}".
      
      Please respond with a short, fun, enthusiastic DJ intro for this song.
      Mention that you are looking for it on the "MM Python Tree" playlist.
      Keep it under 30 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const djMessage = response.text || `Spinning up ${songName} just for you!`;
    
    // In a real app with backend, we would scrape mp3.pm here.
    // For this demo, we will return the message and let the frontend simulate the "switch" 
    // or keep playing the default if no real URL is found.
    return {
      message: djMessage,
      // Ideally we would return a new URL here. 
      // Since we can't reliably get a hotlinkable MP3 from mp3.pm via pure frontend + LLM without proxy:
      // We will leave url undefined to signal "keep playing default but pretend" 
      // OR if the user enters a direct link, we could use it.
    };

  } catch (error) {
    console.error("Error asking DJ:", error);
    return {
      message: "DJ is taking a coffee break, but I'll add that to the queue!",
    };
  }
};