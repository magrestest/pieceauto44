export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, to, data } = req.body;

    let subject, html;

    if (type === 'nouveau_message') {
      subject = `💬 Nouveau message sur Mecaz — ${data.titre}`;
      html = `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f0;padding:2rem">
          <div style="background:#0f0f0f;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem">
            <span style="color:#fff;font-size:20px;font-weight:500">Me<span style="color:#e8a020">caz</span></span>
          </div>
          <div style="background:#fff;border-radius:12px;padding:1.5rem;border:0.5px solid #e8e8e8">
            <h2 style="font-size:16px;font-weight:500;margin-bottom:8px;color:#1a1a1a">Tu as reçu un nouveau message</h2>
            <p style="font-size:14px;color:#888;margin-bottom:1rem">Concernant ton annonce : <strong style="color:#1a1a1a">${data.titre}</strong></p>
            <div style="background:#f9f9f7;border-radius:8px;padding:1rem;margin-bottom:1.25rem;border-left:3px solid #e8a020">
              <p style="font-size:13px;color:#555;margin:0;line-height:1.6">"${data.message}"</p>
            </div>
            <p style="font-size:13px;color:#aaa;margin-bottom:1.25rem">De : <strong style="color:#555">${data.expediteur}</strong></p>
            <a href="https://mecaz.fr" style="display:inline-block;background:#e8a020;color:#0f0f0f;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500">Répondre sur Mecaz</a>
          </div>
          <p style="font-size:12px;color:#bbb;text-align:center;margin-top:1rem">Mecaz · <a href="https://mecaz.fr/legal.html" style="color:#bbb">Se désabonner</a></p>
        </div>`;
    }

    else if (type === 'annonce_vendue') {
      subject = `✅ Ta pièce a été vendue — ${data.titre}`;
      html = `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f0;padding:2rem">
          <div style="background:#0f0f0f;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem">
            <span style="color:#fff;font-size:20px;font-weight:500">Me<span style="color:#e8a020">caz</span></span>
          </div>
          <div style="background:#fff;border-radius:12px;padding:1.5rem;border:0.5px solid #e8e8e8">
            <h2 style="font-size:16px;font-weight:500;margin-bottom:8px;color:#1a1a1a">🎉 Ta pièce a été vendue !</h2>
            <p style="font-size:14px;color:#888;margin-bottom:1rem">Annonce : <strong style="color:#1a1a1a">${data.titre}</strong></p>
            <div style="background:#eaf3de;border-radius:8px;padding:1rem;margin-bottom:1.25rem">
              <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span style="color:#555">Prix de vente</span><span style="font-weight:500">${data.prix} €</span></div>
              <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span style="color:#555">Commission Mecaz (8%)</span><span style="color:#e8a020">-${data.commission} €</span></div>
              <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:500;border-top:0.5px solid #c0d890;padding-top:8px;margin-top:4px"><span>Tu reçois</span><span style="color:#3b6d11">${data.montantVendeur} €</span></div>
            </div>
            <p style="font-size:13px;color:#888;margin-bottom:1.25rem">Le virement sera effectué sous 3 à 5 jours ouvrés sur ton compte bancaire.</p>
            <a href="https://mecaz.fr" style="display:inline-block;background:#0f0f0f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500">Voir mes ventes</a>
          </div>
          <p style="font-size:12px;color:#bbb;text-align:center;margin-top:1rem">Mecaz · <a href="https://mecaz.fr/legal.html" style="color:#bbb">Mentions légales</a></p>
        </div>`;
    }

    else if (type === 'achat_confirme') {
      subject = `🔧 Achat confirmé — ${data.titre}`;
      html = `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f0;padding:2rem">
          <div style="background:#0f0f0f;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem">
            <span style="color:#fff;font-size:20px;font-weight:500">Me<span style="color:#e8a020">caz</span></span>
          </div>
          <div style="background:#fff;border-radius:12px;padding:1.5rem;border:0.5px solid #e8e8e8">
            <h2 style="font-size:16px;font-weight:500;margin-bottom:8px;color:#1a1a1a">✅ Ton achat est confirmé !</h2>
            <p style="font-size:14px;color:#888;margin-bottom:1rem">Pièce achetée : <strong style="color:#1a1a1a">${data.titre}</strong></p>
            <div style="background:#f9f9f7;border-radius:8px;padding:1rem;margin-bottom:1.25rem;border:0.5px solid #e8e8e8">
              <div style="font-size:14px;color:#555;margin-bottom:4px">Montant payé : <strong>${data.prix} €</strong></div>
              <div style="font-size:13px;color:#aaa">Vendeur : ${data.vendeur} · ${data.ville}</div>
            </div>
            <p style="font-size:13px;color:#888;margin-bottom:1.25rem">Contacte le vendeur pour organiser la récupération de ta pièce. Tu as 14 jours pour exercer ton droit de rétractation.</p>
            <a href="https://mecaz.fr" style="display:inline-block;background:#e8a020;color:#0f0f0f;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500">Contacter le vendeur</a>
          </div>
          <p style="font-size:12px;color:#bbb;text-align:center;margin-top:1rem">Mecaz · <a href="https://mecaz.fr/legal.html" style="color:#bbb">Mentions légales</a></p>
        </div>`;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Mecaz <notifications@mecaz.fr>',
        to: [to],
        subject,
        html
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Erreur Resend');
    res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
