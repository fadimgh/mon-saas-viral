import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { review, tone } = await req.json();

    if (!review) {
      return NextResponse.json({ error: "Avis manquant" }, { status: 400 });
    }

    const systemPrompt = `Tu es un expert en communication de crise et relation client pour des commerces (restaurants, hôtels, boutiques). 
    Ton but est de transformer un avis négatif en opportunité marketing.
    Ta réponse doit être :
    1. Professionnelle et empathique.
    2. Ne jamais s'énerver.
    3. Inviter le client à revenir ou à contacter le support en privé.
    4. Signée "La Direction".
    `;

    const userPrompt = `Voici l'avis reçu : "${review}".
    Rédige une réponse sur un ton : ${tone || "Professionnel et Apaisant"}.
    La réponse doit faire moins de 100 mots.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const result = completion.choices[0].message.content;
    
    return NextResponse.json({ result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}