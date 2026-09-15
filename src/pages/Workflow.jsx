import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Brain,
  Camera,
  ChartBar,
  CursorClick,
  Eye,
  Images,
  Prohibit,
} from "@phosphor-icons/react";
import useRevealRoot from "../hooks/useRevealRoot.js";
import StatCard from "../components/StatCard.jsx";

const STEPS = [
  {
    id: "buka",
    no: "01",
    Icon: Camera,
    title: "Buka & potret",
    desc: "Worker membuka URL target di Chromium dan mengambil screenshot awal sebagai titik berangkat pengujian.",
    points: ["Browser headless, viewport tetap 1280 × 720", "Screenshot awal disimpan sebagai step-00"],
  },
  {
    id: "putuskan",
    no: "02",
    Icon: Brain,
    title: "LLM memutuskan",
    desc: "Muse Spark melihat screenshot, membaca histori langkah, lalu menjawab tepat satu action berikutnya dalam format JSON.",
    points: [
      "Masukan: gambar + histori teks + instruksi skenario R-01…R-05",
      "Keluaran: aksi, koordinat visual 0–1000, dan tanda selesai",
    ],
  },
  {
    id: "eksekusi",
    no: "03",
    Icon: CursorClick,
    title: "Playwright eksekusi",
    desc: "Aksi dijalankan sebagai gerakan visual — klik mouse pada koordinat, ketik, dan tangkap layar. Tanpa membaca DOM.",
    points: ["Tool di luar daftar visual langsung ditolak", "Jeda 800 ms, lalu screenshot ulang sebagai bukti step-NN"],
  },
  {
    id: "nilai",
    no: "04",
    Icon: ChartBar,
    title: "Ulang & nilai",
    desc: "Loop berputar sampai LLM menyatakan selesai. Setiap putaran tercatat status, lalu diringkas menjadi metrik run.",
    points: [
      "Pagu: 30 langkah / 20 menit · macet 3x → langkah dilewati",
      "Hasil: executable rate, goal tercapai, token & biaya",
    ],
  },
];

const GUARANTEES = [
  {
    Icon: Prohibit,
    title: "Nol sentuh DOM",
    body: "Hanya 12 tool visual yang diizinkan. Sisanya ditolak worker dengan pesan Tool diblokir.",
  },
  {
    Icon: Images,
    title: "Bukti tiap langkah",
    body: "Setiap step menyimpan screenshot beserta status PASS, FAIL, atau SKIPPED yang bisa dibuka ulang.",
  },
  {
    Icon: Eye,
    title: "LLM buta kode",
    body: "Yang dilihat LLM hanyalah gambar. Histori yang dikirim berupa teks — tidak pernah ada akses markup.",
  },
];

const TOOLS = [
  "navigate",
  "click",
  "type",
  "take_screenshot",
  "wait_for",
  "hover",
  "press_key",
  "fill_form",
  "select_option",
  "handle_dialog",
  "navigate_back",
  "resize",
];

const CTA =
  "font-polysans text-[16px] tracking-[-0.02em] px-6 py-3 rounded-none active:translate-y-[1px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";

export default function Workflow() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const revealRef = useRevealRoot([]);
  const step = STEPS[active];
  const StepIcon = step.Icon;

  function onTabKey(e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = (active + dir + STEPS.length) % STEPS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div ref={revealRef}>
      {/* Header */}
      <section className="reveal">
        <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">CARA KERJA</p>
        <h1 className="font-polysans text-heading-lg md:text-display tracking-[-0.8px] md:tracking-[-1.32px] leading-[1.05] mt-2 max-w-[20ch]">
          Pengujian murni visual, dari piksel sampai putusan.
        </h1>
        <p className="text-[16px] md:text-[18px] text-steel mt-4 max-w-[60ch]">
          LLM hanya melihat screenshot dan memutuskan langkah berikutnya. Playwright hanya menggerakkan
          mouse pada koordinat visual. Nol sentuh DOM — setiap langkah punya bukti gambar.
        </p>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/runs/new" className={`${CTA} bg-graphite text-white hover:bg-steel`}>
            Buat run
          </Link>
          <Link to="/runs" className={`${CTA} border border-graphite hover:bg-ash`}>
            Lihat runs
          </Link>
        </div>
      </section>

      {/* Stepper interaktif */}
      <section aria-label="Tahapan loop pengujian" className="reveal bg-ash rounded-[8px] p-5 md:p-10 mt-20">
        <div role="tablist" aria-label="Pilih tahap untuk melihat detail" onKeyDown={onTabKey} className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
          {STEPS.map((s, i) => {
            const selected = i === active;
            const TabIcon = s.Icon;
            return (
              <button
                key={s.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                aria-selected={selected}
                aria-controls="workflow-panel"
                id={`workflow-tab-${s.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 rounded-[8px] border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
                  selected ? "bg-graphite border-graphite text-white" : "bg-canvas-white border-mist hover:border-slate"
                }`}
              >
                <span aria-hidden className={`font-polysans text-[13px] tabular-nums ${selected ? "text-white" : "text-slate"}`}>
                  {s.no}
                </span>
                <TabIcon size={20} weight="regular" aria-hidden className={selected ? "text-white" : "text-graphite"} />
                <span className={`font-polysans text-[15px] tracking-[-0.02em] ${selected ? "text-white" : "text-graphite"}`}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="workflow-panel"
          aria-labelledby={`workflow-tab-${step.id}`}
          key={step.id}
          className="bg-canvas-white rounded-[20px] p-6 md:p-8 mt-5"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 bg-ash rounded-[8px]">
              <StepIcon size={22} weight="regular" className="text-graphite" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">
                TAHAP {step.no} DARI 04
              </p>
              <h2 className="font-polysans text-[20px] tracking-[-0.02em] mt-1">{step.title}</h2>
              <p className="text-[15px] leading-[1.5] text-steel mt-2 max-w-[62ch]">{step.desc}</p>
              <ul className="flex flex-col gap-2 mt-4">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[14px] text-graphite">
                    <span aria-hidden className="mt-[7px] w-1.5 h-1.5 shrink-0 bg-ember-orange" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Diagram alir */}
      <section aria-label="Diagram alir loop" className="reveal mt-20">
        <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">ALUR LOOP</p>
        <div className="flex flex-col md:flex-row md:items-stretch gap-2.5 mt-5">
          {STEPS.map((s, i) => {
            const NodeIcon = s.Icon;
            return (
              <div key={s.id} className="flex flex-col md:flex-row flex-1 md:items-center gap-2.5 min-w-0">
                <div className="flex-1 bg-fog rounded-[8px] px-4 py-3.5 flex items-center gap-3 min-w-0">
                  <NodeIcon size={20} weight="regular" className="text-graphite shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-polysans text-[13px] text-slate tabular-nums">{s.no}</p>
                    <p className="font-polysans text-[15px] tracking-[-0.02em] truncate">{s.title}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <>
                    <ArrowDown size={18} weight="regular" className="text-slate self-center md:hidden" aria-hidden />
                    <ArrowRight size={18} weight="regular" className="text-slate shrink-0 hidden md:block" aria-hidden />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[14px] text-slate mt-4">Satu run = satu skenario R-01 sampai R-05 — Login, Create, Update, Delete, Logout.</p>
      </section>

      {/* Garansi murni visual */}
      <section aria-label="Jaminan murni visual" className="reveal mt-20">
        <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">JAMINAN MURNI VISUAL</p>
        <div className="grid sm:grid-cols-3 gap-4 md:gap-5 mt-5">
          {GUARANTEES.map(({ Icon, title, body }) => (
            <div key={title} className="bg-canvas-white border border-mist rounded-[20px] p-6">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-ash rounded-[8px]">
                <Icon size={20} weight="regular" className="text-graphite" aria-hidden />
              </span>
              <h2 className="font-polysans text-[16px] tracking-[-0.02em] mt-4">{title}</h2>
              <p className="text-[14px] leading-[1.5] text-steel mt-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strip angka pagu */}
      <section aria-label="Batas dan kapasitas loop" className="reveal bg-ash rounded-[8px] p-5 md:p-8 mt-20">
        <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">BATAS & KAPASITAS</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mt-5">
          <StatCard label="Langkah maks per run" value="30" />
          <StatCard label="Budget waktu per run" value="20 mnt" />
          <StatCard label="Tool visual diizinkan" value="12" sub="DOM ditolak" />
          <StatCard label="Viewport tetap" value="1280×720" />
        </div>
      </section>

      {/* Daftar tool */}
      <section aria-label="Daftar tool visual" className="reveal mt-20">
        <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">12 TOOL VISUAL</p>
        <p className="text-[15px] text-steel mt-2 max-w-[62ch]">
          Satu-satunya cara worker menyentuh aplikasi — semua berbasis koordinat dan gambar.
        </p>
        <ul className="flex flex-wrap gap-2 mt-5">
          {TOOLS.map((t) => (
            <li
              key={t}
              className="font-mono text-[13px] bg-fog rounded-[20px] px-3.5 py-1.5 text-graphite"
            >
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Penutup */}
      <section className="reveal bg-ivory rounded-[6px_0px_0px_0px] p-6 md:p-10 mt-20 flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
        <div>
          <h2 className="font-polysans text-heading tracking-[-0.64px]">Buktikan di aplikasi Anda.</h2>
          <p className="text-[15px] text-steel mt-2 max-w-[52ch]">
            Satu run, satu skenario. Hasil, screenshot, dan biaya tercatat otomatis.
          </p>
        </div>
        <Link to="/runs/new" className={`${CTA} bg-graphite text-white hover:bg-steel shrink-0`}>
          Buat run pertamamu
        </Link>
      </section>
    </div>
  );
}
