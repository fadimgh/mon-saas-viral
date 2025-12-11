import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import PDFParser from 'pdf2json'; // Le nouvel outil robuste

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- LE MOTEUR ROBUSTE (pdf2json) ---
    const parser = new PDFParser(this, 1); // 1 = Texte brut

    const textToAnalyze = await new Promise((resolve, reject) => {
      parser.on("pdfParser_dataError", (errData) => reject(new Error("Erreur lecture PDF")));
      parser.on("pdfParser_dataReady", () => {
        // On récupère le texte brut
        resolve(parser.getRawTextContent());
      });
      // Lancement de l'analyse
      parser.parseBuffer(buffer);
    });
    // -------------------------------------

    // Vérification : Est-ce un scan (image) ?
    if (!textToAnalyze || textToAnalyze.length < 20) {
       return NextResponse.json({ error: "Ce PDF est une image (scan). L'IA a besoin de texte sélectionnable." }, { status: 400 });
    }

    // On coupe pour l'IA (max 15 000 caractères pour aller vite)
    const truncatedText = textToAnalyze.substring(0, 15000);

    const systemPrompt = `You are "ScanMyContract", an expert AI Legal Auditor.
    Analyze the contract text provided below.
    
    Detect and list the RISKS and TRAPS using these emojis:
    🔴 [CRITICAL RISK]: For dangerous clauses (non-compete, hidden fees).
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
    // Cette fois on affiche la vraie erreur technique si ça plante
    return NextResponse.json({ error: error.message || "Erreur technique serveur" }, { status: 500 });
  }
}