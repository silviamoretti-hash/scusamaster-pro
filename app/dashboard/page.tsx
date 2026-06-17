import { redis } from "@/lib/redis";
import type { GenerationRecord } from "@/lib/redis";
import Link from "next/link";

const CATEGORIES: Record<string, string> = {
  malattia:      "🤒 Malattia",
  famiglia:      "👨‍👩‍👧 Famiglia",
  tecnico:       "💻 Tecnico",
  traffico:      "🚗 Traffico",
  psicologico:   "🧠 Stress",
  meteorologico: "⛈️ Meteo",
};

const TONES: Record<string, string> = {
  drammatico:    "🎭 Drammatico",
  professionale: "👔 Professionale",
  creativo:      "🌀 Creativo",
  pietoso:       "🥺 Pietoso",
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
    tones:      Object.fromEntries(Object.keys(TONES).map((k) => [k, 0])),
    history:    [] as GenerationRecord[],
    error:      true,
  };
}

async function fetchStats() {
  const categoryKeys = Object.keys(CATEGORIES);
  const toneKeys     = Object.keys(TONES);

  const [total, ...rest] = await Promise.all([
    redis.get<number>("scusamaster:total"),
    ...categoryKeys.map((c) => redis.get<number>(`scusamaster:category:${c}`)),
    ...toneKeys.map((t) => redis.get<number>(`scusamaster:tone:${t}`)),
    redis.lrange("scusamaster:history", 0, 9),
  ]);

  const categoryValues = rest.slice(0, categoryKeys.length) as (number | null)[];
  const toneValues     = rest.slice(categoryKeys.length, categoryKeys.length + toneKeys.length) as (number | null)[];
  const rawHistory     = rest[categoryKeys.length + toneKeys.length] as (string | GenerationRecord)[];

  return {
    total:      (total as number) ?? 0,
    categories: Object.fromEntries(categoryKeys.map((c, i) => [c, categoryValues[i] ?? 0])),
    tones:      Object.fromEntries(toneKeys.map((t, i) => [t, toneValues[i] ?? 0])),
    history:    rawHistory.map((item) => (typeof item === "string" ? JSON.parse(item) : item)) as GenerationRecord[],
  };
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: "var(--color-primary)" }}
      />
    </div>
  );
}

export default async function Dashboard() {
  const { total, categories, tones, history, ...rest } = await getStats();
  const hasError = "error" in rest && rest.error;
  const maxCat  = Math.max(1, ...Object.values(categories) as number[]);
  const maxTone = Math.max(1, ...Object.values(tones) as number[]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <h1
          className="font-display font-black leading-none tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.5rem,7vw,4.5rem)", color: "var(--color-primary)" }}
        >
          Statistiche.
        </h1>
        <Link
          href="/"
          className="text-sm font-semibold pb-1 transition-colors"
          style={{ color: "var(--color-muted)" }}
        >
          ← Genera
        </Link>
      </div>

      {hasError && (
        <div
          className="rounded-2xl border-2 p-4 text-sm font-medium"
          style={{ borderColor: "var(--color-accent)", color: "#fff", backgroundColor: "oklch(0.13 0.04 28)" }}
        >
          ⚠️ Impossibile connettersi al database. Controlla le variabili d&apos;ambiente su Vercel.
        </div>
      )}

      {/* Totale */}
      <div
        className="rounded-2xl p-8 flex flex-col gap-1"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <p
          className="font-display font-black leading-none"
          style={{ fontSize: "clamp(4rem,12vw,7rem)", color: "#fff" }}
        >
          {total}
        </p>
        <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>
          scuse generate finora
        </p>
      </div>

      {/* Categorie + Toni */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <h2 className="font-display font-bold text-xl tracking-tight" style={{ color: "var(--color-ink)" }}>
            Per categoria
          </h2>
          {Object.entries(categories).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-ink)" }}>{CATEGORIES[key]}</span>
                <span className="font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>{val as number}</span>
              </div>
              <Bar value={val as number} max={maxCat} />
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <h2 className="font-display font-bold text-xl tracking-tight" style={{ color: "var(--color-ink)" }}>
            Per tono
          </h2>
          {Object.entries(tones).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-ink)" }}>{TONES[key]}</span>
                <span className="font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>{val as number}</span>
              </div>
              <Bar value={val as number} max={maxTone} />
            </div>
          ))}
        </div>
      </div>

      {/* Ultime scuse */}
      {history.length > 0 && (
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <h2 className="font-display font-bold text-xl tracking-tight" style={{ color: "var(--color-ink)" }}>
            Ultime 10 scuse
          </h2>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-bg)" }}>
            {history.map((rec) => (
              <div key={rec.id} className="py-4 flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                  <span>{CATEGORIES[rec.category] ?? rec.category}</span>
                  <span>·</span>
                  <span>{TONES[rec.tone] ?? rec.tone}</span>
                  <span>·</span>
                  <span>{new Date(rec.createdAt).toLocaleString("it-IT")}</span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--color-ink)" }}>
                  {rec.excuse}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
