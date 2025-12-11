"use client";
import { useState, useEffect } from 'react';

// --- ICONS ---
const ShieldIcon = () => (
  <svg className="w-12 h-12 text-emerald-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 animate-pulse mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

export default function Home() {
  const [contractText, setContractText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');

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

  const runScan = async () => {
    if (!isVip && credits <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!contractText) return;

    setLoading(true);
    setAnalysis('');
    
    const steps = ["Initializing Scan...", "Detecting Hidden Clauses...", "Checking Legal Compliance...", "Finalizing Report..."];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText }),
      });
      const data = await res.json();
      if (data.result) {
        setAnalysis(data.result);
        if (!isVip) {
          const newCredits = credits - 1;
          setCredits(newCredits);
          localStorage.setItem('scanCredits', newCredits);
        }
      }
    } catch (error) {
      alert("Error scanning contract.");
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
            AI-powered contract audit. Detect traps, hidden fees, and dangerous clauses in seconds.
          </p>
        </div>

        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
          
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-950/50 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-xs text-slate-500 font-mono">contract_viewer.txt</span>
            </div>

            <textarea
              rows="10"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste your contract text here to audit..."
              className="w-full p-6 bg-transparent text-slate-300 placeholder-slate-600 outline-none resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={runScan}
            disabled={loading || !contractText}
            className="w-full mt-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="font-mono animate-pulse">{scanStep}</span>
            ) : (
              <>
                <SearchIcon /> SCAN FOR RISKS
              </>
            )}
          </button>
        </div>

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

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Maximum Risk Protection</h2>
            <p className="text-slate-400 mb-8 text-sm">
              You've used your free scans. Unlock unlimited audits and protect yourself from bad deals forever.
            </p>
            
            <a 
              href="https://stripe.com" 
              target="_blank"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all mb-6"
            >
              Unlock Unlimited Access ($29)
            </a>
            
            <div className="border-t border-slate-800 pt-6">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Have a code?</p>
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