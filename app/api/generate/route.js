import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { contractText } = await req.json();

    if (!contractText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const systemPrompt = `You are "ScanMyContract", an expert AI Legal Auditor.
    Your job is to protect freelancers and individuals from bad contracts.
    
    Analyze the text provided. Do NOT summarize it.
    Instead, detect and list the RISKS and TRAPS using these emojis:
    
    🔴 [CRITICAL RISK]: For dangerous clauses (non-compete, unlimited liability, unpaid work).
    ⚠️ [WARNING]: For vague terms or disadvantageous conditions (long payment terms).
    ✅ [GOOD]: If a specific section is standard and safe (only mention 1 or 2 key good points).

    Format the output as a clean list of bullet points.
    Keep it concise, punchy, and professional.
    If the contract looks safe, say it clearly.
    `;

    const userPrompt = `Analyze this contract part: "${contractText.substring(0, 3000)}"`; // On limite pour l'instant

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5, // Plus analytique, moins créatif
    });

    const result = completion.choices[0].message.content;
    
    return NextResponse.json({ result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}