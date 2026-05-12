import { useEffect, useMemo, useState } from "react";
import { Banknote, FileText, HandCoins, IndianRupee, Printer, QrCode, Smartphone, WalletCards } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Panel({ title, subtitle, children, action }) {
  return (
    <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-malayalam text-lg font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [member, setMember] = useState(user?.member);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionPayment, setCollectionPayment] = useState({ amount: "", reference: "", note: "" });
  const [request, setRequest] = useState({ amount: "", installments: 10, purpose: "" });
  const [withdrawal, setWithdrawal] = useState({ amount: "", reason: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [memberRes, txRes, loanRes, withdrawalRes, paymentRes, collectionRes] = await Promise.all([
      api.get("/members/me"),
      api.get("/transactions"),
      api.get("/loans"),
      api.get("/withdrawals"),
      api.get("/payments"),
      api.get("/collections")
    ]);
    setMember(memberRes.data);
    setTransactions(txRes.data);
    setLoans(loanRes.data);
    setWithdrawals(withdrawalRes.data);
    setPaymentSettings(paymentRes.data);
    setCollections(collectionRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  const activeLoan = loans.find((loan) => loan.status === "active" || loan.status === "requested");
  const thriftTotal = useMemo(() => transactions.filter((tx) => tx.type === "thrift").reduce((sum, tx) => sum + tx.amount, 0), [transactions]);
  const pendingWithdrawal = withdrawals.find((item) => item.status === "requested");

  async function requestLoan(e) {
    e.preventDefault();
    setError("");
    await api.post("/loans/request", request);
    setRequest({ amount: "", installments: 10, purpose: "" });
    setMessage("Loan request sent to admin");
    load();
  }

  async function requestWithdrawal(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/withdrawals/request", withdrawal);
      setWithdrawal({ amount: "", reason: "" });
      setMessage("Withdrawal request sent to admin");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send withdrawal request");
    }
  }

  async function submitOnlineCollection(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/collections/request", collectionPayment);
      setCollectionPayment({ amount: "", reference: "", note: "" });
      setMessage("Online collection submitted for admin approval");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit online collection");
    }
  }

  return (
    <Layout title="Member Dashboard / പാസ്‌ബുക്ക്" subtitle={`${member?.name || "Member"} can view balance, loan status, withdrawal requests and passbook history.`}>
      {message && <div className="no-print mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-leaf">{message}</div>}
      {error && <div className="no-print mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current balance" value={`Rs.${member?.balance || 0}`} icon={IndianRupee} />
        <StatCard label="Thrift paid" value={`Rs.${thriftTotal}`} icon={HandCoins} />
        <StatCard label="Loan status" value={activeLoan ? activeLoan.status : "No active loan"} icon={FileText} accent="spice" />
      </div>

      <div className="no-print mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Member Profile / അംഗ വിവരങ്ങൾ" subtitle="Your group account summary." action={<WalletCards className="text-leaf" size={22} />}>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Member</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{member?.name}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <p><span className="font-bold text-slate-800">Username:</span> {member?.username}</p>
              <p><span className="font-bold text-slate-800">Phone:</span> {member?.phone || "Not added"}</p>
              <p><span className="font-bold text-slate-800">Joined:</span> {member?.joinDate ? new Date(member.joinDate).toLocaleDateString() : ""}</p>
            </div>
          </div>
          {activeLoan && (
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-slate-700">
              <p className="font-extrabold text-slate-900">Interest-free loan</p>
              <p className="mt-1">Rs.{activeLoan.amount} | Installment approx Rs.{Math.ceil(activeLoan.totalPayable / activeLoan.installments)} | Outstanding Rs.{activeLoan.outstanding}</p>
            </div>
          )}
          {pendingWithdrawal && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-slate-700">
              <p className="font-extrabold text-slate-900">Pending withdrawal</p>
              <p className="mt-1">Rs.{pendingWithdrawal.amount} | {pendingWithdrawal.reason || "No reason added"}</p>
            </div>
          )}
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Loan Request / വായ്പ അപേക്ഷ" subtitle="Request an interest-free group loan." action={<Banknote className="text-leaf" size={22} />}>
            <form onSubmit={requestLoan} className="grid gap-3">
              <input className="input" type="number" min="1" placeholder="Amount" value={request.amount} onChange={(e) => setRequest({ ...request, amount: e.target.value })} required />
              <input className="input" type="number" min="1" placeholder="Installments" value={request.installments} onChange={(e) => setRequest({ ...request, installments: e.target.value })} required />
              <input className="input" placeholder="Purpose" value={request.purpose} onChange={(e) => setRequest({ ...request, purpose: e.target.value })} />
              <button className="btn-primary">Send Request</button>
            </form>
          </Panel>

          <Panel title="Withdrawal Request / പണം പിൻവലിക്കൽ" subtitle="Ask admin to release money from your balance." action={<IndianRupee className="text-leaf" size={22} />}>
            <form onSubmit={requestWithdrawal} className="grid gap-3">
              <input className="input" type="number" min="1" max={member?.balance || undefined} placeholder="Amount from balance" value={withdrawal.amount} onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })} required />
              <input className="input" placeholder="Reason" value={withdrawal.reason} onChange={(e) => setWithdrawal({ ...withdrawal, reason: e.target.value })} />
              <button className="btn-primary">Request Withdrawal</button>
            </form>
          </Panel>
        </div>
      </div>

      <div className="no-print mt-5">
        <Panel title="Pay Online / ഓൺലൈൻ അടവ്" subtitle="Use these details for online thrift payment, then inform admin." action={<Smartphone className="text-leaf" size={22} />}>
          <div className="grid gap-5 lg:grid-cols-[220px_1fr_1fr]">
            <div className="grid min-h-56 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              {paymentSettings?.qrImageUrl ? (
                <img src={paymentSettings.qrImageUrl} alt="Payment QR scanner" className="max-h-52 rounded-lg bg-white object-contain p-2" />
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <QrCode className="mx-auto mb-2 text-leaf" size={44} />
                  QR scanner not added yet
                </div>
              )}
            </div>
            <div className="grid content-center gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Google Pay Number</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{paymentSettings?.googlePayNumber || "Not added"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">UPI ID</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{paymentSettings?.upiId || "Not added"}</p>
              </div>
              {paymentSettings?.note && <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-leaf">{paymentSettings.note}</p>}
            </div>
            <form onSubmit={submitOnlineCollection} className="grid content-center gap-3 rounded-xl border border-emerald-100 bg-white p-4">
              <p className="text-sm font-extrabold text-slate-900">Submit payment for approval</p>
              <input className="input" type="number" min="1" placeholder="Paid amount" value={collectionPayment.amount} onChange={(e) => setCollectionPayment({ ...collectionPayment, amount: e.target.value })} required />
              <input className="input" placeholder="UPI reference / transaction ID" value={collectionPayment.reference} onChange={(e) => setCollectionPayment({ ...collectionPayment, reference: e.target.value })} />
              <input className="input" placeholder="Note" value={collectionPayment.note} onChange={(e) => setCollectionPayment({ ...collectionPayment, note: e.target.value })} />
              <button className="btn-primary">Send to Admin</button>
            </form>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {collections.slice(0, 3).map((item) => (
              <div key={item._id} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                <p className="font-bold text-slate-900">Rs.{item.amount}</p>
                <p className="capitalize text-leaf">{item.status}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="no-print mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Loan History" subtitle="Recent loan activity">
          <div className="space-y-2">
            {loans.slice(0, 5).map((loan) => (
              <div key={loan._id} className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 text-sm">
                <span>Rs.{loan.amount} - {loan.purpose || "Loan"}</span>
                <span className="font-bold capitalize text-spice">{loan.status}</span>
              </div>
            ))}
            {!loans.length && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No loan records yet</p>}
          </div>
        </Panel>

        <Panel title="Withdrawal History" subtitle="Recent withdrawal requests">
          <div className="space-y-2">
            {withdrawals.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                <span>Rs.{item.amount} - {item.reason || "Withdrawal"}</span>
                <span className="font-bold capitalize text-leaf">{item.status}</span>
              </div>
            ))}
            {!withdrawals.length && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No withdrawal requests yet</p>}
          </div>
        </Panel>
      </div>

      <section className="print-card mt-5 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-malayalam text-lg font-extrabold text-slate-900">Passbook History / ഇടപാട് വിവരങ്ങൾ</h2>
            <p className="text-sm text-slate-500">{member?.username} | Joined {member?.joinDate ? new Date(member.joinDate).toLocaleDateString() : ""}</p>
          </div>
          <button className="btn-soft no-print" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </div>
        <TransactionTable transactions={transactions} />
      </section>
    </Layout>
  );
}
