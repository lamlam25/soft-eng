type Row = {
  subject: string;
  percent: number;
};

export default function ProgressChart({ rows }: { rows: Row[] }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.subject}>
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>{row.subject}</span>
            <span className="text-indigo-700">{row.percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all"
              style={{ width: `${row.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
