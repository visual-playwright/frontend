// Mark AutoQA: kotak graphite + dot Ember kanan-bawah (ikonik: live/record).
// Lockup: ikon 32px : wordmark 20px, palet graphite + Ember disamakan ikon <-> teks.
export default function Logo({ size = 32, withWordmark = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="6" fill="#202020" />
        <circle cx="46" cy="46" r="10" fill="#ff682c" />
      </svg>
      {withWordmark && (
        <span className="font-polysans text-[20px] leading-none tracking-[-0.02em] text-graphite">
          AutoQA
          <span aria-hidden className="ml-[3px] inline-block h-[7px] w-[7px] bg-ember-orange" />
        </span>
      )}
    </span>
  );
}
