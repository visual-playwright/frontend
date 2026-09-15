import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  Globe,
  LinkSimple,
  LockKey,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";

const SCENARIOS = [
  { id: "R-01", name: "Login", desc: "Masuk dengan username & password, pastikan dashboard tampil." },
  { id: "R-02", name: "Create", desc: "Tambah data baru lewat form, pastikan tersimpan di daftar." },
  { id: "R-03", name: "Update", desc: "Ubah satu data, pastikan perubahan tampil di daftar." },
  { id: "R-04", name: "Delete", desc: "Hapus data target termasuk dialog konfirmasi." },
  { id: "R-05", name: "Logout", desc: "Keluar dan pastikan kembali ke halaman login." },
];

function slugify(domain) {
  return String(domain || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "app";
}

function previewName(domain, scenarioId) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `result_${slugify(domain)}_${scenarioId}_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
}

export default function NewRun() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ domain: "", url: "", username: "", password: "", scenario_id: "R-01" });
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revealRef = useRevealRoot([]);
  const errorRef = useRef(null);
  const errorId = "newrun-error";

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: k === "domain" ? String(v).toLowerCase() : v }));
  }

  function handleCaps(e) {
    try {
      setCapsOn(e.getModifierState ? e.getModifierState("CapsLock") : false);
    } catch {
      setCapsOn(false);
    }
  }

  const urlValid = useMemo(() => {
    const v = form.url.trim();
    if (!v) return false;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, [form.url]);

  const urlTouched = form.url.trim() !== "";
  const canSubmit =
    !loading && form.domain.trim() !== "" && urlValid && form.username.trim() !== "" && form.password !== "";

  async function submit(e) {
    e.preventDefault();
    if (loading || !canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/runs", {
        domain: form.domain.trim().toLowerCase(),
        url: form.url.trim(),
        username: form.username.trim(),
        password: form.password,
        scenario_id: form.scenario_id,
      });
      navigate(`/runs/${res.data.data.run_id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat run. Periksa kembali isian form.");
    } finally {
      setLoading(false);
    }
  }

  const CTA =
    "font-polysans text-[16px] tracking-[-0.02em] px-6 py-3.5 rounded-none active:translate-y-[1px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";
  const inputCls =
    "bg-canvas-white border border-mist pl-11 pr-4 py-3 text-[15px] leading-[1.5] text-graphite placeholder:text-slate focus:outline-none focus:border-graphite focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-orange rounded-none w-full transition-colors";
  const labelCls = "flex flex-col gap-2 text-[14px] font-medium text-graphite";
  const scenario = SCENARIOS.find((s) => s.id === form.scenario_id) ?? SCENARIOS[0];

  return (
    <section ref={revealRef} aria-labelledby="newrun-heading">
      <h1 id="newrun-heading" className="font-polysans text-heading tracking-[-0.64px]">
        New run
      </h1>
      <p className="text-[16px] md:text-[18px] text-steel mt-1 max-w-[60ch]">
        Isi detail aplikasi target dan pilih skenario — worker akan mengujinya secara visual.
      </p>

      <form
        onSubmit={submit}
        noValidate={false}
        className="reveal bg-ash rounded-[6px_0px_0px_0px] p-5 md:p-8 mt-8 flex flex-col gap-6"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:items-start">
          <div className="min-w-0 flex flex-col gap-8">
        {/* 01 · Target */}
        <fieldset className="min-w-0">
          <legend className="font-polysans text-[13px] tracking-[0.08em] text-brass">
            01 · TARGET APLIKASI
          </legend>
          <div className="flex flex-col gap-5 mt-4">
            <label htmlFor="newrun-domain" className={labelCls}>
              Domain
              <span className="relative block">
                <Globe
                  size={18}
                  weight="regular"
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                />
                <input
                  id="newrun-domain"
                  name="domain"
                  required
                  autoFocus
                  autoComplete="off"
                  value={form.domain}
                  onChange={(e) => set("domain", e.target.value)}
                  placeholder="ecommerce"
                  aria-describedby={error ? errorId : undefined}
                  className={inputCls}
                />
              </span>
              <span className="text-[13px] font-normal text-slate">
                Nama pendek aplikasi, huruf kecil tanpa spasi.
              </span>
            </label>
            <label htmlFor="newrun-url" className={labelCls}>
              URL
              <span className="relative block">
                <LinkSimple
                  size={18}
                  weight="regular"
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                />
                <input
                  id="newrun-url"
                  name="url"
                  required
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://aplikasi-anda.com"
                  aria-invalid={urlTouched && !urlValid ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={inputCls}
                />
              </span>
              {urlTouched && !urlValid ? (
                <span className="text-[13px] font-normal text-ember-orange">
                  URL belum valid — sertakan protokol, contoh https://…
                </span>
              ) : (
                <span className="text-[13px] font-normal text-slate">Alamat lengkap halaman login aplikasi.</span>
              )}
            </label>
          </div>
        </fieldset>

        {/* 02 · Kredensial */}
        <fieldset className="border-t border-mist pt-8 min-w-0">
          <legend className="font-polysans text-[13px] tracking-[0.08em] text-brass">
            02 · KREDENSIAL
          </legend>
          <div className="grid sm:grid-cols-2 gap-5 mt-4">
            <label htmlFor="newrun-username" className={labelCls}>
              Username
              <span className="relative block">
                <User
                  size={18}
                  weight="regular"
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                />
                <input
                  id="newrun-username"
                  name="username"
                  required
                  autoComplete="off"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  placeholder="nama pengguna"
                  aria-describedby={error ? errorId : undefined}
                  className={inputCls}
                />
              </span>
            </label>
            <div className="flex flex-col gap-2">
              <label htmlFor="newrun-password" className={labelCls}>
                Password
              </label>
              <span className="relative block">
                <LockKey
                  size={18}
                  weight="regular"
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                />
                <input
                  id="newrun-password"
                  name="password"
                  required
                  type={show ? "text" : "password"}
                  autoComplete="off"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  onKeyUp={handleCaps}
                  onKeyDown={handleCaps}
                  placeholder="kata sandi"
                  aria-describedby={error ? errorId : undefined}
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={show}
                  title={show ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full text-slate hover:text-graphite hover:bg-fog transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                >
                  {show ? <EyeSlash size={18} weight="regular" /> : <Eye size={18} weight="regular" />}
                </button>
              </span>
              {capsOn && !error && (
                <span className="text-[13px] font-normal text-brass">Caps Lock aktif — periksa huruf besar.</span>
              )}
            </div>
          </div>
        </fieldset>

          </div>{/* /kolom kiri */}

          {/* 03 · Skenario — rel kanan, sticky di desktop */}
          <div className="min-w-0 self-start lg:sticky lg:top-6">
        <fieldset className="border-t border-mist pt-8 lg:border-t-0 lg:pt-0 min-w-0">
          <legend className="font-polysans text-[13px] tracking-[0.08em] text-brass">
            03 · SKENARIO
          </legend>
          <div role="radiogroup" aria-label="Skenario pengujian" className="flex flex-col gap-2.5 mt-4">
            {SCENARIOS.map((s) => {
              const active = form.scenario_id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("scenario_id", s.id)}
                  className={`flex items-center gap-3.5 rounded-[8px] border bg-canvas-white px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
                    active ? "border-graphite" : "border-mist hover:border-slate"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-polysans text-[13px] rounded-[20px] px-3 py-1 shrink-0 tabular-nums ${
                      active ? "bg-graphite text-white" : "bg-fog text-graphite"
                    }`}
                  >
                    {s.id}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-polysans text-[15px] tracking-[-0.02em] text-graphite">
                      {s.name}
                    </span>
                    <span className="block text-[13px] leading-[1.5] text-steel mt-0.5">{s.desc}</span>
                  </span>
                  <CheckCircle
                    size={20}
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                    className={`shrink-0 ${active ? "text-graphite" : "text-mist"}`}
                  />
                </button>
              );
            })}
          </div>
        </fieldset>
          </div>{/* /rel skenario */}
        </div>{/* /grid dua kolom */}

        {/* Ringkasan */}
        <div aria-live="polite" className="bg-fog rounded-[8px] px-4 py-3.5 text-[13px] leading-[1.6]">
          <p className="text-slate">
            Menjalankan <span className="font-polysans text-graphite">{scenario.id} · {scenario.name}</span>
            {form.domain.trim() && (
              <>
                {" "}pada <span className="font-polysans text-graphite">{form.domain.trim()}</span>
              </>
            )}
            .
          </p>
          <p className="font-mono text-slate break-all mt-1">
            {previewName(form.domain, scenario.id)}
          </p>
        </div>

        {error && (
          <p
            id={errorId}
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="flex items-start gap-2 bg-canvas-white border border-mist rounded-[8px] px-4 py-3 text-[14px] leading-[1.43] text-graphite focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
          >
            <WarningCircle size={18} weight="bold" className="shrink-0 mt-[2px] text-ember-orange" aria-hidden />
            <span>{error}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`${CTA} bg-graphite text-white hover:bg-steel w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />}
            {loading ? "Membuat run…" : "Jalankan pengujian"}
          </button>
          <Link
            to="/runs"
            className="text-center font-polysans text-[14px] tracking-[-0.02em] text-slate hover:text-graphite transition-colors rounded-[6px] py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
          >
            Batal
          </Link>
        </div>
      </form>
    </section>
  );
}
