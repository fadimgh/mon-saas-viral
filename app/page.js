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

export default function Home() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const fileInputRef = useRef(null);
  const resultRef = useRef(null); // Pour scroller vers le résultat

  const [credits, setCredits] = useState(3);
  const [isVip, setIsVip] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [vipCodeInput, setVipCodeInput] = useState('');

  useEffect(() => {
    const vip = localStorage.getItem('scanVip');
    if (vip === 'true') {
      setIsVip(true);
      setCredits(999);
    } else {
      const saved = localStorage.getItem('scanCredits');
      if (saved !== null) setCredits(parseInt(saved));
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
      setAnalysis(''); // Reset result on new file
    }
  };

  const runScan = async () => {
    if (!isVip && credits <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!file) return;

    setLoading(true);
    setAnalysis('');
    
    // Animation séquencée
    const steps = ["Reading Document Structure...", "Scanning for Legal Traps...", "Analyzing Liability Clauses...", "Generating Security Report..."];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(r => setTimeout(r, 800));
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
        if (!isVip) {
          const newCredits = credits - 1;
          setCredits(newCredits);
          localStorage.setItem('scanCredits', newCredits);
        }
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
    if (vipCodeInput.trim().toUpperCase() === "LEGAL2025") {
      setIsVip(true);
      setCredits(999);
      localStorage.setItem('scanVip', 'true');
      setShowPaywall(false);
      alert("Unlimited Access Unlocked! 🛡️");
    } else {
      alert("Invalid code.");
    }
  };

  // FONCTION POUR RENDRE LE TEXTE JOLI (Parser)
  const renderFormattedAnalysis = (text) => {
    return text.split('\n').map((line, index) => {
      // Nettoyage des lignes vides inutiles
      if (!line.trim()) return <div key={index} className="h-2"></div>;

      // Style pour les Risques CRITIQUES (Rouge)
      if (line.includes('🔴')) {
        return (
          <div key={index} className="mb-3 p-4 bg-red-950/30 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 transform transition-all hover:scale-[1.01]">
            <span className="text-xl">🔴</span>
            <span className="text-red-200 font-medium leading-relaxed">{line.replace('🔴', '').trim()}</span>
          </div>
        );
      }
      
      // Style pour les Avertissements (Jaune)
      if (line.includes('⚠️')) {
        return (
          <div key={index} className="mb-3 p-4 bg-yellow-950/30 border-l-4 border-yellow-500 rounded-r-lg flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span className="text-yellow-100/90 leading-relaxed">{line.replace('⚠️', '').trim()}</span>
          </div>
        );
      }

      // Style pour les Points Positifs (Vert)
      if (line.includes('✅')) {
        return (
          <div key={index} className="mb-3 p-3 bg-emerald-950/30 border-l-4 border-emerald-500 rounded-r-lg flex items-start gap-3 opacity-80">
            <span className="text-xl">✅</span>
            <span className="text-emerald-100/80 italic">{line.replace('✅', '').trim()}</span>
          </div>
        );
      }

      // Texte normal (Bullet points ou paragraphes)
      return (
        <div key={index} className="mb-2 text-slate-300 pl-2 leading-relaxed font-light">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* BACKGROUND EFFETS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="w-full border-b border-slate-800/60 px-6 py-5 flex justify-between items-center bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-mono">ScanMyContract<span className="text-emerald-500">.ai</span></span>
        </div>
        <div className="text-xs font-bold font-mono tracking-widest text-slate-400 border border-slate-700/50 px-4 py-1.5 rounded-full bg-slate-900/50">
          CREDITS: <span className={credits === 0 ? "text-red-400" : "text-emerald-400"}>{isVip ? "∞" : credits}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center relative z-10">
        <div className="text-center mb-12">
          <ShieldIcon />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Don't sign <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">blindly.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            AI Legal Audit. Detect traps, hidden fees, and toxic clauses in your PDF contracts instantly.
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
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf"
                className="hidden" 
              />
              
              {file ? (
                <div className="flex flex-col items-center animate-fade-in">
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
              className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#0B0F19] font-black text-lg uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="font-mono animate-pulse flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   {scanStep}
                </span>
              ) : (
                "START SCAN"
              )}
            </button>
          </div>
        </div>

        {/* RESULTS - NEW DESIGN */}
        {analysis && (
          <div ref={resultRef} className="w-full mt-16 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-900"></div>
               <span className="text-emerald-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">Audit Report Generated</span>
               <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-900"></div>
            </div>

            <div className="bg-[#0F121D] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              {/* Effet Scan Top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-gradient-x"></div>
              
              <div className="font-mono text-sm mb-6 flex justify-between items-end border-b border-slate-800 pb-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-slate-500 text-xs uppercase">File</span>
                    <span className="text-slate-200">{file?.name}</span>
                 </div>
                 <div className="flex flex-col gap-1 text-right">
                    <span className="text-slate-500 text-xs uppercase">Status</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-2 justify-end">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      ANALYSIS COMPLETE
                    </span>
                 </div>
              </div>

              {/* CONTENU DU RESULTAT RENDU JOLI */}
              <div className="prose prose-invert max-w-none text-slate-300 font-sans text-sm md:text-base leading-relaxed">
                {renderFormattedAnalysis(analysis)}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-xs italic">
                  * This is an automated AI analysis. It does not replace a human lawyer.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-md"></div>
          <div className="bg-[#0F121D] border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center animate-bounce-in">
            <h2 className="text-2xl font-bold text-white mb-2">Maximum Risk Protection</h2>
            <p className="text-slate-400 mb-8 text-sm">
              You've reached the limit. Unlock unlimited PDF audits instantly.
            </p>
            
            <a 
              href="https://stripe.com" // METS TON LIEN STRIPE ICI
              target="_blank"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#0B0F19] font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all mb-6"
            >
              Unlock Unlimited Access ($29)
            </a>
            
            <div className="border-t border-slate-800 pt-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="VIP Code"
                  value={vipCodeInput}
                  onChange={(e) => setVipCodeInput(e.target.value)}
                  className="flex-1 bg-[#05070a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none font-mono"
                />
                <button 
                  onClick={handleVipCode}
                  className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-700 border border-slate-700"
                >
                  UNLOCK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}