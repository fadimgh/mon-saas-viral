import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// --- LE CORRECTIF MAGIQUE (Polyfill) ---
// On crée une fausse "DOMMatrix" pour que l'outil PDF arrête de se plaindre
if (!global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {};
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    let textToAnalyze = "";

    if (file) {
      // Importation sécurisée à l'intérieur de la fonction
      const pdf = require('pdf-parse'); 
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        const data = await pdf(buffer);
        textToAnalyze = data.text;
        
        // Vérification anti-scan (si vide, c'est une image)
        if (!textToAnalyze || textToAnalyze.trim().length < 5) {
            return NextResponse.json({ error: "Ce PDF semble être une image (scan). Veuillez utiliser un fichier avec du texte sélectionnable." }, { status: 400 });
        }

      } catch (e) {
        console.error("PDF Parsing Error:", e);
        return NextResponse.json({ error: "Le fichier PDF est illisible ou protégé." }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    // On coupe pour l'IA
    const truncatedText = textToAnalyze.substring(0, 15000);

    const systemPrompt = `You are "ScanMyContract", an expert AI Legal Auditor.
    Analyze the contract text provided below.
    Detect risks using these emojis: 🔴 (Critical), ⚠️ (Warning), ✅ (Safe).
    Output a bullet point list. Be concise.`;

    const userPrompt = `Analyze this: "${truncatedText}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });

  } catch (error) {
    console.error("Server Error:", error);
    // On renvoie l'erreur pour comprendre
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}