"use client";
import { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const ShieldIcon = () => (
  <svg className="w-12 h-12 text-emerald-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const UploadIcon = () => (
  <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
);
const FileIcon = () => (
  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

export default function Home() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const fileInputRef = useRef(null);

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
      setFile(e.target.files[0]);
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
    
    const steps = ["Reading PDF...", "Analyzing Clauses...", "Detecting Traps...", "Finalizing Report..."];
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
      
      if (data.result) {
        setAnalysis(data.result);
        if (!isVip) {
          const newCredits = credits - 1;
          setCredits(newCredits);
          localStorage.setItem('scanCredits', newCredits);
        }
      } else {
        alert("Error: Could not read this PDF.");
      }
    } catch (error) {
      alert("Error uploading file.");
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

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      <nav className="w-full border-b border-slate-800 px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-bold text-xl tracking-tight text-white">ScanMyContract</span>
        </div>
        <div className="text-sm font-medium text-slate-400 border border-slate-700 px-3 py-1 rounded-full">
          Scans left: <span className={credits === 0 ? "text-red-500" : "text-emerald-400"}>{isVip ? "UNLIMITED" : credits}</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
        
        <div className="text-center mb-10 max-w-2xl">
          <ShieldIcon />
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            Don't sign <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">blindly.</span>
          </h1>
          <p className="text-lg text-slate-400">
            Upload your PDF contract. AI detects traps, hidden fees, and dangerous clauses in seconds.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
          
          <div 
            onClick={() => fileInputRef.current.click()}
            className="bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50 transition-all cursor-pointer p-12 flex flex-col items-center justify-center group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf"
              className="hidden" 
            />
            
            {file ? (
              <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">
                <FileIcon />
                <span className="font-mono text-emerald-400">{file.name}</span>
              </div>
            ) : (
              <>
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <UploadIcon />
                </div>
                <p className="text-slate-400 font-medium mt-4">Click to upload PDF Contract</p>
                <p className="text-slate-600 text-xs mt-2">Maximum 5MB</p>
              </>
            )}
          </div>

          <button
            onClick={runScan}
            disabled={loading || !file}
            className="w-full mt-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="font-mono animate-pulse">{scanStep}</span>
            ) : (
              "START SECURITY SCAN"
            )}
          </button>
        </div>

        {/* RESULTS */}
        {analysis && (
          <div className="w-full mt-8 animate-fade-in-up">
            <div className="bg-black border border-slate-700 rounded-xl p-6 relative shadow-2xl">
               <div className="absolute top-0 right-0 bg-emerald-900/30 text-emerald-400 text-xs font-mono px-3 py-1 rounded-bl-xl border-l border-b border-emerald-900/50">
                AUDIT COMPLETE
              </div>
              <h3 className="text-emerald-500 font-mono font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <span>{'>'}_</span> REPORT GENERATED:
              </h3>
              <div className="prose prose-invert max-w-none text-slate-300 font-mono text-sm whitespace-pre-line leading-7">
                {analysis}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Maximum Risk Protection</h2>
            <p className="text-slate-400 mb-8 text-sm">
              Unlock unlimited PDF audits and protect yourself.
            </p>
            
            <a 
              href="https://buy.stripe.com/test_eVqbJ0df3afu6AS1ty7g400" // METS TON LIEN STRIPE ICI
              target="_blank"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg hover:shadow-lg transition-all mb-6"
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
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none font-mono"
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