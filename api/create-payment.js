export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { amount, annonceId, titre, vendeurEmail } = req.body;
    const commission = Math.round(amount * 0.08);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        annonce_id: String(annonceId),
        titre: titre || '',
        vendeur_email: vendeurEmail || '',
        commission: String(commission),
        montant_vendeur: String(amount - commission),
      },
      description: `Mecaz — ${titre}`,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      commission,
      montantVendeur: amount - commission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
