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

    // --- C'EST ICI QUE LA MAGIE OPÈRE (PROMPT ENGINEERING) ---
    let specificInstruction = "";
    
    if (tone === "Commercial") {
      specificInstruction = "Ton but est de faire revenir le client. Propose subtilement de demander le patron lors de la prochaine visite pour un geste (café ou apéritif offert). Sois chaleureux.";
    } else if (tone === "Ferme") {
      specificInstruction = "Le client exagère ou ment. Reste poli mais ferme. Défends ton équipe et tes produits sans être agressif. Ne t'excuse pas si ce n'est pas justifié.";
    } else {
      specificInstruction = "Ton empathique et rassurant. Montre que tu as compris le problème spécifique. Excuse-toi sincèrement mais brièvement.";
    }

    const systemPrompt = `Tu es le propriétaire d'un restaurant réputé. Tu réponds aux avis Google.
    Tu détestes le langage robotique, administratif ou 'ChatGPT'. Tu écris comme un humain.
    
    RÈGLES ABSOLUES À RESPECTER :
    1. Ne commence JAMAIS par "Cher client" ou "Merci pour votre avis". Rentre direct dans le sujet.
    2. INTERDICTION d'utiliser des phrases clichés comme "Nous prenons vos commentaires très au sérieux" ou "La satisfaction client est notre priorité". C'est interdit.
    3. Tu DOIS mentionner spécifiquement un détail de l'avis du client (ex: s'il parle du burger, parle du burger) pour prouver que ce n'est pas une réponse automatique.
    4. Fais des phrases courtes.
    5. Signe par "L'équipe" ou le prénom du propriétaire.
    
    TON ACTUEL : ${tone}
    INSTRUCTION SPÉCIALE : ${specificInstruction}`;

    const userPrompt = `Voici l'avis reçu (analyse-le bien) : "${review}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Tu peux mettre "gpt-4" si tu es prêt à payer un peu plus cher pour une qualité encore meilleure
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7, // Créativité équilibrée
    });

    const result = completion.choices[0].message.content;
    
    return NextResponse.json({ result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}