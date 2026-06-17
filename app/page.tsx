"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "malattia",      label: "🤒 Malattia" },
  { value: "famiglia",      label: "👨‍👩‍👧 Famiglia" },
  { value: "tecnico",       label: "💻 Tecnico" },
  { value: "traffico",      label: "🚗 Traffico" },
  { value: "psicologico",   label: "🧠 Stress" },
  { value: "meteorologico", label: "⛈️ Meteo" },
];

const TONES = [
  { value: "drammatico",    label: "🎭 Drammatico" },
  { value: "professionale", label: "👔 Professionale" },
  { value: "creativo",      label: "🌀 Creativo" },
  { value: "pietoso",       label: "🥺 Pietoso" },
];

export default function Home() {
  const [category, setCategory] = useState("malattia");
  const [tone,     setTone]     = useState("drammatico");
  const [excuse,   setExcuse]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [error,    setError]    = useState("");

  async function generate() {
    setLoading(true);
    setExcuse("");
    setCopied(false);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore sconosciuto");
      setExcuse(data.excuse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nella generazione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(excuse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14 flex flex-col gap-10">

      {/* Title */}
      <div className="flex flex-col gap-3">
        <h1
          className="font-display font-black leading-[0.92] tracking-[-0.02em] text-balance"
          style={{
            fontSize: "clamp(3.25rem, 9vw, 5.5rem)",
            color: "var(--color-primary)",
            textWrap: "balance",
          }}
        >
          Genera la tua<br />scusa perfetta.
        </h1>
        <p className="text-lg leading-relaxed max-w-[52ch]" style={{ color: "var(--color-muted)" }}>
          L&apos;AI che lavora perché tu non debba farlo.
          Seleziona categoria e tono, poi premi il tasto.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-8">

        {/* Category */}
        <fieldset className="flex flex-col gap-3">
          <legend
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--color-muted)" }}
          >
            Categoria
          </legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="rounded-full px-4 py-2 text-sm font-semibold border-2 transition-all duration-150"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--color-primary)",
                          borderColor: "var(--color-primary)",
                          color: "#fff",
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: "var(--color-surface)",
                          color: "var(--color-ink)",
                        }
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Tone */}
        <fieldset className="flex flex-col gap-3">
          <legend
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--color-muted)" }}
          >
            Tono
          </legend>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => {
              const active = tone === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className="rounded-full px-4 py-2 text-sm font-semibold border-2 transition-all duration-150"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--color-primary)",
                          borderColor: "var(--color-primary)",
                          color: "#fff",
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: "var(--color-surface)",
                          color: "var(--color-ink)",
                        }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* CTA */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-2xl font-display font-black text-white py-5 transition-all duration-150 disabled:opacity-40"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            letterSpacing: "-0.01em",
            backgroundColor: loading ? "var(--color-accent)" : "var(--color-accent)",
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-accent-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-accent)";
          }}
        >
          {loading ? "Inventing…" : "🎲 Genera Scusa!"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl border-2 p-4 text-sm font-medium"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent-hover)",
            backgroundColor: "oklch(0.97 0.012 25)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Excuse output */}
      {excuse && (
        <div
          className="rounded-2xl border-2 p-7 flex flex-col gap-5"
          style={{
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--color-surface)",
            animation: "slideUp 0.25s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-display font-bold text-sm uppercase tracking-widest"
              style={{ color: "var(--color-primary)" }}
            >
              Scusa certificata
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              ScusaMaster Pro®
            </span>
          </div>

          <p
            className="text-base leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--color-ink)", textWrap: "pretty" } as React.CSSProperties}
          >
            {excuse}
          </p>

          <div className="flex gap-3 pt-1">
            <button
              onClick={copy}
              className="flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all duration-150"
              style={{
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              {copied ? "✅ Copiata!" : "📋 Copia"}
            </button>
            <button
              onClick={generate}
              className="flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all duration-150"
              style={{
                borderColor: "var(--color-surface)",
                color: "var(--color-muted)",
              }}
            >
              🔄 Rigenera
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
