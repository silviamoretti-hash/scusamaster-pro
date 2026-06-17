import Anthropic from "@anthropic-ai/sdk";
import { redis, GenerationRecord } from "@/lib/redis";
import { randomUUID } from "crypto";

const client = new Anthropic();

const CATEGORIES: Record<string, string> = {
  malattia: "malattia o problemi di salute",
  famiglia: "emergenze familiari",
  tecnico: "problemi tecnici con il computer o internet",
  traffico: "traffico o problemi di trasporto",
  psicologico: "stress e benessere mentale",
  meteorologico: "condizioni meteo avverse",
};

const TONES: Record<string, string> = {
  drammatico: "drammatico e teatrale",
  professionale: "formale e professionale",
  creativo: "assurdo e creativo",
  pietoso: "che fa pietà e compassione",
};

export async function POST(request: Request) {
  const body = await request.json();
  const category: string = body.category ?? "malattia";
  const tone: string = body.tone ?? "drammatico";

  const categoryDesc = CATEGORIES[category] ?? category;
  const toneDesc = TONES[tone] ?? tone;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Sei ScusaMaster Pro, un esperto di scuse lavorative italiane.
Genera UNA scusa convincente da dire al capo per non lavorare oggi.
Categoria: ${categoryDesc}
Tono: ${toneDesc}

La scusa deve essere:
- In italiano
- Tra le 2 e le 5 frasi
- Credibile ma con un tocco di umorismo
- Pronta per essere inviata via messaggio o email

Rispondi SOLO con la scusa, senza introduzioni o commenti.`,
      },
    ],
  });

  const excuse =
    message.content[0].type === "text" ? message.content[0].text : "";

  const record: GenerationRecord = {
    id: randomUUID(),
    excuse,
    category,
    tone,
    createdAt: Date.now(),
  };

  // Salva in Redis: lista LIFO + contatori
  await Promise.all([
    redis.lpush("scusamaster:history", JSON.stringify(record)),
    redis.ltrim("scusamaster:history", 0, 499),
    redis.incr("scusamaster:total"),
    redis.incr(`scusamaster:category:${category}`),
    redis.incr(`scusamaster:tone:${tone}`),
  ]);

  return Response.json({ excuse, id: record.id });
}
