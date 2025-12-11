import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // 1. On récupère le fichier envoyé
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. On transforme le fichier en texte lisible pour l'IA
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let contractText = "";
    try {
      const data = await pdf(buffer);
      contractText = data.text;
    } catch (e) {
      return NextResponse.json({ error: "Failed to read PDF" }, { status: 500 });
    }

    // 3. On coupe si c'est trop long (L'IA a une limite)
    const truncatedText = contractText.substring(0, 15000); // ~5-6 pages

    // 4. Le Prompt de l'Avocat
    const systemPrompt = `You are "ScanMyContract", an expert AI Legal Auditor.
    Analyze the contract text provided.
    
    Detect and list the RISKS and TRAPS using these emojis:
    🔴 [CRITICAL RISK]: For dangerous clauses.
    ⚠️ [WARNING]: For vague terms or disadvantageous conditions.
    ✅ [GOOD]: If a specific section is standard and safe.

    Format as a concise bullet point list. Be professional and sharp.`;

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
    console.error(error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}