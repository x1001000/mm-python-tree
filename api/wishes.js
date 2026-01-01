// Vercel Serverless Function for /api/wishes
// Handles GET (fetch) and PUT (save) wishes

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.JSONBIN_API_KEY;
  const binId = process.env.JSONBIN_BIN_ID;

  if (!apiKey || !binId) {
    return res.status(503).json({ error: 'JSONBin not configured' });
  }

  try {
    if (req.method === 'GET') {
      // Fetch wishes from JSONBin
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`JSONBin API error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ wishes: data.record || [] });

    } else if (req.method === 'PUT') {
      // Save wishes to JSONBin
      const { wishes } = req.body;

      if (!Array.isArray(wishes)) {
        return res.status(400).json({ error: 'Wishes must be an array' });
      }

      if (wishes.length > 1000) {
        return res.status(400).json({ error: 'Too many wishes' });
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

      return res.status(200).json({ success: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wishes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
