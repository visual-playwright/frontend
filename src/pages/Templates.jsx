import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowClockwise,
  CheckCircle,
  CircleNotch,
  FileText,
  WarningCircle,
} from "@phosphor-icons/react";
import api from "../utils/api.js";
import useRevealRoot from "../hooks/useRevealRoot.js";

const FALLBACK = [
  { id: "R-01", title: "Login" },
  { id: "R-02", title: "Create" },
  { id: "R-03", title: "Update" },
  { id: "R-04", title: "Delete" },
  { id: "R-05", title: "Logout" },
];

const MIN_LEN = 10;

const CTA =
  "font-polysans text-[16px] tracking-[-0.02em] bg-graphite text-white px-5 py-2.5 rounded-none hover:bg-steel transition-colors inline-flex items-center gap-2 active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";
const GHOST =
  "font-polysans text-[14px] tracking-[-0.02em] border border-graphite text-graphite px-4 py-2 rounded-none hover:bg-ash transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange";

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function Templates() {
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [active, setActive] = useState(null);
  const [meta, setMeta] = useState(null);
  const [saved, setSaved] = useState("");
  const [content, setContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const revealRef = useRevealRoot([listLoading]);
  const noticeRef = useRef(null);

  const dirty = content !== saved;
  const tooShort = content.trim().length < MIN_LEN;
  const lines = content === "" ? 0 : content.split("\n").length;

  const open = useCallback(async (id) => {
    setActive(id);
    setDocLoading(true);
    setDocError("");
    setNotice(null);
    try {
      const res = await api.get(`/templates/${id}`);
      setMeta(res.data.data);
      setSaved(res.data.data.content_md || "");
      setContent(res.data.data.content_md || "");
    } catch (err) {
      setDocError(err.response?.data?.message || "Gagal membuka template.");
      setMeta(null);
      setSaved("");
      setContent("");
    } finally {
      setDocLoading(false);
    }
  }, []);

  async function loadList(autoOpen) {
    setListLoading(true);
    setListError("");
    try {
      const r = await api.get("/templates");
      const rows = r.data.data || [];
      setList(rows);
      if (autoOpen && rows.length > 0) open(rows[0].id);
      else if (autoOpen) open(FALLBACK[0].id);
    } catch {
      setListError("Gagal memuat daftar template. Pastikan backend berjalan.");
      setList([]);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (notice) noticeRef.current?.focus?.();
  }, [notice]);

  async function save() {
    if (!active || saving || !dirty || tooShort) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await api.put(`/templates/${active}`, { content });
      setSaved(content);
      setNotice({ ok: true, text: res.data?.message || "Template berhasil diperbarui." });
    } catch (err) {
      setNotice({ ok: false, text: err.response?.data?.message || "Gagal menyimpan template." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!dirty) return;
    if (window.confirm("Buang perubahan dan kembalikan ke versi tersimpan?")) {
      setContent(saved);
      setNotice(null);
    }
  }

  function onEditorKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    }
  }

  const items = useMemo(() => (list.length ? list : FALLBACK), [list]);
  const activeItem = items.find((t) => t.id === active) ?? null;

  return (
    <section ref={revealRef} aria-labelledby="templates-heading">
      <h1 id="templates-heading" className="font-polysans text-heading tracking-[-0.64px]">
        Templates
      </h1>
      <p className="text-[16px] md:text-[18px] text-steel mt-1 max-w-[62ch]">
        Instruksi yang dibaca LLM untuk tiap skenario R-01 sampai R-05. Perubahan berlaku untuk run berikutnya.
      </p>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start mt-8">
        {/* Daftar */}
        <nav aria-label="Daftar template" className="reveal bg-ash rounded-[8px] p-4 md:p-5">
          {listLoading ? (
            <div>
              <p className="sr-only" role="status">
                Memuat daftar template…
              </p>
              <div aria-hidden className="flex flex-col gap-2 animate-pulse">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-canvas-white rounded-[8px] px-4 py-3.5">
                    <div className="h-4 bg-ash rounded-[8px] w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : listError ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <WarningCircle size={24} weight="regular" className="text-ember-orange" aria-hidden />
              <p className="text-steel text-[14px]">{listError}</p>
              <button type="button" onClick={() => loadList(false)} className={CTA}>
                <ArrowClockwise size={16} weight="bold" aria-hidden /> Coba lagi
              </button>
            </div>
          ) : (
            <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
              {items.map((t) => {
                const on = active === t.id;
                return (
                  <li key={t.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => open(t.id)}
                      aria-current={on || undefined}
                      className={`w-full flex items-center gap-3 rounded-[8px] border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
                        on ? "bg-graphite border-graphite text-white" : "bg-canvas-white border-mist hover:border-slate"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`font-polysans text-[13px] rounded-[20px] px-2.5 py-0.5 tabular-nums shrink-0 ${
                          on ? "bg-canvas-white text-graphite" : "bg-fog text-graphite"
                        }`}
                      >
                        {t.id}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block font-polysans text-[15px] tracking-[-0.02em] truncate ${on ? "text-white" : "text-graphite"}`}>
                          {t.title || t.id}
                        </span>
                        {t.updated_at && (
                          <span className={`block text-[12px] mt-0.5 ${on ? "text-white/70" : "text-slate"}`}>
                            Diubah {fmtDate(t.updated_at)}
                          </span>
                        )}
                      </span>
                      {on && dirty && (
                        <span aria-label="Ada perubahan belum disimpan" title="Ada perubahan belum disimpan" className="w-2 h-2 rounded-full bg-ember-orange shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Editor */}
        <div className="reveal bg-ash rounded-[6px_0px_0px_0px] p-5 md:p-8 min-w-0">
          {!active ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <FileText size={28} weight="regular" className="text-slate" aria-hidden />
              <p className="text-steel text-[14px]">Pilih template di daftar untuk mulai mengedit.</p>
            </div>
          ) : docLoading ? (
            <div>
              <p className="sr-only" role="status">
                Membuka {active}…
              </p>
              <div aria-hidden className="animate-pulse">
                <div className="h-6 bg-mist rounded-[8px] w-1/3" />
                <div className="h-72 bg-canvas-white rounded-[8px] mt-4" />
              </div>
            </div>
          ) : docError ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <WarningCircle size={28} weight="regular" className="text-ember-orange" aria-hidden />
              <p className="text-steel text-[14px]">{docError}</p>
              <button type="button" onClick={() => open(active)} className={CTA}>
                <ArrowClockwise size={16} weight="bold" aria-hidden /> Coba lagi
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-polysans text-[13px] tracking-[0.08em] text-brass">
                    {active}
                    {dirty && <span aria-hidden className="text-ember-orange"> ●</span>}
                    {dirty && <span className="sr-only"> (ada perubahan belum disimpan)</span>}
                  </p>
                  <h2 className="font-polysans text-[20px] tracking-[-0.02em] mt-1 truncate">
                    {activeItem?.title || meta?.title || active}
                  </h2>
                </div>
                <p aria-live="polite" className="font-mono tabular-nums text-[13px] text-slate shrink-0">
                  {content.length.toLocaleString("id-ID")} karakter · {lines} baris
                </p>
              </div>

              <div>
                <label htmlFor="template-editor" className="sr-only">
                  Isi template {active}
                </label>
                <textarea
                  id="template-editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={onEditorKey}
                  rows={24}
                  spellCheck={false}
                  aria-describedby={notice && !notice.ok ? "template-notice" : undefined}
                  className="w-full min-h-[320px] bg-canvas-white border border-mist rounded-none p-4 font-mono text-[13px] md:text-[14px] leading-[1.6] text-graphite focus:outline-none focus:border-graphite focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-orange transition-colors"
                />
                <p className="text-[13px] text-slate mt-2">
                  Variabel yang tersedia:{" "}
                  <span className="font-mono text-graphite">{"{{APP_DOMAIN}} {{URL}} {{USERNAME}} {{PASSWORD}}"}</span>
                  {" "}· Ctrl+S untuk menyimpan.
                </p>
                {tooShort && content.length > 0 && (
                  <p className="text-[13px] text-ember-orange mt-1">
                    Isi template minimal {MIN_LEN} karakter agar bisa disimpan.
                  </p>
                )}
              </div>

              {notice && (
                <p
                  id="template-notice"
                  ref={noticeRef}
                  role={notice.ok ? "status" : "alert"}
                  tabIndex={-1}
                  className="flex items-start gap-2 bg-canvas-white border border-mist rounded-[8px] px-4 py-3 text-[14px] leading-[1.43] text-graphite focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
                >
                  {notice.ok ? (
                    <CheckCircle size={18} weight="bold" className="shrink-0 mt-[2px] text-brass" aria-hidden />
                  ) : (
                    <WarningCircle size={18} weight="bold" className="shrink-0 mt-[2px] text-ember-orange" aria-hidden />
                  )}
                  <span>{notice.text}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={save} disabled={saving || !dirty || tooShort} className={CTA}>
                  {saving && <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden />}
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
                <button type="button" onClick={discard} disabled={saving || !dirty} className={GHOST}>
                  Muat ulang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
