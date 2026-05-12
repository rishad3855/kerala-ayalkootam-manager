export default function TransactionTable({ transactions }) {
  return (
    <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{tx.member?.name || "You"}</td>
                <td className="px-4 py-3 capitalize">{tx.type.replace("_", " ")}</td>
                <td className="px-4 py-3 font-semibold">Rs.{tx.amount}</td>
                <td className="px-4 py-3 text-slate-600">{tx.description}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan="5">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
