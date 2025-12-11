import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // ASTUCE : On importe l'outil PDF ici, à l'intérieur, pour éviter le bug de Vercel
    const pdf = require('pdf-parse'); 

    const formData = await req.formData();
    const file = formData.get('file');

    let textToAnalyze = "";

    // Cas 1 : Fichier PDF
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const data = await pdf(buffer);
        textToAnalyze = data.text;
      } catch (e) {
        console.error("PDF Error:", e);
        return NextResponse.json({ error: "Failed to read PDF" }, { status: 500 });
      }
    } 
    // Cas 2 : Erreur (pas de fichier)
    else {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // On coupe le texte s'il est trop long
    const truncatedText = textToAnalyze.substring(0, 15000);

    const systemPrompt = `You are "ScanMyContract", an expert AI Legal Auditor.
    Analyze the contract text provided below.
    
    Detect and list the RISKS and TRAPS using these emojis:
    🔴 [CRITICAL RISK]: For dangerous clauses.
    ⚠️ [WARNING]: For vague terms or disadvantageous conditions.
    ✅ [GOOD]: If a specific section is standard and safe.

    Format as a concise bullet point list. Be professional.`;

    const userPrompt = `Analyze this contract: "${truncatedText}"`;

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}