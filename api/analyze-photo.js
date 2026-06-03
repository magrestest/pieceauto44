const fetch = require('node-fetch');
export default async function handler(req, res) {
  console.log('analyze-photo called', req.method);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { image, mediaType } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: `Tu es un expert en pièces automobiles d'occasion. Analyse cette photo et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks) avec ces champs: {"titre": "nom court de la pièce en français", "categorie": "une valeur parmi: Moteur, Carrosserie, Électronique, Suspension, Freinage, Transmission, Autre", "etat": "une valeur parmi: Occasion — bon état, Occasion — à vérifier, Neuf, Pour pièces", "description": "description courte 1-2 phrases", "prix_min": nombre entier euros, "prix_max": nombre entier euros, "prix_suggere": nombre entier euros}` }
          ]
        }]
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));
    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'Réponse inattendue', raw: data });
    }
    res.status(200).json({ result: data.content[0].text });
  } catch(e) {
    console.log('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
