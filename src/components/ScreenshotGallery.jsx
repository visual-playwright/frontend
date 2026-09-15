import { useCallback, useEffect, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5002";

// Galeri inti: viewer besar + strip thumbnail + keyboard ←/→.
// follow=true: lompat ke screenshot terbaru saat step masuk (mode pantau live).
export default function ScreenshotGallery({ steps, follow = false }) {
  const shots = steps.filter((s) => s.screenshot_path);
  const [index, setIndex] = useState(0);
  const total = shots.length;

  const go = useCallback(
    (d) => {
      if (!total) return;
      setIndex((i) => (i + d + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (follow) setIndex(Math.max(0, total - 1));
    else setIndex((i) => Math.min(i, Math.max(0, total - 1)));
  }, [steps.length, follow, total]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!total) return <p className="text-[14px] text-slate">Belum ada screenshot.</p>;
  const cur = shots[Math.min(index, total - 1)];

  return (
    <div>
      <div className="relative bg-graphite rounded-[8px] overflow-hidden">
        <img
          key={cur.screenshot_path}
          src={`${API}${cur.screenshot_path}`}
          alt={`step ${cur.no}`}
          className="w-full aspect-video object-contain"
        />
        <button
          onClick={() => go(-1)}
          aria-label="Sebelumnya"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[20px] bg-canvas-white text-graphite flex items-center justify-center active:translate-y-[calc(-50%+1px)]"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Berikutnya"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[20px] bg-canvas-white text-graphite flex items-center justify-center active:translate-y-[calc(-50%+1px)]"
        >
          <CaretRight size={18} weight="bold" />
        </button>
        <span className="absolute bottom-2 right-2 bg-graphite text-white font-polysans text-[13px] rounded-[20px] px-2.5 py-0.5">
          {(shots.indexOf(cur) + 1)}/{total}
        </span>
      </div>
      <p className="text-[14px] text-steel mt-2">
        Step {cur.no} — {cur.visual_element}
      </p>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {shots.map((s, i) => (
          <button
            key={s.screenshot_path}
            onClick={() => setIndex(i)}
            className={`shrink-0 w-28 aspect-video rounded-[8px] overflow-hidden ${
              s.screenshot_path === cur.screenshot_path ? "outline outline-2 outline-ember-orange" : ""
            }`}
          >
            <img src={`${API}${s.screenshot_path}`} alt={`step ${s.no}`} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
