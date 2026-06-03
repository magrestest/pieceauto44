export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { image, mediaType } = req.body;
  
  // Test : retourne juste si la clé API est présente
  const keyPresent = !!process.env.ANTHROPIC_API_KEY;
  const bodyOk = !!image && !!mediaType;
  
  return res.status(200).json({ 
    test: true, 
    keyPresent, 
    bodyOk,
    mediaType: mediaType || 'missing'
  });
}
