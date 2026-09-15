import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { displayName } from "../utils/naming.js";

// Command palette (Ctrl+K): navigasi + lompat ke run.
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [runs, setRuns] = useState([]);
  const [cursor, setCursor] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      api.get("/runs").then((r) => setRuns(r.data.data || [])).catch(() => setRuns([]));
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const nav = [
      { label: "New run", hint: "Buat pengujian", go: () => navigate("/runs/new") },
      { label: "Runs", hint: "Dashboard", go: () => navigate("/runs") },
      { label: "Compare", hint: "Bandingkan runs", go: () => navigate("/compare") },
      { label: "Templates", hint: "Prompt R-01..R-05", go: () => navigate("/templates") },
      { label: "Workflow", hint: "Cara kerja pengujian", go: () => navigate("/workflow") },
    ];
    const matched = runs
      .filter(
        (r) =>
          !needle ||
          (r.result_name || "").toLowerCase().includes(needle) ||
          (r.domain || "").toLowerCase().includes(needle)
      )
      .slice(0, 8)
      .map((r) => ({
        label: displayName(r.result_name),
        hint: `${r.domain} · ${r.scenario_id} · ${r.status}`,
        go: () => navigate(`/runs/${r.id}`),
      }));
    const navHit = nav.filter((n) => !needle || n.label.toLowerCase().includes(needle));
    return [...navHit, ...matched];
  }, [q, runs, navigate]);

  useEffect(() => setCursor(0), [q]);

  function onInputKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && items[cursor]) {
      setOpen(false);
      items[cursor].go();
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-graphite/40" onClick={() => setOpen(false)}>
      <div
        className="max-w-[560px] mx-auto mt-24 bg-canvas-white rounded-[20px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Ketik perintah atau cari run…"
          className="w-full px-5 py-4 text-[16px] focus:outline-none border-b border-mist"
        />
        <div className="max-h-[320px] overflow-y-auto py-2">
          {items.length === 0 && <p className="px-5 py-3 text-steel text-[14px]">Tidak ada hasil.</p>}
          {items.map((it, i) => (
            <button
              key={`${it.label}-${i}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => {
                setOpen(false);
                it.go();
              }}
              className={`w-full text-left px-5 py-2.5 flex items-baseline justify-between gap-3 ${
                i === cursor ? "bg-ash" : ""
              }`}
            >
              <span className="text-[14px] font-medium truncate">{it.label}</span>
              <span className="text-[12px] text-slate shrink-0">{it.hint}</span>
            </button>
          ))}
        </div>
        <p className="px-5 py-2 text-[12px] text-slate border-t border-mist">
          ↑↓ navigasi · Enter buka · Esc tutup
        </p>
      </div>
    </div>
  );
}
