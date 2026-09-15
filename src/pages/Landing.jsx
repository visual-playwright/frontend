import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import {
  ClipboardText,
  Brain,
  CursorClick,
  ChartBar,
  SquaresFour,
  ListNumbers,
  EyeSlash,
  PiggyBank,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";
import useCountUp from "../hooks/useCountUp.js";

function TrustNumber({ target, format }) {
  const [ref, value] = useCountUp(Number(target) || 0);
  return (
    <p ref={ref} className="font-polysans tabular-nums text-heading text-graphite">
      {format(value)}
    </p>
  );
}

// Landing publik — informasi web app sebelum login (Ventriloc).
// Hero memakai bukti live dari /public/latest, bukan mockup.
export default function Landing() {
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const revealRef = useRevealRoot([loading, !!spot]);

  useEffect(() => {
    api
      .get("/public/latest")
      .then((r) => setSpot(r.data.data || null))
      .catch(() => setSpot(null))
      .finally(() => setLoading(false));
  }, []);

  const CTA =
    "font-polysans text-[16px] tracking-[-0.02em] px-6 py-3 rounded-none active:translate-y-[1px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";

  return (
    <div ref={revealRef}>
      {/* Header */}
      <header className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 px-5 py-5">
        <span className="shrink-0">
          <Logo />
        </span>
        <nav aria-label="Navigasi landing" className="bg-ash rounded-[200px] px-[18px] py-2 hidden sm:flex items-center gap-5">
          {[
            ["Fitur", "#fitur"],
            ["Cara kerja", "#cara-kerja"],
            ["Metrik", "#metrik"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="font-polysans text-[16px] tracking-[-0.02em] text-graphite hover:text-steel rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange">
              {label}
            </a>
          ))}
        </nav>
        <Link to="/login" className={`${CTA} bg-graphite text-white hover:bg-steel shrink-0`}>
          <span className="sm:hidden">Masuk</span>
          <span className="hidden sm:inline">Masuk ke dashboard</span>
        </Link>
      </header>

      <div className="max-w-[1200px] mx-auto px-5">
        {/* Hero */}
        <section className="reveal grid lg:grid-cols-2 gap-5 items-center pt-10 md:pt-20">
          <div>
            <h1 className="font-polysans text-[40px] leading-[0.95] tracking-[-1.32px] md:text-display md:leading-[0.91]">
              Visual QA,{" "}
              <span className="underline decoration-ember-orange decoration-[3px] underline-offset-[6px]">
                tanpa sentuh DOM.
              </span>
            </h1>
            <p className="text-[18px] text-steel mt-5 max-w-[40ch]">
              AutoQA menguji web production dengan Playwright murni visual. LLM melihat screenshot dan menentukan
              langkah berikutnya — tanpa membaca kode.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/login" className={`${CTA} bg-graphite text-white hover:bg-steel`}>
                Masuk ke dashboard
              </Link>
              <a
                href="#cara-kerja"
                className={`${CTA} border border-graphite hover:bg-ash`}
              >
                Lihat cara kerja
              </a>
            </div>
          </div>
          <div className="bg-ivory rounded-[6px_0px_0px_0px] p-6 md:p-10">
            <div className="bg-canvas-white rounded-[20px] p-6">
              <div className="aspect-video rounded-[8px] overflow-hidden bg-graphite">
                <img
                  src="https://images.pexels.com/photos/34803990/pexels-photo-34803990.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Insinyur meninjau hasil debugging di layar laptop — tinjauan visual seperti cara kerja AutoQA"
                  loading="eager"
                  className="w-full h-full object-cover sepia-[0.22] contrast-[1.02]"
                />
              </div>
              <p className="flex items-center gap-2 font-polysans text-[13px] tracking-[0.08em] text-brass mt-4">
                <span className="w-2 h-2 rounded-full bg-ember-orange" />
                QA VISUAL · PLAYWRIGHT · LLM
              </p>
              <p className="font-polysans text-[16px] tracking-[-0.02em] mt-1">
                Setiap langkah diuji lewat apa yang terlihat.
              </p>
              <p className="text-[12px] text-slate mt-2">Foto: Pexels</p>
            </div>
          </div>
        </section>

        {/* Trust strip — angka hidup */}
        <section id="fitur" className="reveal scroll-mt-24 mt-20">
          <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">TERBUKTI DI RUN NYATA</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            <div>
              <TrustNumber target={spot ? Number(spot.executable_rate) : 0} format={(v) => `${v.toFixed(v % 1 ? 1 : 0)}%`} />
              <p className="text-[14px] text-steel mt-1">executable rate terakhir</p>
            </div>
            <div>
              <TrustNumber target={spot ? Number(spot.token_total) : 0} format={(v) => Math.round(v).toLocaleString("id-ID")} />
              <p className="text-[14px] text-steel mt-1">tokens run terakhir</p>
            </div>
            <div>
              <TrustNumber target={spot ? Number(spot.cost_usd) : 0} format={(v) => `$${v.toFixed(4)}`} />
              <p className="text-[14px] text-steel mt-1">biaya run terakhir</p>
            </div>
            <div>
              <TrustNumber target={0} format={() => "0"} />
              <p className="text-[14px] text-steel mt-1">baris kode DOM disentuh</p>
            </div>
          </div>
        </section>

        {/* Cara kerja — diagram loop, bukan kartu teks */}
        <section id="cara-kerja" className="reveal scroll-mt-24 bg-ash rounded-[8px] p-6 md:p-10 mt-20">
          <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">CARA KERJA</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            {[
              [ClipboardText, "Form", "Domain, URL, dan kredensial — pengganti template-chat.txt."],
              [Brain, "LLM", "Muse Spark menganalisis screenshot dan memilih tool."],
              [CursorClick, "Playwright", "Klik, ketik, dan screenshot murni visual."],
              [ChartBar, "Laporan", "Steps, metrik, token, dan biaya per run."],
            ].map(([Icon, title, body], i, arr) => (
              <div key={title} className="relative">
                <Icon size={30} weight="regular" className="text-graphite" />
                <p className="font-polysans text-[16px] tracking-[-0.02em] mt-3">
                  {i + 1} · {title}
                </p>
                <p className="text-[14px] text-steel mt-2">{body}</p>
                {i < arr.length - 1 && (
                  <span aria-hidden className="hidden xl:block absolute top-1 -right-3 w-6 border-t border-mist" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[14px] text-slate mt-8">
            Satu run untuk satu skenario R-01 sampai R-05 — Login, Create, Update, Delete, Logout.
          </p>
        </section>

        {/* Metrik — band putih */}
        <section id="metrik" className="reveal scroll-mt-24 mt-20 mb-20">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              [SquaresFour, "5", "skenario tetap"],
              [ListNumbers, "30", "langkah maks per run"],
              [EyeSlash, "0", "akses DOM"],
              [PiggyBank, "$0", "biaya per token"],
            ].map(([Icon, value, label]) => (
              <div key={label} className="bg-canvas-white border border-mist rounded-[20px] p-6">
                <Icon size={32} weight="regular" className="text-graphite" />
                <p className="font-polysans tabular-nums text-heading-lg leading-[1.2] tracking-[-0.8px] mt-2">{value}</p>
                <p className="text-[14px] text-steel mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="max-w-[1200px] mx-auto px-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-polysans text-[13px] text-slate">AutoQA · Visual QA · Playwright · No DOM</p>
          <nav aria-label="Navigasi footer" className="flex flex-wrap items-center gap-5">
            {[
              ["Fitur", "#fitur"],
              ["Cara kerja", "#cara-kerja"],
              ["Metrik", "#metrik"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="font-polysans text-[13px] text-slate hover:text-graphite rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange">
                {label}
              </a>
            ))}
            <Link to="/login" className="font-polysans text-[13px] text-slate hover:text-graphite rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange">
              Masuk
            </Link>
          </nav>
        </div>
        <p className="font-polysans text-[13px] text-slate mt-4">© {new Date().getFullYear()} AutoQA</p>
      </footer>
    </div>
  );
}
