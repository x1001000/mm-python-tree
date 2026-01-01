/**
 * Gemini DJ Service - Now proxied through backend
 * API keys are securely stored on the server, not exposed to the client
 */

export const requestSongFromDJ = async (songName: string): Promise<{ message: string; audioUrl?: string }> => {
  try {
    // Call backend API instead of Gemini directly
    const response = await fetch('/api/dj/request-song', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get DJ response');
    }

    const data = await response.json();

    return {
      message: data.response || data.fallback || `Spinning up ${songName} just for you!`,
      // Audio URL could be added here in future enhancements
    };

  } catch (error) {
    console.error("Error asking DJ:", error);
    return {
      message: "DJ is taking a coffee break, but I'll add that to the queue!",
    };
  }
};