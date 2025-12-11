"use client";
import { useState, useEffect } from 'react';

// --- ICONS ---
const StarIcon = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
);
const LockIcon = () => (
  <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
);

export default function Home() {
  const [review, setReview] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [tone, setTone] = useState('Professionnel et Empathique');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Gestion des crédits et VIP
  const [credits, setCredits] = useState(3);
  const [isVip, setIsVip] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [vipCodeInput, setVipCodeInput] = useState('');

  // Au chargement, on vérifie si l'utilisateur est déjà VIP ou ses crédits
  useEffect(() => {
    const vipStatus = localStorage.getItem('reviewSaviorVip');
    if (vipStatus === 'true') {
      setIsVip(true);
      setCredits(9999); // Illimité visuel
    } else {
      const savedCredits = localStorage.getItem('reviewSaviorCredits');
      if (savedCredits !== null) setCredits(parseInt(savedCredits));
    }
  }, []);

  const generateResponse = async () => {
    // Si pas VIP et plus de crédits -> Paywall
    if (!isVip && credits <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!review) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review, tone }),
      });
      const data = await res.json();
      if (data.result) {
        setResponse(data.result);
        
        // On décrémente SEULEMENT si pas VIP
        if (!isVip) {
          const newCredits = credits - 1;
          setCredits(newCredits);
          localStorage.setItem('reviewSaviorCredits', newCredits);
        }
      }
    } catch (error) {
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const copyAndGo = () => {
    navigator.clipboard.writeText(response);
    if (reviewLink) {
      window.open(reviewLink, '_blank');
    } else {
      alert("Lien copié !");
    }
  };

  const handleVipCode = () => {
    // C'EST ICI LE MOT DE PASSE SECRET : "PRO2025"
    if (vipCodeInput.trim().toUpperCase() === "PRO2025") {
      setIsVip(true);
      setCredits(9999);
      localStorage.setItem('reviewSaviorVip', 'true');
      setShowPaywall(false);
      alert("Code valide ! Accès illimité débloqué à vie. 🚀");
    } else {
      alert("Code invalide. Vérifiez votre mail.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-lg">FR</div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Fadi review</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <span>⚡ Crédits :</span>
            {isVip ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">ILLIMITÉ ♾️</span>
            ) : (
              <span className={credits === 0 ? "text-red-500 font-bold" : "text-blue-600 font-bold"}>{credits}</span>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        
        {/* COLONNE GAUCHE */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Transformez les avis négatifs en <span className="text-blue-600">clients fidèles.</span>
            </h1>
            <p className="text-lg text-slate-600">
              L'IA qui rédige des réponses parfaites aux critiques Google, TripAdvisor et Yelp en 3 secondes chrono.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="p-6 md:p-8 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Collez l'avis reçu</label>
                <textarea
                  rows="4"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Ex: Service trop long, plats froids..."
                  className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none resize-none text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lien vers l'avis (Optionnel)</label>
                <input
                  type="text"
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder="Ex: http://googleusercontent.com/..."
                  className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Choisissez votre stratégie</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Professionnel', 'Commercial', 'Ferme'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all ${
                        tone === t 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateResponse}
                disabled={loading || !review}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Rédaction intelligente...
                  </span>
                ) : "Générer la réponse ✨"}
              </button>

            </div>
          </div>

          {/* Result Section */}
          {response && (
            <div className="mt-8 animate-fade-in-up">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 relative shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-green-900">Réponse générée avec succès</h3>
                </div>
                <div className="prose prose-green text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-green-100">
                  {response}
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => navigator.clipboard.writeText(response)}
                    className="flex-1 py-3 bg-white border border-green-300 text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Copier
                  </button>
                  
                  {reviewLink && (
                    <button 
                      onClick={copyAndGo}
                      className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      Copier & Ouvrir Google
                      <ExternalLinkIcon />
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex text-yellow-400 mb-3">
              {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
            </div>
            <p className="text-slate-600 text-sm italic mb-4">
              "J'ai sauvé la note de mon restaurant grâce à cet outil. Les clients modifient souvent leur avis après une réponse aussi pro."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">ML</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Marc L.</p>
                <p className="text-xs text-slate-500">Restaurateur à Lyon</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-4">Pourquoi Fadi Review ?</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start"><CheckIcon /> <span>Calme les clients furieux</span></li>
              <li className="flex items-start"><CheckIcon /> <span>Améliore le référencement SEO</span></li>
              <li className="flex items-start"><CheckIcon /> <span>Gagne 2h par semaine</span></li>
            </ul>
          </div>
        </div>
      </main>

      {/* --- PAYWALL MODAL AVEC CODE VIP --- */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center animate-bounce-in">
            <LockIcon />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Passez à la vitesse supérieure</h2>
            <p className="text-slate-600 mb-6">
              Essais gratuits terminés. Débloquez l'illimité pour protéger votre réputation à vie.
            </p>
            
            <a 
              href="https://buy.stripe.com/..." // REMETS TON LIEN STRIPE ICI IMPERATIVEMENT
              target="_blank"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all mb-6"
            >
              Débloquer l'illimité (29€)
            </a>
            
            {/* SECTION CODE SECRET */}
            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-bold text-slate-700 mb-2">Vous avez déjà payé ?</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Entrez votre code VIP"
                  value={vipCodeInput}
                  onChange={(e) => setVipCodeInput(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
                <button 
                  onClick={handleVipCode}
                  className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                  Valider
                </button>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Satisfait ou remboursé sous 14 jours. Sans engagement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}