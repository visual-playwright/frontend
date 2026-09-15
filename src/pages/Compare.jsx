import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowClockwise,
  MagnifyingGlass,
  TestTube,
  Trophy,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";
import { StatusInline } from "../components/RunCard.jsx";
import { displayName } from "../utils/naming.js";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5002";
const MAX_PICK = 4;
const PICKER_LIMIT = 30;

const GHOST =
  "font-polysans text-[14px] tracking-[-0.02em] border border-graphite text-graphite px-4 py-2 rounded-none hover:bg-ash transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";
const CTA =
  "font-polysans text-[16px] tracking-[-0.02em] bg-graphite text-white px-5 py-2.5 rounded-none hover:bg-steel transition-colors inline-flex items-center gap-2 active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";

function thumbOf(r) {
  return r.latest_screenshot ? `${API}${r.latest_screenshot}` : null;
}

export default function Compare() {
  const [runs, setRuns] = useState([]);
  const [picked, setPicked] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const revealRef = useRevealRoot([loading]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/runs");
      setRuns(res.data.data || []);
    } catch {
      setError("Gagal memuat runs. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id) {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= MAX_PICK) return p;
      return [...p, id];
    });
  }

  function clearAll() {
    setPicked([]);
  }

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return runs;
    return runs.filter(
      (r) =>
        (r.result_name || "").toLowerCase().includes(needle) ||
        (r.domain || "").toLowerCase().includes(needle) ||
        (r.scenario_id || "").toLowerCase().includes(needle)
    );
  }, [runs, query]);

  const selected = useMemo(
    () => picked.map((id) => runs.find((r) => r.id === id)).filter(Boolean),
    [runs, picked]
  );

  // Picker hanya menampilkan 30 teratas agar ringan; yang sudah dipilih selalu ikut tampil.
  const visibleOptions = useMemo(() => {
    const sel = new Set(picked);
    const selItems = options.filter((r) => sel.has(r.id));
    const rest = options.filter((r) => !sel.has(r.id));
    return [...selItems, ...rest.slice(0, Math.max(0, PICKER_LIMIT - selItems.length))];
  }, [options, picked]);
  const hiddenCount = options.length - visibleOptions.length;

  const verdict = useMemo(() => {
    if (selected.length < 2) return null;
    const byRate = [...selected].sort(
      (a, b) => Number(b.executable_rate || 0) - Number(a.executable_rate || 0) || Number(a.cost_usd || 0) - Number(b.cost_usd || 0)
    );
    const best = byRate[0];
    const cheapest = [...selected].sort((a, b) => Number(a.cost_usd || 0) - Number(b.cost_usd || 0))[0];
    return { best, cheapest };
  }, [selected]);

  const maxTokens = Math.max(1, ...selected.map((r) => Number(r.token_total || 0)));
  const maxCost = Math.max(0.0001, ...selected.map((r) => Number(r.cost_usd || 0)));
  const bestRate = Math.max(...selected.map((r) => Number(r.executable_rate || 0)));
  const minTokens = Math.min(...selected.map((r) => Number(r.token_total || 0)));
  const minCost = Math.min(...selected.map((r) => Number(r.cost_usd || 0)));
  const full = picked.length >= MAX_PICK;

  function cellCls(win) {
    return `border-t border-mist p-2.5 font-mono tabular-nums align-top ${win ? "text-graphite font-semibold" : "text-steel"}`;
  }

  return (
    <section ref={revealRef} aria-labelledby="compare-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 id="compare-heading" className="font-polysans text-heading tracking-[-0.64px]">
            Compare
          </h1>
          <p className="text-[16px] md:text-[18px] text-steel mt-1">
            Pilih hingga {MAX_PICK} runs untuk dibandingkan per metrik.
          </p>
        </div>
        <p aria-live="polite" className="font-polysans text-[13px] text-slate tabular-nums">
          {loading ? "Memuat…" : `${picked.length} dari ${MAX_PICK} dipilih`}
        </p>
      </div>

      {/* Picker */}
      <div className="reveal bg-ash rounded-[8px] p-5 md:p-8 mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <label htmlFor="compare-filter" className="sr-only">
              Cari run untuk dibandingkan
            </label>
            <MagnifyingGlass
              size={16}
              weight="regular"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate"
            />
            <input
              id="compare-filter"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari domain, skenario, nama…"
              autoComplete="off"
              className="bg-canvas-white rounded-[20px] pl-10 pr-9 py-2 text-[14px] text-graphite placeholder:text-slate border border-transparent focus:outline-none focus:border-graphite w-60 max-w-full transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-full text-slate hover:text-graphite hover:bg-fog transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
              >
                <X size={14} weight="bold" aria-hidden />
              </button>
            )}
          </div>
          {picked.length > 0 && (
            <button type="button" onClick={clearAll} className={GHOST}>
              Bersihkan pilihan
            </button>
          )}
        </div>

        <div className="mt-4">
          {loading ? (
            <div>
              <p className="sr-only" role="status">
                Memuat daftar runs…
              </p>
              <div aria-hidden className="grid sm:grid-cols-2 gap-2.5 animate-pulse">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-canvas-white rounded-[8px] p-3 flex items-center gap-3">
                    <div className="w-20 aspect-video rounded-[8px] bg-ash shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-ash rounded-[8px] w-3/4" />
                      <div className="h-3 bg-ash rounded-[8px] mt-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <WarningCircle size={24} weight="regular" className="text-ember-orange" aria-hidden />
              <p className="text-steel text-[14px]">{error}</p>
              <button type="button" onClick={load} className={CTA}>
                <ArrowClockwise size={16} weight="bold" aria-hidden /> Coba lagi
              </button>
            </div>
          ) : runs.length === 0 ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <TestTube size={24} weight="regular" className="text-slate" aria-hidden />
              <p className="font-polysans text-[16px] tracking-[-0.02em]">Belum ada run.</p>
              <Link to="/runs/new" className={CTA}>
                New run
              </Link>
            </div>
          ) : options.length === 0 ? (
            <p className="text-steel text-[14px] py-4 text-center">Tidak ada run yang cocok dengan pencarian.</p>
          ) : (
            <div className="flex flex-col gap-3">
            <div role="group" aria-label="Pilih runs untuk dibandingkan" className="grid sm:grid-cols-2 gap-2.5">
              {visibleOptions.map((r) => {
                const on = picked.includes(r.id);
                const disabled = !on && full;
                const thumb = thumbOf(r);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggle(r.id)}
                    disabled={disabled}
                    aria-pressed={on}
                    title={disabled ? `Maksimal ${MAX_PICK} — hapus satu pilihan dulu` : displayName(r.result_name)}
                    className={`flex items-center gap-3 rounded-[8px] border bg-canvas-white p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange disabled:cursor-not-allowed ${
                      on ? "border-graphite" : disabled ? "border-mist opacity-50" : "border-mist hover:border-slate"
                    }`}
                  >
                    <span aria-hidden className="w-20 aspect-video rounded-[8px] overflow-hidden bg-ash shrink-0">
                      {thumb && <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-polysans text-[14px] tracking-[-0.02em] text-graphite truncate">
                        {displayName(r.result_name)}
                      </span>
                      <span className="block text-[13px] text-slate mt-0.5">
                        {r.domain} · {r.scenario_id} ·{" "}
                        <span className="font-mono tabular-nums">{Number(r.executable_rate || 0).toFixed(0)}%</span>
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`w-5 h-5 rounded-full border shrink-0 inline-flex items-center justify-center ${
                        on ? "border-graphite bg-graphite" : "border-mist"
                      }`}
                    >
                      {on && <span className="w-2 h-2 rounded-full bg-canvas-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {hiddenCount > 0 && (
              <p className="text-[13px] text-slate text-center">
                +{hiddenCount} run lain tidak ditampilkan — persempit pencarian untuk menemukannya.
              </p>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Hasil */}
      {selected.length >= 2 ? (
        <div className="mt-6 flex flex-col gap-6">
          {verdict && (
            <div className="bg-ivory rounded-[6px_0px_0px_0px] p-5 md:p-6 flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 shrink-0 bg-canvas-white border border-mist rounded-[8px]">
                <Trophy size={20} weight="regular" className="text-graphite" aria-hidden />
              </span>
              <div>
                <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">KESIMPULAN</p>
                <p className="font-polysans text-[16px] tracking-[-0.02em] mt-1">
                  {displayName(verdict.best.result_name)} unggul.
                </p>
                <p className="text-[14px] text-steel mt-1">
                  Rate {Number(verdict.best.executable_rate || 0).toFixed(1)}%
                  {verdict.cheapest.id !== verdict.best.id &&
                    ` · termurah ${displayName(verdict.cheapest.result_name)} ($${Number(verdict.cheapest.cost_usd || 0).toFixed(4)})`}
                  {verdict.cheapest.id === verdict.best.id &&
                    ` · sekaligus termurah ($${Number(verdict.best.cost_usd || 0).toFixed(4)})`}
                  .
                </p>
              </div>
            </div>
          )}

          <div className="bg-fog rounded-[8px] p-5 md:p-8 overflow-x-auto">
            <table className="w-full border-collapse text-[14px] min-w-[620px]">
              <caption className="sr-only">Perbandingan metrik runs terpilih</caption>
              <thead>
                <tr className="text-left align-top">
                  <th scope="col" className="p-2.5 font-medium text-slate sticky left-0 bg-fog">
                    Metrik
                  </th>
                  {selected.map((r) => {
                    const thumb = thumbOf(r);
                    return (
                      <th key={r.id} scope="col" className="p-2.5 font-medium min-w-[180px]">
                        <div className="flex items-start gap-2.5">
                          <span aria-hidden className="w-20 aspect-video rounded-[8px] overflow-hidden bg-ash shrink-0">
                            {thumb && <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
                          </span>
                          <span className="flex-1 min-w-0">
                            <Link
                              to={`/runs/${r.id}`}
                              className="text-graphite underline decoration-ember-orange decoration-[2px] underline-offset-[3px] break-all font-polysans text-[14px] tracking-[-0.02em] rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                            >
                              {displayName(r.result_name)}
                            </Link>
                            <span className="block text-[13px] font-normal text-slate mt-1">
                              {r.domain} · {r.scenario_id}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggle(r.id)}
                            aria-label={`Hapus ${displayName(r.result_name)} dari perbandingan`}
                            title="Hapus dari perbandingan"
                            className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-slate hover:text-graphite hover:bg-mist transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                          >
                            <X size={14} weight="bold" aria-hidden />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Status</td>
                  {selected.map((r) => (
                    <td key={r.id} className="border-t border-mist p-2.5 align-top">
                      <StatusInline value={r.status} />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Executable rate</td>
                  {selected.map((r) => {
                    const v = Number(r.executable_rate || 0);
                    const win = v === bestRate;
                    return (
                      <td key={r.id} className={cellCls(win)}>
                        {v.toFixed(1)}%{win && <span className="font-polysans text-[12px] text-brass"> ◆</span>}
                        <span aria-hidden className="block h-[3px] bg-mist rounded-full mt-2 overflow-hidden">
                          <span className="block h-full bg-ember-orange" style={{ width: `${Math.min(100, v)}%` }} />
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Steps passed</td>
                  {selected.map((r) => (
                    <td key={r.id} className="border-t border-mist p-2.5 font-mono tabular-nums text-steel align-top">
                      {r.steps_passed ?? 0}/{r.total_steps ?? 0}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Goal</td>
                  {selected.map((r) => (
                    <td key={r.id} className={cellCls(!!r.goal_achieved)}>
                      {r.goal_achieved ? "YES" : "NO"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Reasoning</td>
                  {selected.map((r) => (
                    <td key={r.id} className="border-t border-mist p-2.5 font-mono tabular-nums text-steel align-top">
                      {r.dynamic_reasoning_count ?? 0}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Tokens</td>
                  {selected.map((r) => {
                    const v = Number(r.token_total || 0);
                    const win = v === minTokens;
                    return (
                      <td key={r.id} className={cellCls(win)}>
                        {v.toLocaleString("id-ID")}
                        <span aria-hidden className="block h-[3px] bg-mist rounded-full mt-2 overflow-hidden">
                          <span className="block h-full bg-brass" style={{ width: `${(v / maxTokens) * 100}%` }} />
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Cost (USD)</td>
                  {selected.map((r) => {
                    const v = Number(r.cost_usd || 0);
                    const win = v === minCost;
                    return (
                      <td key={r.id} className={cellCls(win)}>
                        ${v.toFixed(4)}
                        <span aria-hidden className="block h-[3px] bg-mist rounded-full mt-2 overflow-hidden">
                          <span className="block h-full bg-brass" style={{ width: `${(v / maxCost) * 100}%` }} />
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-canvas-white">
                  <td className="border-t border-mist p-2.5 text-slate sticky left-0 bg-fog">Mulai</td>
                  {selected.map((r) => (
                    <td key={r.id} className="border-t border-mist p-2.5 font-mono tabular-nums text-steel align-top">
                      {(r.started_at || "").slice(0, 16).replace("T", " ")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-fog rounded-[8px] p-8 md:p-10 text-center flex flex-col items-center gap-3">
          <TestTube size={28} weight="regular" className="text-slate" aria-hidden />
          <p className="font-polysans text-[16px] tracking-[-0.02em]">
            {picked.length === 1 ? "Satu terpilih — pilih 1 lagi untuk membandingkan." : "Pilih minimal 2 runs di atas."}
          </p>
          <p className="text-[14px] text-steel">Centang kartu run, lalu matriks perbandingan muncul di sini.</p>
        </div>
      )}
    </section>
  );
}
