import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import {
  Eye,
  EyeSlash,
  WarningCircle,
  CircleNotch,
  User,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useRevealRoot from "../hooks/useRevealRoot.js";

// Login tunggal web app — single column, satu kartu. Tanpa logout, sesi menetap setelah masuk.
export default function Login() {
  const navigate = useNavigate();
  const { token, save } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revealRef = useRevealRoot([false]);
  const errorRef = useRef(null);
  const errorId = "login-error";

  useEffect(() => {
    if (token) navigate("/runs", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      save(res.data.data.token, res.data.data.username);
      navigate("/runs", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kembali username dan password.");
    } finally {
      setLoading(false);
    }
  }

  function handleCaps(e) {
    try {
      setCapsOn(e.getModifierState ? e.getModifierState("CapsLock") : false);
    } catch {
      setCapsOn(false);
    }
  }

  const CTA =
    "font-polysans text-[16px] tracking-[-0.02em] px-6 py-3.5 rounded-none active:translate-y-[1px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";
  const inputCls =
    "bg-canvas-white border border-mist pl-11 pr-4 py-3 text-[15px] leading-[1.5] text-graphite placeholder:text-slate focus:outline-none focus:border-graphite focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-orange rounded-none w-full transition-colors";
  const labelCls = "flex flex-col gap-2 text-[14px] font-medium text-graphite";

  return (
    <div ref={revealRef} className="min-h-screen bg-fog flex flex-col">
      <main className="flex-1 w-full px-5 py-10 md:py-16 flex justify-center items-center">
        <div className="w-full max-w-[440px] flex flex-col">
          <section aria-labelledby="login-heading" className="reveal bg-canvas-white border border-mist rounded-[6px_0px_0px_0px] p-6 md:p-10">
            <form onSubmit={submit} className="flex flex-col">
              <div className="flex flex-col items-center text-center">
                <Logo size={40} />
                <h1 id="login-heading" className="font-polysans text-heading tracking-[-0.64px] mt-6">
                  Masuk ke AutoQA
                </h1>
              </div>

              <div className="flex flex-col gap-5 mt-8">
                <label htmlFor="login-username" className={labelCls}>
                  Username
                  <span className="relative block">
                    <User
                      size={18}
                      weight="regular"
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                    />
                    <input
                      id="login-username"
                      name="username"
                      required
                      autoFocus
                      autoComplete="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="nama pengguna"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className={inputCls}
                    />
                  </span>
                </label>

                <div className="flex flex-col gap-2">
                  <label htmlFor="login-password" className={labelCls}>
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
                      id="login-password"
                      name="password"
                      required
                      type={show ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onKeyUp={handleCaps}
                      onKeyDown={handleCaps}
                      autoComplete="current-password"
                      placeholder="kata sandi"
                      aria-invalid={error ? true : undefined}
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

                {error && (
                  <p
                    id={errorId}
                    ref={errorRef}
                    role="alert"
                    tabIndex={-1}
                    className="flex items-start gap-2 bg-fog border border-mist rounded-[8px] px-4 py-3 text-[14px] leading-[1.43] text-graphite focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                  >
                    <WarningCircle size={18} weight="bold" className="shrink-0 mt-[2px] text-ember-orange" aria-hidden />
                    <span>{error}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !form.username.trim() || !form.password}
                  className={`${CTA} bg-graphite text-white hover:bg-steel w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />}
                  {loading ? "Memeriksa…" : "Masuk ke dashboard"}
                </button>

                <p className="inline-flex items-center justify-center gap-1.5 text-[13px] text-slate text-center">
                  <ShieldCheck size={15} weight="regular" aria-hidden className="shrink-0" />
                  Lindungi kredensial Anda — jangan bagikan ke siapa pun.
                </p>
              </div>
            </form>
          </section>

          <p className="text-center font-polysans text-[13px] text-slate mt-6">© {new Date().getFullYear()} AutoQA</p>
        </div>
      </main>
    </div>
  );
}
