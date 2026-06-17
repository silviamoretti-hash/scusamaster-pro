"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "malattia", label: "🤒 Malattia" },
  { value: "famiglia", label: "👨‍👩‍👧 Famiglia" },
  { value: "tecnico", label: "💻 Problemi tecnici" },
  { value: "traffico", label: "🚗 Traffico" },
  { value: "psicologico", label: "🧠 Stress mentale" },
  { value: "meteorologico", label: "⛈️ Meteo" },
];

const TONES = [
  { value: "drammatico", label: "🎭 Drammatico" },
  { value: "professionale", label: "👔 Professionale" },
  { value: "creativo", label: "🌀 Creativo/Assurdo" },
  { value: "pietoso", label: "🥺 Pietoso" },
];

export default function Home() {
  const [category, setCategory] = useState("malattia");
  const [tone, setTone] = useState("drammatico");
  const [excuse, setExcuse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-amber-800 mb-2">
          Generatore di Scuse Pro 🎪
        </h1>
        <p className="text-amber-600 text-lg">
          L&apos;AI che lavora perché tu non debba farlo.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-amber-700 mb-2">
            Categoria scusa
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  category === c.value
                    ? "bg-amber-500 border-amber-500 text-white shadow"
                    : "border-amber-200 text-amber-700 hover:bg-amber-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-amber-700 mb-2">
            Tono della scusa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  tone === t.value
                    ? "bg-amber-500 border-amber-500 text-white shadow"
                    : "border-amber-200 text-amber-700 hover:bg-amber-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 text-lg transition-all shadow-md"
        >
          {loading ? "Sto inventando..." : "🎲 Genera Scusa!"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {excuse && (
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
            La tua scusa pronta all&apos;uso
          </h2>
          <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
            {excuse}
          </p>
          <div className="flex gap-3">
            <button
              onClick={copy}
              className="flex-1 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-2 text-sm transition-all"
            >
              {copied ? "✅ Copiata!" : "📋 Copia"}
            </button>
            <button
              onClick={generate}
              className="flex-1 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-2 text-sm transition-all"
            >
              🔄 Rigenera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
