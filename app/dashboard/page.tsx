import { redis } from "@/lib/redis";
import type { GenerationRecord } from "@/lib/redis";
import Link from "next/link";

const CATEGORIES: Record<string, string> = {
  malattia: "🤒 Malattia",
  famiglia: "👨‍👩‍👧 Famiglia",
  tecnico: "💻 Tecnico",
  traffico: "🚗 Traffico",
  psicologico: "🧠 Stress",
  meteorologico: "⛈️ Meteo",
};

const TONES: Record<string, string> = {
  drammatico: "🎭 Drammatico",
  professionale: "👔 Professionale",
  creativo: "🌀 Creativo",
  pietoso: "🥺 Pietoso",
};

async function getStats(): Promise<ReturnType<typeof buildEmpty> | Awaited<ReturnType<typeof fetchStats>>> {
  try {
    return await fetchStats();
  } catch (err) {
    console.error("dashboard stats error:", err);
    return buildEmpty();
  }
}

function buildEmpty() {
  return {
    total: 0,
    categories: Object.fromEntries(Object.keys(CATEGORIES).map((k) => [k, 0])),
    tones: Object.fromEntries(Object.keys(TONES).map((k) => [k, 0])),
    history: [] as GenerationRecord[],
    error: true,
  };
}

async function fetchStats() {
  const categoryKeys = Object.keys(CATEGORIES);
  const toneKeys = Object.keys(TONES);

  const [total, ...rest] = await Promise.all([
    redis.get<number>("scusamaster:total"),
    ...categoryKeys.map((c) => redis.get<number>(`scusamaster:category:${c}`)),
    ...toneKeys.map((t) => redis.get<number>(`scusamaster:tone:${t}`)),
    redis.lrange("scusamaster:history", 0, 9),
  ]);

  const categoryValues = rest.slice(0, categoryKeys.length) as (number | null)[];
  const toneValues = rest.slice(categoryKeys.length, categoryKeys.length + toneKeys.length) as (number | null)[];
  const rawHistory = rest[categoryKeys.length + toneKeys.length] as (string | GenerationRecord)[];

  const categories = Object.fromEntries(
    categoryKeys.map((c, i) => [c, categoryValues[i] ?? 0])
  );
  const tones = Object.fromEntries(
    toneKeys.map((t, i) => [t, toneValues[i] ?? 0])
  );
  const history: GenerationRecord[] = rawHistory.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  return { total: (total as number) ?? 0, categories, tones, history };
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function Dashboard() {
  const { total, categories, tones, history, ...rest } = await getStats();
  const hasError = "error" in rest && rest.error;
  const maxCat = Math.max(...Object.values(categories));
  const maxTone = Math.max(...Object.values(tones));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-amber-800">📊 Dashboard</h1>
        <Link href="/" className="text-sm text-amber-600 hover:text-amber-800 underline underline-offset-2">
          ← Genera scuse
        </Link>
      </div>

      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          ⚠️ Impossibile connettersi al database. Controlla le variabili d&apos;ambiente su Vercel.
        </div>
      )}

      {/* Totale */}
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 text-center">
        <p className="text-6xl font-black text-amber-600">{total}</p>
        <p className="text-amber-700 font-medium mt-1">scuse generate finora</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Categorie */}
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 flex flex-col gap-4">
          <h2 className="font-bold text-amber-700">Per categoria</h2>
          {Object.entries(categories).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{CATEGORIES[key]}</span>
                <span className="font-semibold text-amber-600">{val as number}</span>
              </div>
              <Bar value={val as number} max={maxCat} />
            </div>
          ))}
        </div>

        {/* Toni */}
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 flex flex-col gap-4">
          <h2 className="font-bold text-amber-700">Per tono</h2>
          {Object.entries(tones).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{TONES[key]}</span>
                <span className="font-semibold text-amber-600">{val as number}</span>
              </div>
              <Bar value={val as number} max={maxTone} />
            </div>
          ))}
        </div>
      </div>

      {/* Ultime scuse */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 flex flex-col gap-4">
          <h2 className="font-bold text-amber-700">Ultime 10 scuse generate</h2>
          <div className="flex flex-col divide-y divide-amber-50">
            {history.map((rec) => (
              <div key={rec.id} className="py-3 flex flex-col gap-1">
                <div className="flex gap-2 text-xs text-amber-400">
                  <span>{CATEGORIES[rec.category] ?? rec.category}</span>
                  <span>·</span>
                  <span>{TONES[rec.tone] ?? rec.tone}</span>
                  <span>·</span>
                  <span>{new Date(rec.createdAt).toLocaleString("it-IT")}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{rec.excuse}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
