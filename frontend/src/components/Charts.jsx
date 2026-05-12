import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }) {
  return (
    <div className="h-72 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5">
      <h2 className="mb-3 text-sm font-bold text-slate-800">Balance trend</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#176B3A" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MoneyPie({ thrift = 0, loans = 0 }) {
  const data = [
    { name: "Thrift", value: thrift },
    { name: "Loans", value: loans }
  ];
  return (
    <div className="h-72 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5">
      <h2 className="mb-3 text-sm font-bold text-slate-800">Thrift / Loans</h2>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={78} label>
            <Cell fill="#176B3A" />
            <Cell fill="#C77822" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
