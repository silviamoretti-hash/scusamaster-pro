import { redis } from "@/lib/redis";

const CATEGORIES = ["malattia", "famiglia", "tecnico", "traffico", "psicologico", "meteorologico"];
const TONES = ["drammatico", "professionale", "creativo", "pietoso"];

export async function GET() {
  const [total, ...rest] = await Promise.all([
    redis.get<number>("scusamaster:total"),
    ...CATEGORIES.map((c) => redis.get<number>(`scusamaster:category:${c}`)),
    ...TONES.map((t) => redis.get<number>(`scusamaster:tone:${t}`)),
    redis.lrange("scusamaster:history", 0, 9),
  ]);

  const categoryValues = rest.slice(0, CATEGORIES.length) as (number | null)[];
  const toneValues = rest.slice(CATEGORIES.length, CATEGORIES.length + TONES.length) as (number | null)[];
  const rawHistory = rest[CATEGORIES.length + TONES.length] as string[];

  const categories = Object.fromEntries(
    CATEGORIES.map((c, i) => [c, categoryValues[i] ?? 0])
  );

  const tones = Object.fromEntries(
    TONES.map((t, i) => [t, toneValues[i] ?? 0])
  );

  const history = rawHistory.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  return Response.json({ total: total ?? 0, categories, tones, history });
}
