import { Link } from "react-router-dom";
import { CheckCircle, Trash } from "@phosphor-icons/react";
import { displayName } from "../utils/naming.js";

// Kartu run = data widget Ventriloc: putih, radius 20px, tanpa shadow,
// screenshot sebagai "chart" (imagery = data). Satu aksen Ember, satu Brass.
//
// Catatan: kartu ini sengaja TIDAK memakai animasi `.reveal` — daftar run
// di-mount ulang setiap filter berubah, dan reveal-on-scroll hanya diobserve
// saat efek awal sehingga kartu baru akan terjebak tak terlihat (opacity 0).
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5002";

export function StatusInline({ value }) {
  const cls =
    value === "DONE"
      ? "text-brass"
      : value === "FAILED"
        ? "text-ember-orange underline underline-offset-2"
        : value === "RUNNING"
          ? "text-ember-orange"
          : "text-slate";
  return <span className={`font-polysans text-[13px] transition-colors duration-300 ${cls}`}>{value}</span>;
}

export default function RunCard({ run, onDelete }) {
  const rate = Number(run.executable_rate || 0);
  const thumb = run.latest_screenshot ? `${API}${run.latest_screenshot}` : null;
  const when = (run.started_at || "").slice(0, 16).replace("T", " ");
  const running = run.status === "RUNNING";

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (running) return;
    if (window.confirm(`Hapus ${displayName(run.result_name)}? Screenshot ikut terhapus.`)) onDelete?.(run.id);
  }

  return (
    <Link
      to={`/runs/${run.id}`}
      className="bg-canvas-white rounded-[20px] p-6 flex flex-col gap-4 group transition-colors hover:bg-fog/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
    >
      <div className="relative aspect-video rounded-[8px] overflow-hidden bg-ash">
        {thumb ? (
          <img
            src={thumb}
            alt={`Screenshot terakhir dari ${displayName(run.result_name)}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate text-[14px] px-4 text-center">
            {run.status === "QUEUED" ? "Menunggu worker…" : "Belum ada screenshot"}
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {running && (
            <span className="bg-ember-orange text-white font-polysans text-[13px] rounded-[20px] px-2.5 py-0.5 animate-pulse">
              LIVE
            </span>
          )}
          <span className="bg-graphite text-white font-polysans text-[13px] rounded-[20px] px-2.5 py-0.5 tabular-nums">
            {rate.toFixed(rate % 1 ? 1 : 0)}%
          </span>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-mist">
          <div
            className="h-full bg-ember-orange transition-[width] duration-500"
            style={{ width: `${Math.min(100, rate)}%` }}
          />
        </div>
        {onDelete && !running && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Hapus ${displayName(run.result_name)}`}
            title="Hapus run"
            className="absolute top-2 right-2 w-8 h-8 rounded-[20px] bg-canvas-white border border-mist text-slate hover:text-ember-orange flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
          >
            <Trash size={15} weight="bold" aria-hidden />
          </button>
        )}
      </div>
      <div>
        <p className="font-polysans text-[16px] tracking-[-0.02em] leading-snug line-clamp-2 break-all group-hover:underline group-hover:decoration-ember-orange group-hover:underline-offset-[3px]">
          {displayName(run.result_name)}
        </p>
        <p className="text-[14px] text-steel mt-1">
          {run.domain} · {run.scenario_id}
          {run.goal_achieved && (
            <CheckCircle size={15} weight="bold" className="inline-block ml-1 -mt-0.5 text-brass" aria-label="Goal tercapai" />
          )}
        </p>
        <p className="text-[14px] text-slate mt-0.5">
          <StatusInline value={run.status} /> ·{" "}
          <span className="font-mono tabular-nums">{(run.token_total ?? 0).toLocaleString("id-ID")}</span> tokens
          {when && (
            <>
              {" · "}
              <time dateTime={run.started_at || undefined} className="tabular-nums">
                {when}
              </time>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
