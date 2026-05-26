// ── STRIPE PAYMENT ─────────────────────────────────────────
// Ce fichier gère tout le système de paiement Mecaz
// Ne pas supprimer — requis pour le bouton "Acheter maintenant"

let stripeInstance=null,cardElement=null,currentAnnonce=null;

function initStripe(){
  if(!stripeInstance)stripeInstance=Stripe(STRIPE_PUBLIC_KEY);
}

async function openPayment(annonce){
  if(!currentUser){showView('auth');return}
  if(annonce.profiles?.id===currentUser.id){alert('Tu ne peux pas acheter ta propre annonce.');return}
  initStripe();currentAnnonce=annonce;
  const prix=annonce.prix,commission=Math.round(prix*0.08*100)/100;
  document.getElementById('pay-titre').textContent=annonce.titre;
  document.getElementById('pay-detail').textContent=annonce.ville+' · '+(annonce.marque||'')+' '+(annonce.modele||'');
  document.getElementById('pay-prix').textContent=prix.toFixed(2)+' €';
  document.getElementById('pay-commission').textContent=commission.toFixed(2)+' €';
  document.getElementById('pay-total').textContent=prix.toFixed(2)+' €';
  document.getElementById('payment-modal').style.display='flex';
  if(!cardElement){
    const el=stripeInstance.elements();
    cardElement=el.create('card',{style:{base:{fontSize:'15px',color:'#1a1a1a','::placeholder':{color:'#aaa'}}}});
    cardElement.mount('#card-element');
    cardElement.on('change',e=>{
      const err=document.getElementById('card-errors');
      if(e.error){err.textContent=e.error.message;err.style.display='block'}
      else err.style.display='none';
    });
  }
}

function closePayment(){
  document.getElementById('payment-modal').style.display='none';
}

async function confirmPayment(){
  if(!currentAnnonce||!cardElement)return;
  const btn=document.getElementById('pay-btn');
  btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Traitement...';
  try{
    const res=await fetch('/api/create-payment',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        amount:Math.round(currentAnnonce.prix*100),
        annonceId:currentAnnonce.id,
        titre:currentAnnonce.titre,
        vendeurEmail:''
      })
    });
    const{clientSecret,error:apiErr}=await res.json();
    if(apiErr)throw new Error(apiErr);
    const{error,paymentIntent}=await stripeInstance.confirmCardPayment(clientSecret,{
      payment_method:{card:cardElement}
    });
    if(error){
      document.getElementById('card-errors').textContent=error.message;
      document.getElementById('card-errors').style.display='block';
    } else if(paymentIntent.status==='succeeded'){
      closePayment();
      alert('✅ Paiement réussi ! Le vendeur va être contacté.');
      await sb.from('annonces').update({active:false}).eq('id',currentAnnonce.id);
      // Email vendeur
      const{data:vendeurProfile}=await sb.from('profiles').select('*').eq('id',currentSellerId).single();
      if(vendeurProfile?.email){
        sendEmailNotif('annonce_vendue',vendeurProfile.email,{
          titre:currentAnnonce.titre,
          prix:currentAnnonce.prix,
          commission:Math.round(currentAnnonce.prix*0.08*100)/100,
          montantVendeur:(currentAnnonce.prix*0.92).toFixed(2)
        });
      }
      // Email acheteur
      if(currentUser?.email){
        sendEmailNotif('achat_confirme',currentUser.email,{
          titre:currentAnnonce.titre,
          prix:currentAnnonce.prix,
          vendeur:vendeurProfile?.name||'—',
          ville:currentAnnonce.ville
        });
      }
      loadAnnonces();
    }
  }catch(e){
    document.getElementById('card-errors').textContent=e.message;
    document.getElementById('card-errors').style.display='block';
  }
  btn.disabled=false;btn.innerHTML='<i class="ti ti-lock"></i> Payer en sécurité';
}
