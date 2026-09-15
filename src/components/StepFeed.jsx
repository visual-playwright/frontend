// Feed log aktivitas ala deploy/CI: terminal gelap, auto-scroll ke bawah
// saat langkah baru masuk (jika follow aktif). Murni dari data steps polling.
import { useEffect, useRef } from "react";

const DOT = {
  PASS: "bg-canvas-white",
  FAIL: "bg-ember-orange",
  SKIPPED: "bg-brass",
};

export default function StepFeed({ steps = [], follow = false, live = false }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el && follow) el.scrollTop = el.scrollHeight;
  }, [steps.length, follow]);

  if (!steps.length) {
    return (
      <p className="text-[14px] text-slate py-4">
        {live ? "Menunggu worker… langkah pertama akan muncul di sini." : "Belum ada langkah."}
      </p>
    );
  }

  return (
    <div
      ref={boxRef}
      role="log"
      aria-live={follow ? "polite" : "off"}
      aria-label="Log aktivitas run"
      className="bg-graphite rounded-[8px] p-4 mt-4 max-h-[320px] overflow-y-auto flex flex-col gap-2.5"
    >
      {steps.map((s, i) => (
        <div key={s.no ?? i} className="font-mono text-[13px] leading-[1.6] min-w-0">
          <p className="flex items-baseline gap-2.5 min-w-0">
            <span className="text-white/40 tabular-nums shrink-0">
              {(s.created_at || "").slice(11, 19) || "--:--:--"}
            </span>
            <span aria-hidden className={`w-2 h-2 rounded-full shrink-0 self-center ${DOT[s.status] || "bg-slate"}`} />
            <span className="text-white/90 break-words min-w-0">
              <span className="text-white/40 tabular-nums">#{s.no}</span> {s.instruction}
            </span>
          </p>
          {s.notes && (
            <p className="text-white/45 break-words pl-[86px] truncate" title={s.notes}>
              {s.notes}
            </p>
          )}
        </div>
      ))}
      {live && (
        <p aria-hidden className="font-mono text-[13px] text-ember-orange animate-pulse">
          ▊ memantau langkah berikutnya…
        </p>
      )}
    </div>
  );
}
