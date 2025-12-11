import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // Importation sécurisée pour Vercel
    const pdf = require('pdf-parse'); 

    const formData = await req.formData();
    const file = formData.get('file');

    let textToAnalyze = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        const data = await pdf(buffer);
        textToAnalyze = data.text;
        
        // VÉRIFICATION CRITIQUE : Si le texte est vide, c'est un scan !
        if (!textToAnalyze || textToAnalyze.trim().length < 10) {
            return NextResponse.json({ error: "Ce PDF est une image (scan). Veuillez utiliser un PDF avec du texte sélectionnable." }, { status: 400 });
        }

      } catch (e) {
        console.error("PDF Error:", e);
        return NextResponse.json({ error: "Le fichier PDF est illisible." }, { status: 500 });
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
    // On renvoie l'erreur exacte pour que tu la voies
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}