"use client";
import { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const ShieldIcon = () => (
  <svg className="w-16 h-16 text-emerald-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const UploadIcon = () => (
  <svg className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
);
const FileIcon = () => (
  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const LockIcon = () => (
  <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

export default function Home() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  
  // Nouveau système : Pas de crédits, juste "Payé ou Pas"
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vipCodeInput, setVipCodeInput] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  // Vérifier si l'utilisateur a déjà payé dans le passé (pour ce navigateur)
  useEffect(() => {
    const unlocked = localStorage.getItem('scanUnlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 4 * 1024 * 1024) {
        alert("⚠️ Fichier trop volumineux ! La limite est de 4 Mo.");
        return;
      }
      setFile(selectedFile);
      setAnalysis(''); 
    }
  };

  const runScan = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis('');
    
    const steps = ["Reading Document...", "Detecting Traps...", "Calculating Risk Score...", "Generating Preview..."];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      
      if (data.result) {
        setAnalysis(data.result);
        // Scroll automatique vers le résultat
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVipCode = () => {
    // CODE SECRET POUR SIMULER LE PAIEMENT : "LEGAL2025"
    if (vipCodeInput.trim().toUpperCase() === "LEGAL2025") {
      setIsUnlocked(true);
      localStorage.setItem('scanUnlocked', 'true');
      setShowUnlockModal(false);
      alert("Rapport complet débloqué ! ✅");
    } else {
      alert("Code invalide.");
    }
  };

  // --- RENDER DU RAPPORT (AVEC LOGIQUE DE FLOUTAGE) ---
  const renderBlurredAnalysis = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // On cherche la première ligne "Intéressante" (Rouge ou Orange) à montrer
    let firstRiskIndex = lines.findIndex(l => l.includes('🔴') || l.includes('⚠️'));
    if (firstRiskIndex === -1) firstRiskIndex = 0; // Si pas de risque, on montre la 1ère ligne

    return lines.map((line, index) => {
      // 1. EST-CE QUE C'EST LA LIGNE "TEASER" (Visible) ?
      const isTeaserLine = index === firstRiskIndex;
      
      // 2. STYLE DE LA LIGNE
      let styleClass = "mb-3 p-4 rounded-r-lg flex items-start gap-3 border-l-4 ";
      
      if (line.includes('🔴')) {
        styleClass += "bg-red-950/30 border-red-500 text-red-200";
      } else if (line.includes('⚠️')) {
        styleClass += "bg-yellow-950/30 border-yellow-500 text-yellow-100/90";
      } else if (line.includes('✅')) {
        styleClass += "bg-emerald-950/30 border-emerald-500 text-emerald-100/80";
      } else {
        styleClass = "mb-2 text-slate-300 pl-2 font-light"; // Texte normal
      }

      // 3. LOGIQUE D'AFFICHAGE (Clair vs Flou)
      if (isUnlocked) {
        // --- CAS 1 : TOUT EST PAYÉ (Visible) ---
        return (
          <div key={index} className={styleClass}>
             {line} 
          </div>
        );
      } else {
        // --- CAS 2 : PAS PAYÉ (Mode Teaser) ---
        if (isTeaserLine) {
          // La seule ligne visible
          return (
            <div key={index} className={styleClass + " relative z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-700"}>
              <span className="absolute -top-3 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free Preview</span>
              {line}
            </div>
          );
        } else {
          // Les lignes floutées
          return (
            <div key={index} className={styleClass + " blur-md select-none opacity-50 grayscale"}>
              {line.replace(/[a-zA-Z]/g, "x")} {/* On remplace le texte pour qu'on ne puisse même pas deviner */}
            </div>
          );
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-slate-100">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="w-full border-b border-slate-800/60 px-6 py-5 flex justify-between items-center bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span className="font-bold text-xl tracking-tight text-white font-mono">ScanMyContract<span className="text-emerald-500">.ai</span></span>
        </div>
        {/* Pas de crédits, juste statut */}
        <div className="text-xs font-bold font-mono tracking-widest text-slate-400 border border-slate-700/50 px-4 py-1.5 rounded-full bg-slate-900/50">
          STATUS: <span className={isUnlocked ? "text-emerald-400" : "text-yellow-400"}>{isUnlocked ? "PREMIUM" : "FREE USER"}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center relative z-10">
        <div className="text-center mb-12">
          <ShieldIcon />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Instant Legal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Security Check.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Upload your PDF. See the risks instantly.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        <div className="w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-full bg-[#121623] border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
            
            <div 
              onClick={() => !loading && fileInputRef.current.click()}
              className={`bg-[#0F121D] rounded-xl border-2 border-dashed ${file ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/30'} transition-all cursor-pointer p-10 flex flex-col items-center justify-center min-h-[200px]`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <FileIcon />
                  <span className="font-mono text-emerald-400 mt-3 text-sm font-medium px-3 py-1 bg-emerald-950/50 rounded-full border border-emerald-900">{file.name}</span>
                  <p className="text-slate-500 text-xs mt-2">Click to change file</p>
                </div>
              ) : (
                <>
                  <UploadIcon />
                  <p className="text-slate-300 font-medium mt-4">Drop PDF Contract here</p>
                  <p className="text-slate-500 text-xs mt-2 uppercase tracking-wide">Max 4MB • Text PDF</p>
                </>
              )}
            </div>

            <button
              onClick={runScan}
              disabled={loading || !file}
              className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#0B0F19] font-black text-lg uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="font-mono animate-pulse flex items-center gap-2">{scanStep}</span>
              ) : (
                "SCAN NOW"
              )}
            </button>
          </div>
        </div>

        {/* RESULTS - AVEC PAYWALL INTEGRE */}
        {analysis && (
          <div ref={resultRef} className="w-full mt-16 animate-fade-in-up relative">
            <div className="flex items-center gap-4 mb-4">
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-900"></div>
               <span className="text-emerald-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">Analysis Results</span>
               <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-900"></div>
            </div>

            <div className="bg-[#0F121D] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Le contenu (partiellement flouté si pas payé) */}
              <div className="prose prose-invert max-w-none font-sans text-sm md:text-base leading-relaxed">
                {renderBlurredAnalysis(analysis)}
              </div>

              {/* OVERLAY DE PAIEMENT (Si pas débloqué) */}
              {!isUnlocked && (
                <div className="absolute inset-0 top-[100px] bg-gradient-to-b from-transparent via-[#0B0F19]/90 to-[#0B0F19] z-10 flex flex-col items-center justify-center pt-20">
                  <div className="bg-[#1a1f2e] border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm text-center mx-4 animate-bounce-in">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0B0F19]">
                      <LockIcon />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">3+ Critical Risks Found</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      We found risky clauses in your contract. Unlock the full report to see exactly where they are.
                    </p>
                    
                    <a 
                      href="https://stripe.com" // METS TON LIEN 5€ ICI
                      target="_blank"
                      onClick={() => setShowUnlockModal(true)} // Ouvre la case code après clic
                      className="block w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B0F19] font-bold text-lg mb-4 transition-transform hover:scale-105"
                    >
                      Unlock Full Report (5€)
                    </a>
                    
                    <p 
                      onClick={() => setShowUnlockModal(true)}
                      className="text-xs text-slate-500 underline cursor-pointer hover:text-white"
                    >
                      I already paid (Enter Code)
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* MODAL CODE VIP (Pour ceux qui ont payé) */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F121D] border border-slate-700 rounded-xl p-6 max-w-sm w-full relative">
            <button onClick={() => setShowUnlockModal(false)} className="absolute top-3 right-3 text-slate-500 hover:text-white">✕</button>
            <h3 className="font-bold text-white mb-4">Enter VIP Code</h3>
            <p className="text-xs text-slate-400 mb-4">Check your email after payment.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ex: LEGAL2025"
                value={vipCodeInput}
                onChange={(e) => setVipCodeInput(e.target.value)}
                className="flex-1 bg-[#05070a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
              <button 
                onClick={handleVipCode}
                className="bg-emerald-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-emerald-400"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}