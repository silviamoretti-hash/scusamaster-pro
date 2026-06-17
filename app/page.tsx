"use client";

import { useState } from "react";
import Link from "next/link";

type Phase = "idle" | "loading" | "result";

const CATEGORIES = [
  { value: "malattia",      label: "Malattia" },
  { value: "famiglia",      label: "Famiglia" },
  { value: "tecnico",       label: "Tecnico" },
  { value: "traffico",      label: "Traffico" },
  { value: "psicologico",   label: "Stress" },
  { value: "meteorologico", label: "Meteo" },
];

const TONES = [
  { value: "drammatico",    label: "Drammatico" },
  { value: "professionale", label: "Professionale" },
  { value: "creativo",      label: "Creativo" },
  { value: "pietoso",       label: "Pietoso" },
];

export default function Home() {
  const [phase, setPhase]       = useState<Phase>("idle");
  const [category, setCategory] = useState("malattia");
  const [tone, setTone]         = useState("drammatico");
  const [excuse, setExcuse]     = useState("");
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState("");

  async function generate() {
    setPhase("loading");
    setError("");
    setCopied(false);
    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore sconosciuto");
      setExcuse(data.excuse);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore. Riprova.");
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setExcuse("");
    setError("");
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(excuse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = phase === "loading";
  const isResult  = phase === "result";

  // Three rings evenly phase-offset using negative delays so all are visible from frame 0
  const ringDuration = isLoading ? 1.1 : 3.2;

  return (
    <>
      {/* ── Background canvas ── */}
      <div
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 30%, oklch(0.15 0.07 245) 0%, oklch(0.09 0.03 245) 55%, oklch(0.06 0.02 245) 100%)",
        }}
      >
        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between px-6 pt-7 pb-2">
          <span
            className="font-display font-black text-lg tracking-tight"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            ScusaMaster Pro
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-semibold transition-opacity hover:opacity-60"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Dashboard →
          </Link>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center pb-16 px-6 relative z-10">

          {/* Rings + button */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 280, height: 280 }}
          >
            {([0, 1, 2] as const).map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: "1.5px solid oklch(0.60 0.175 28 / 0.45)",
                  animationName: isLoading ? "ringFast" : "ringPulse",
                  animationDuration: `${ringDuration}s`,
                  animationDelay: `${-(i * ringDuration) / 3}s`,
                  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  animationIterationCount: "infinite",
                  animationFillMode: "both",
                }}
              />
            ))}

            <button
              onClick={generate}
              disabled={isLoading}
              aria-label={isLoading ? "Elaborazione in corso" : "Genera una scusa"}
              className="relative flex items-center justify-center rounded-full select-none"
              style={{
                width: 220,
                height: 220,
                backgroundColor: "var(--color-primary)",
                boxShadow: isLoading
                  ? "0 0 80px oklch(0.60 0.175 28 / 0.60), 0 0 160px oklch(0.60 0.175 28 / 0.20)"
                  : "0 0 50px oklch(0.60 0.175 28 / 0.45), 0 12px 48px oklch(0.05 0.02 245 / 0.90)",
                transition:
                  "transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease",
                cursor: isLoading ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (isLoading) return;
                const el = e.currentTarget;
                el.style.transform = "scale(1.05)";
                el.style.boxShadow = "0 0 80px oklch(0.60 0.175 28 / 0.65), 0 12px 48px oklch(0.05 0.02 245 / 0.90)";
              }}
              onMouseLeave={(e) => {
                if (isLoading) return;
                const el = e.currentTarget;
                el.style.transform = "scale(1)";
                el.style.boxShadow = "0 0 50px oklch(0.60 0.175 28 / 0.45), 0 12px 48px oklch(0.05 0.02 245 / 0.90)";
              }}
              onMouseDown={(e) => {
                if (!isLoading) e.currentTarget.style.transform = "scale(0.96)";
              }}
              onMouseUp={(e) => {
                if (!isLoading) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.22)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <span
                  className="font-display font-black text-white uppercase"
                  style={{ fontSize: "1.6rem", letterSpacing: "0.06em" }}
                >
                  Genera
                </span>
              )}
            </button>
          </div>

          {/* Status / error — fixed height so layout stays stable */}
          <div className="h-8 mt-5 flex items-center justify-center">
            {isLoading ? (
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.38)", animation: "fadeUp 0.3s ease-out both" }}
              >
                Elaborazione in corso…
              </p>
            ) : error ? (
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(0.72 0.14 28)", animation: "fadeUp 0.3s ease-out both" }}
              >
                ⚠ {error}
              </p>
            ) : null}
          </div>

          {/* Category + tone selectors */}
          <div
            className="mt-6 flex flex-col gap-3 items-center"
            style={{
              opacity: isLoading ? 0 : 1,
              pointerEvents: isLoading ? "none" : "auto",
              transition: "opacity 0.25s ease",
            }}
          >
            <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 360 }}>
              {CATEGORIES.map((c) => {
                const active = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                    style={{
                      backgroundColor: active ? "rgba(255,255,255,0.13)" : "transparent",
                      color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.28)",
                      border: "1px solid",
                      borderColor: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 360 }}>
              {TONES.map((t) => {
                const active = tone === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                    style={{
                      backgroundColor: active ? "rgba(255,255,255,0.13)" : "transparent",
                      color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.28)",
                      border: "1px solid",
                      borderColor: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ── Result overlay — fixed, covers full viewport ── */}
      {isResult && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            backgroundColor: "var(--color-primary)",
            animation: "resultReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Scusa generata"
        >
          {/* Wordmark + X */}
          <div className="flex items-center justify-between px-6 pt-7 pb-2">
            <span
              className="font-display font-black text-lg tracking-tight text-white"
              style={{ opacity: 0.9 }}
            >
              ScusaMaster Pro
            </span>
            <button
              onClick={reset}
              aria-label="Chiudi e torna all'inizio"
              className="flex items-center justify-center rounded-full font-bold text-white transition-opacity hover:opacity-60"
              style={{ width: 36, height: 36, backgroundColor: "rgba(255,255,255,0.20)", fontSize: "0.85rem" }}
            >
              ✕
            </button>
          </div>

          {/* Excuse — dominant center */}
          <div
            className="flex-1 flex items-center justify-center px-8"
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.10s both" }}
          >
            <p
              className="font-display font-bold text-white text-center"
              style={{
                fontSize: "clamp(1.4rem, 5vw, 2.5rem)",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                maxWidth: "22ch",
                textWrap: "pretty",
              } as React.CSSProperties}
              aria-live="polite"
            >
              {excuse}
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex gap-3 px-6 pb-14 pt-4"
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.20s both" }}
          >
            <button
              onClick={copy}
              className="flex-1 rounded-2xl py-4 text-sm font-bold transition-all duration-150"
              style={
                copied
                  ? { backgroundColor: "rgba(255,255,255,0.22)", color: "#fff" }
                  : { backgroundColor: "#fff", color: "var(--color-primary)" }
              }
            >
              {copied ? "✓ Copiata!" : "Copia"}
            </button>
            <button
              onClick={generate}
              className="flex-1 rounded-2xl py-4 text-sm font-bold border-2 transition-all duration-150"
              style={{ borderColor: "rgba(255,255,255,0.28)", color: "#fff", backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              Rigenera
            </button>
          </div>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.65; }
          75%  { transform: scale(2.2); opacity: 0;    }
          100% { transform: scale(2.2); opacity: 0;    }
        }
        @keyframes ringFast {
          0%   { transform: scale(1);   opacity: 0.75; }
          75%  { transform: scale(2.5); opacity: 0;    }
          100% { transform: scale(2.5); opacity: 0;    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes resultReveal {
          from { clip-path: circle(0% at 50% 50%); }
          to   { clip-path: circle(150% at 50% 50%); }
        }
      `}</style>
    </>
  );
}
