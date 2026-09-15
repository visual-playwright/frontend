import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowClockwise,
  MagnifyingGlass,
  TestTube,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";
import RunCard from "../components/RunCard.jsx";
import StatCard from "../components/StatCard.jsx";

const SCENARIOS = ["R-01", "R-02", "R-03", "R-04", "R-05"];
const STATUSES = ["RUNNING", "DONE", "FAILED"];
const PAGE_SIZE = 24;
const SERVER_CAP = 200;

const CTA =
  "font-polysans text-[16px] tracking-[-0.02em] bg-graphite text-white px-5 py-2.5 rounded-none active:translate-y-[1px] hover:bg-steel transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";
const GHOST =
  "font-polysans text-[14px] tracking-[-0.02em] border border-graphite text-graphite px-4 py-2 rounded-none hover:bg-ash transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [domain, setDomain] = useState("");
  const [chip, setChip] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

  async function remove(id) {
    setError("");
    try {
      await api.delete(`/runs/${id}`);
      setRuns((rs) => rs.filter((r) => r.id !== id));
    } catch {
      setError("Gagal menghapus run.");
    }
  }

  function resetFilters() {
    setChip("All");
    setDomain("");
  }

  useEffect(() => {
    let alive = true;
    load();
    const t = setInterval(() => {
      if (!alive || document.hidden) return;
      setRefreshing(true);
      api
        .get("/runs")
        .then((res) => {
          if (alive) setRuns(res.data.data || []);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setRefreshing(false);
        });
    }, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = domain.trim().toLowerCase();
    return runs.filter((r) => {
      const okChip = chip === "All" || r.scenario_id === chip || r.status === chip;
      const okQ =
        !needle ||
        (r.result_name || "").toLowerCase().includes(needle) ||
        (r.domain || "").toLowerCase().includes(needle);
      return okChip && okQ;
    });
  }, [runs, chip, domain]);

  const stats = useMemo(() => {
    const done = runs.filter((r) => r.status === "DONE");
    const rates = done.map((r) => Number(r.executable_rate || 0));
    const avg = rates.length ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1) : "0.0";
    const tokens = runs.reduce((a, r) => a + Number(r.token_total || 0), 0);
    const cost = runs.reduce((a, r) => a + Number(r.cost_usd || 0), 0);
    return { total: runs.length, avg, tokens, cost };
  }, [runs]);

  const chips = ["All", ...SCENARIOS, ...STATUSES];
  const isFiltered = chip !== "All" || domain.trim() !== "";
  const visibleRuns = filtered.slice(0, visible);
  const remaining = filtered.length - visibleRuns.length;
  const capped = runs.length >= SERVER_CAP;
  const revealRef = useRevealRoot([runs.length, loading]);

  // Filter berubah → kembali ke halaman tampil pertama.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [chip, domain]);

  return (
    <section ref={revealRef} aria-labelledby="runs-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 id="runs-heading" className="font-polysans text-heading tracking-[-0.64px]">
            Runs
          </h1>
          <p className="text-[16px] md:text-[18px] text-steel mt-1">
            Hasil pengujian visual per domain dan skenario.
          </p>
        </div>
        <p aria-live="polite" className="font-polysans text-[13px] text-slate tabular-nums text-right">
          {loading
            ? "Memuat…"
            : refreshing
              ? "Memperbarui…"
              : `Menampilkan ${Math.min(visible, filtered.length)} dari ${filtered.length} run`}
          {!loading && !refreshing && capped && (
            <span className="block text-[12px]">Server hanya menyimpan {SERVER_CAP} run terbaru.</span>
          )}
        </p>
      </div>

      {/* Stat band + filter */}
      <div className="reveal bg-ash rounded-[8px] p-5 md:p-8 mt-8">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          <StatCard label="Total runs" value={loading ? "…" : stats.total} />
          <StatCard label="Avg executable rate" value={loading ? "…" : `${stats.avg}%`} sub="runs DONE" />
          <StatCard label="Total tokens" value={loading ? "…" : stats.tokens.toLocaleString("id-ID")} />
          <StatCard label="Total cost" value={loading ? "…" : `$${stats.cost.toFixed(4)}`} sub="Muse Spark Free" />
        </div>

        <div className="border-t border-mist mt-6 md:mt-8 pt-6">
          <div role="group" aria-label="Filter skenario dan status" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {chips.map((c) => {
              const active = chip === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChip(c)}
                  aria-pressed={active}
                  className={`font-polysans text-[13px] rounded-[20px] px-3.5 py-1.5 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
                    active ? "bg-graphite text-white" : "bg-canvas-white text-graphite hover:bg-fog"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative">
              <label htmlFor="run-filter" className="sr-only">
                Filter berdasarkan domain atau nama run
              </label>
              <MagnifyingGlass
                size={16}
                weight="regular"
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate"
              />
              <input
                id="run-filter"
                type="search"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Filter domain atau nama…"
                autoComplete="off"
                className="bg-canvas-white rounded-[20px] pl-10 pr-9 py-2 text-[14px] text-graphite placeholder:text-slate border border-transparent focus:outline-none focus:border-graphite w-60 max-w-full transition-colors"
              />
              {domain && (
                <button
                  type="button"
                  onClick={() => setDomain("")}
                  aria-label="Bersihkan filter"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-full text-slate hover:text-graphite hover:bg-fog transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                >
                  <X size={14} weight="bold" aria-hidden />
                </button>
              )}
            </div>
            {isFiltered && (
              <button type="button" onClick={resetFilters} className={GHOST}>
                Atur ulang filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Daftar run */}
      <div className="reveal bg-fog rounded-[8px] p-5 md:p-8 mt-6">
        {loading ? (
          <div>
            <p className="sr-only" role="status">
              Memuat runs…
            </p>
            <div aria-hidden className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-canvas-white rounded-[20px] p-6 animate-pulse">
                  <div className="aspect-video rounded-[8px] bg-ash" />
                  <div className="h-4 bg-ash rounded-[8px] mt-4 w-3/4" />
                  <div className="h-3 bg-ash rounded-[8px] mt-2 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <WarningCircle size={28} weight="regular" className="text-ember-orange" aria-hidden />
            <p className="text-steel">{error}</p>
            <button type="button" onClick={load} className={CTA}>
              <ArrowClockwise size={16} weight="bold" aria-hidden /> Coba lagi
            </button>
          </div>
        ) : runs.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <TestTube size={28} weight="regular" className="text-slate" aria-hidden />
            <p className="font-polysans text-[16px] tracking-[-0.02em]">Belum ada run.</p>
            <p className="text-[14px] text-steel">Mulai pengujian visual pertama Anda.</p>
            <Link to="/runs/new" className={CTA}>
              New run
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <MagnifyingGlass size={28} weight="regular" className="text-slate" aria-hidden />
            <p className="font-polysans text-[16px] tracking-[-0.02em]">Tidak ada run yang cocok.</p>
            <p className="text-[14px] text-steel">Coba kata kunci lain atau atur ulang filter.</p>
            <button type="button" onClick={resetFilters} className={GHOST}>
              Atur ulang filter
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {visibleRuns.map((r) => (
                <RunCard key={r.id} run={r} onDelete={remove} />
              ))}
            </div>
            {remaining > 0 && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="font-polysans text-[14px] tracking-[-0.02em] border border-graphite text-graphite px-5 py-2.5 rounded-none hover:bg-ash transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                >
                  Muat {Math.min(remaining, PAGE_SIZE)} lagi ({remaining} tersisa)
                </button>
                <p className="text-[13px] text-slate tabular-nums">
                  Menampilkan {visibleRuns.length} dari {filtered.length}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
