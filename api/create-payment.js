const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, annonceId, titre, vendeurEmail } = req.body;

    // Commission 8%
    const commission = Math.round(amount * 0.08);
    const total = amount; // montant total payé par l'acheteur

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // en centimes
      currency: 'eur',
      metadata: {
        annonce_id: annonceId,
        titre: titre,
        vendeur_email: vendeurEmail,
        commission: commission,
        montant_vendeur: total - commission,
      },
      description: `Mecaz — ${titre}`,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      commission,
      montantVendeur: total - commission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
