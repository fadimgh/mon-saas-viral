import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const review = formData.get('review'); // Au cas où on repasse en mode texte
    const contractTextOnly = formData.get('contractText'); 

    let textToAnalyze = "";

    // Cas 1 : Fichier PDF
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const data = await pdf(buffer);
        textToAnalyze = data.text;
      } catch (e) {
        return NextResponse.json({ error: "Failed to read PDF" }, { status: 500 });
      }
    } 
    // Cas 2 : Texte simple (fallback)
    else if (contractTextOnly) {
      textToAnalyze = contractTextOnly;
    }
    // Cas 3 : Rien
    else {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    // On coupe si c'est trop long
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}