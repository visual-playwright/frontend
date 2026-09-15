import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleNotch, PushPin } from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";
import StepTable from "../components/StepTable.jsx";
import StepFeed from "../components/StepFeed.jsx";
import ScreenshotGallery from "../components/ScreenshotGallery.jsx";
import { StatusInline } from "../components/RunCard.jsx";
import { displayName } from "../utils/naming.js";

const MAX_STEPS = 30;
const BUDGET_MIN = 20;

function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} jam ${m % 60} mnt`;
  if (m > 0) return `${m} mnt ${s % 60} dtk`;
  return `${s} dtk`;
}

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5002";

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [follow, setFollow] = useState(true);
  const [now, setNow] = useState(Date.now());
  const revealRef = useRevealRoot([(run?.steps || []).length, !run]);

  const liveStatus = run?.status === "RUNNING" || run?.status === "QUEUED";

  // Detak elapsed 1 detik selama live.
  useEffect(() => {
    if (!liveStatus) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [liveStatus]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await api.get(`/runs/${id}`);
        if (alive) setRun(res.data.data);
      } catch {
        if (alive) setError("Run tidak ditemukan atau backend mati.");
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [id]);

  if (error) return <p className="text-steel mt-8">{error}</p>;
  if (!run)
    return (
      <div className="bg-canvas-white rounded-[20px] p-10 mt-6 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 bg-ash rounded-[8px]" />
        ))}
      </div>
    );

  const hero = (run.steps || []).find((s) => s.screenshot_path);
  const mainSteps = (run.steps || []).filter((s) => Number(s.no) > 0);
  const elapsedMs = Math.max(0, now - new Date(run.started_at || now).getTime());
  const elapsed = `${String(Math.floor(elapsedMs / 60000)).padStart(2, "0")}:${String(
    Math.floor((elapsedMs % 60000) / 1000)
  ).padStart(2, "0")}`;
  const progress = Math.min(100, (mainSteps.length / MAX_STEPS) * 100);
  const isLive = run.status === "RUNNING" || run.status === "QUEUED";
  const endMs = run.finished_at ? new Date(run.finished_at).getTime() : now;
  const durMs = endMs - new Date(run.started_at || endMs).getTime();
  const metrics = [
    ["Executable rate", `${run.executable_rate ?? 0}%`],
    ["Steps passed", `${run.steps_passed ?? 0}/${run.total_steps ?? 0}`],
    ["Goal", run.goal_achieved ? "YES" : "NO"],
    ["Reasoning", run.dynamic_reasoning_count ?? 0],
    ["Tokens", (run.token_total ?? 0).toLocaleString("id-ID")],
    ["Cost (USD)", `$${Number(run.cost_usd ?? 0).toFixed(4)}`],
    ["Durasi", fmtDuration(durMs)],
  ];

  return (
    <section ref={revealRef}>
      <Link
        to="/runs"
        className="inline-flex items-center gap-1.5 text-graphite underline decoration-ember-orange underline-offset-[3px] text-[14px]"
      >
        <ArrowLeft size={15} weight="bold" /> Kembali ke runs
      </Link>
      <p className="font-polysans text-[13px] text-brass mt-3">
        {run.scenario_id} · {run.domain} · <StatusInline value={run.status} />
      </p>
      <h1 className="font-polysans text-heading tracking-[-0.64px] break-all mt-1">{displayName(run.result_name)}</h1>

      {isLive && (
        <div className="flex flex-wrap items-center gap-3 mt-4" aria-live="polite">
          {run.status === "RUNNING" ? (
            <span className="bg-ember-orange text-white font-polysans text-[13px] rounded-[20px] px-3 py-1 animate-pulse">
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-fog border border-mist text-steel font-polysans text-[13px] rounded-[20px] px-3 py-1">
              <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden />
              Antre
            </span>
          )}
          <div
            className="flex-1 min-w-[160px]"
            role="progressbar"
            aria-valuenow={mainSteps.length}
            aria-valuemin={0}
            aria-valuemax={MAX_STEPS}
            aria-label="Progres langkah"
          >
            <div className="h-[4px] bg-mist rounded-full overflow-hidden">
              <div className="h-full bg-ember-orange transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="font-mono tabular-nums text-[13px] text-slate">
            {mainSteps.length}/{MAX_STEPS} · {elapsed}/{String(BUDGET_MIN).padStart(2, "0")}:00
          </span>
          <button
            type="button"
            onClick={() => setFollow((f) => !f)}
            aria-pressed={follow}
            title={follow ? "Berhenti mengikuti (bebas menjelajah)" : "Ikuti langkah terbaru otomatis"}
            className={`inline-flex items-center gap-1.5 font-polysans text-[13px] rounded-[20px] px-3 py-1 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
              follow ? "bg-graphite border-graphite text-white" : "bg-canvas-white border-mist text-slate hover:text-graphite"
            }`}
          >
            <PushPin size={14} weight="regular" aria-hidden />
            {follow ? "Mengikuti" : "Ikuti live"}
          </button>
        </div>
      )}

      {/* Hero screenshot dalam kartu asimetris */}
      <div className={`reveal rounded-[6px_0px_0px_0px] p-10 mt-20 ${dark ? "bg-graphite" : "bg-ash"}`}>
        <div className="aspect-video rounded-[8px] overflow-hidden bg-graphite">
          {hero ? (
            <img src={`${API}${hero.screenshot_path}`} alt={displayName(run.result_name)} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate text-[14px]">
              {run.status === "RUNNING" ? "Menjalankan…" : "Belum ada screenshot"}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {metrics.map(([label, value]) => (
          <div key={label} className="bg-canvas-white rounded-[20px] p-6">
            <p className="text-[14px] text-slate">{label}</p>
            <p className="font-mono tabular-nums text-heading-sm tracking-[-0.24px] mt-1">{value}</p>
          </div>
          ))}
        </div>
      </div>

      <div className="bg-fog rounded-[8px] p-5 md:p-8 mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-polysans text-subheading tracking-[-0.02em]">Log aktivitas</h2>
          <span className="font-mono tabular-nums text-[13px] text-slate" aria-live="polite">
            {mainSteps.length} langkah
          </span>
        </div>
        <StepFeed steps={run.steps || []} follow={follow && isLive} live={isLive} />
      </div>

      <div className="reveal bg-fog rounded-[8px] p-10 mt-20">
        <h2 className="font-polysans text-subheading tracking-[-0.02em]">Steps</h2>
        <div className="bg-canvas-white rounded-[20px] p-10 mt-5">
          <StepTable steps={run.steps || []} />
        </div>
      <div className="flex items-center justify-between mt-20">
        <h2 className="font-polysans text-subheading tracking-[-0.02em]">Screenshots</h2>
        <button
          onClick={() => setDark((d) => !d)}
          className="font-polysans text-[13px] rounded-[20px] px-3.5 py-1.5 bg-ash text-graphite"
        >
          {dark ? "Terang" : "Review gelap"}
        </button>
      </div>
      <div className={`rounded-[8px] p-10 mt-5 ${dark ? "bg-graphite" : "bg-fog"}`}>
        <div className={dark ? "[&_p]:text-slate" : ""}>
          <ScreenshotGallery steps={run.steps || []} follow={follow && isLive} />
        </div>
      </div>
      </div>
    </section>
  );
}
