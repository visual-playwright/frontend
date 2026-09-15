import { StatusInline } from "./RunCard.jsx";

export default function StepTable({ steps }) {
  if (!steps.length) return <p className="text-[14px] text-slate">Belum ada steps.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px] min-w-[720px]">
        <thead>
          <tr className="text-left text-slate">
            <th className="border-b border-mist p-2.5 font-medium">No</th>
            <th className="border-b border-mist p-2.5 font-medium">Instruksi</th>
            <th className="border-b border-mist p-2.5 font-medium">Elemen Visual</th>
            <th className="border-b border-mist p-2.5 font-medium">Status</th>
            <th className="border-b border-mist p-2.5 font-medium">Reasoning</th>
            <th className="border-b border-mist p-2.5 font-medium">Catatan</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={i} className="hover:bg-fog align-top">
              <td className="border-b border-mist p-2.5">{s.no}</td>
              <td className="border-b border-mist p-2.5 font-medium">{s.instruction}</td>
              <td className="border-b border-mist p-2.5 text-steel">{s.visual_element}</td>
              <td className="border-b border-mist p-2.5">
                <StatusInline value={s.status} />
              </td>
              <td className="border-b border-mist p-2.5">{s.dynamic_reasoning}</td>
              <td className="border-b border-mist p-2.5 text-steel">{s.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
