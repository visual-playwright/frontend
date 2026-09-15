// Kartu metrik Ventriloc: permukaan putih, radius 20px, tanpa shadow.
export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-canvas-white rounded-[20px] p-5 md:p-6">
      <p className="text-[13px] md:text-[14px] text-slate">{label}</p>
      <p className="font-mono tabular-nums text-[28px] md:text-heading-lg leading-[1.2] tracking-[-0.8px] mt-1 break-all">
        {value}
      </p>
      {sub && <p className="font-polysans text-[13px] text-brass mt-1">{sub}</p>}
    </div>
  );
}
