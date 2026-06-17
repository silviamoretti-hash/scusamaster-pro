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
      const res  = await fetch("/api/generate", {
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
          className="font-display font-black leading-[0.92] tracking-[-0.02em]"
          style={{
            fontSize: "clamp(3.25rem, 9vw, 5.5rem)",
            color: "var(--color-primary)",
            textWrap: "balance",
          } as React.CSSProperties}
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
                      ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff" }
                      : { backgroundColor: "transparent", borderColor: "var(--color-surface)", color: "var(--color-ink)" }
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
                      ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff" }
                      : { backgroundColor: "transparent", borderColor: "var(--color-surface)", color: "var(--color-ink)" }
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
            backgroundColor: "var(--color-accent)",
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

      {/* Excuse result */}
      <div aria-live="polite" aria-atomic="true">
        {excuse && (
          <div
            className="rounded-3xl p-8 flex flex-col gap-6"
            style={{
              backgroundColor: "var(--color-primary)",
              animation: "slideUp 0.30s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <p
              className="text-base leading-[1.75] whitespace-pre-wrap"
              style={{ color: "#fff", textWrap: "pretty", maxWidth: "60ch" } as React.CSSProperties}
            >
              {excuse}
            </p>

            <div className="flex gap-3">
              <button
                onClick={copy}
                className="flex-1 rounded-xl py-3 text-sm font-bold transition-all duration-150"
                style={
                  copied
                    ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { backgroundColor: "#fff", color: "var(--color-primary)" }
                }
              >
                {copied ? "✅ Copiata!" : "📋 Copia"}
              </button>
              <button
                onClick={generate}
                className="flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all duration-150"
                style={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff", backgroundColor: "transparent" }}
              >
                🔄 Rigenera
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
