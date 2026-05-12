import { useEffect, useMemo, useState } from "react";
import { Download, FileText, HandCoins, IndianRupee, PiggyBank, QrCode, ShieldCheck, Smartphone, UsersRound, WalletCards, X } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { MoneyPie, TrendChart } from "../components/Charts";
import TransactionTable from "../components/TransactionTable";
import { api, downloadUrl } from "../api/client";

const emptyLoan = { memberId: "", amount: "", installments: 10, purpose: "" };

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

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [collections, setCollections] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ googlePayNumber: "", upiId: "", qrImageUrl: "", note: "" });
  const [weekly, setWeekly] = useState({});
  const [loan, setLoan] = useState(emptyLoan);
  const [editMember, setEditMember] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [summaryRes, membersRes, txRes, loanRes, withdrawalRes, paymentRes, collectionRes] = await Promise.all([
      api.get("/admin/summary"),
      api.get("/members"),
      api.get("/transactions"),
      api.get("/loans"),
      api.get("/withdrawals"),
      api.get("/payments"),
      api.get("/collections")
    ]);
    setSummary(summaryRes.data);
    setMembers(membersRes.data);
    setTransactions(txRes.data);
    setLoans(loanRes.data);
    setWithdrawals(withdrawalRes.data);
    setPaymentSettings(paymentRes.data);
    setCollections(collectionRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const paidToday = Object.values(weekly).reduce((sum, value) => sum + Number(value || 0), 0);
    return { paidToday };
  }, [weekly]);

  async function saveWeekly(e) {
    e.preventDefault();
    await api.post("/transactions/weekly", {
      date: new Date(),
      payments: members.map((member) => ({ memberId: member._id, amount: Number(weekly[member._id] || 0) }))
    });
    setWeekly({});
    setMessage("Weekly collection saved");
    load();
  }

  async function issueLoan(e) {
    e.preventDefault();
    await api.post("/loans", loan);
    setLoan(emptyLoan);
    setMessage("Loan issued");
    load();
  }

  async function saveMember(e) {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/members/${editMember._id}`, {
        name: editMember.name,
        username: editMember.username,
        phone: editMember.phone || "",
        address: editMember.address || "",
        password: editMember.password || undefined
      });
      setEditMember(null);
      setMessage("Member profile updated");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update member profile");
    }
  }

  async function approveLoan(id, status) {
    await api.patch(`/loans/${id}/status`, { status });
    setMessage(status === "active" ? "Loan approved" : "Loan rejected");
    load();
  }

  async function reviewWithdrawal(id, status) {
    setError("");
    try {
      await api.patch(`/withdrawals/${id}/status`, { status });
      setMessage(status === "approved" ? "Withdrawal approved" : "Withdrawal rejected");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not review withdrawal request");
    }
  }

  async function reviewCollection(id, status) {
    setError("");
    try {
      await api.patch(`/collections/${id}/status`, { status });
      setMessage(status === "approved" ? "Online collection approved and added to total thrift" : "Online collection rejected");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not review collection request");
    }
  }

  async function restoreBackup(file) {
    if (!file) return;
    const text = await file.text();
    await api.post("/admin/restore", JSON.parse(text));
    setMessage("Backup restored");
    load();
  }

  async function savePaymentSettings(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.put("/payments", paymentSettings);
      setPaymentSettings(data);
      setMessage("Online payment details updated");
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Could not update payment settings");
    }
  }

  function authDownload(path) {
    const token = localStorage.getItem("ayalkootam_token");
    window.open(`${downloadUrl(path)}?token=${token}`, "_blank");
  }

  const pendingLoans = loans.filter((item) => item.status === "requested");
  const pendingWithdrawals = withdrawals.filter((item) => item.status === "requested");
  const pendingCollections = collections.filter((item) => item.status === "requested");

  return (
    <Layout title="Admin Dashboard / ഭരണ സമിതി" subtitle="A premium command center for weekly collection, member records, interest-free loans, withdrawals and reports.">
      {message && <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-leaf">{message}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={summary?.totalMembers ?? 20} icon={UsersRound} />
        <StatCard label="Total thrift" value={`Rs.${summary?.totalThrift || 0}`} icon={PiggyBank} />
        <StatCard label="Loans issued" value={`Rs.${summary?.loansIssued || 0}`} icon={HandCoins} accent="spice" />
        <StatCard label="Outstanding" value={`Rs.${summary?.outstanding || 0}`} icon={IndianRupee} accent="spice" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <TrendChart data={summary?.trend || []} />
        <MoneyPie thrift={summary?.totalThrift || 0} loans={summary?.loansIssued || 0} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Weekly Collection / ആഴ്ചപ്പിരിവ്" subtitle="Enter all 20 members' thrift payments from the weekly meeting.">
          <form onSubmit={saveWeekly} className="space-y-4">
            <div className="grid max-h-[30rem] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {members.map((member) => (
                <label key={member._id} className="grid grid-cols-[1fr_110px] items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{member.memberNo}. {member.name}</span>
                    <span className="text-xs text-slate-500">{member.username}</span>
                  </span>
                  <input className="input bg-white" type="number" min="0" placeholder="Rs." value={weekly[member._id] || ""} onChange={(e) => setWeekly({ ...weekly, [member._id]: e.target.value })} />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-sm font-extrabold text-slate-800">Today collected: Rs.{totals.paidToday}</span>
              <button className="btn-primary">Save Collection</button>
            </div>
          </form>
        </Panel>

        <div className="grid gap-5">
          <Panel title="Interest-free Loan" subtitle="Issue a direct group loan.">
            <form onSubmit={issueLoan} className="grid gap-3">
              <select className="input" value={loan.memberId} onChange={(e) => setLoan({ ...loan, memberId: e.target.value })} required>
                <option value="">Select member</option>
                {members.map((member) => <option key={member._id} value={member._id}>{member.memberNo}. {member.name}</option>)}
              </select>
              <input className="input" type="number" placeholder="Loan amount" value={loan.amount} onChange={(e) => setLoan({ ...loan, amount: e.target.value })} required />
              <input className="input" type="number" placeholder="Installments" value={loan.installments} onChange={(e) => setLoan({ ...loan, installments: e.target.value })} required />
              <input className="input" placeholder="Purpose" value={loan.purpose} onChange={(e) => setLoan({ ...loan, purpose: e.target.value })} />
              <button className="btn-primary">Issue Loan</button>
            </form>
          </Panel>

          <Panel title="Reports & Backup" subtitle="Download ledgers and restore data.">
            <div className="grid gap-2">
              <button className="btn-soft justify-start" onClick={() => authDownload("/transactions/export/csv")}><Download size={16} /> Export CSV</button>
              <button className="btn-soft justify-start" onClick={() => authDownload("/transactions/export/pdf")}><FileText size={16} /> Download PDF</button>
              <button className="btn-soft justify-start" onClick={() => authDownload("/admin/backup")}><Download size={16} /> Backup JSON</button>
              <label className="btn-soft cursor-pointer justify-start">
                <ShieldCheck size={16} /> Restore Backup
                <input type="file" accept="application/json" className="hidden" onChange={(e) => restoreBackup(e.target.files?.[0])} />
              </label>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5">
        <Panel title="Online Payment Setup / ഓൺലൈൻ പേയ്മെന്റ്" subtitle="Members will see these Google Pay and QR scanner details in their dashboard." action={<Smartphone className="text-leaf" size={22} />}>
          <form onSubmit={savePaymentSettings} className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input" placeholder="Google Pay number" value={paymentSettings.googlePayNumber || ""} onChange={(e) => setPaymentSettings({ ...paymentSettings, googlePayNumber: e.target.value })} />
              <input className="input" placeholder="UPI ID" value={paymentSettings.upiId || ""} onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })} />
              <input className="input md:col-span-2" placeholder="QR scanner image URL" value={paymentSettings.qrImageUrl || ""} onChange={(e) => setPaymentSettings({ ...paymentSettings, qrImageUrl: e.target.value })} />
              <textarea className="input min-h-20 md:col-span-2" placeholder="Payment note for members" value={paymentSettings.note || ""} onChange={(e) => setPaymentSettings({ ...paymentSettings, note: e.target.value })} />
              <button className="btn-primary md:w-fit">Save Payment Details</button>
            </div>
            <div className="grid min-h-48 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              {paymentSettings.qrImageUrl ? (
                <img src={paymentSettings.qrImageUrl} alt="Payment QR scanner" className="max-h-44 rounded-lg bg-white object-contain p-2" />
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <QrCode className="mx-auto mb-2 text-leaf" size={38} />
                  QR preview appears here
                </div>
              )}
            </div>
          </form>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-4">
        <Panel title="Members / അംഗങ്ങൾ" subtitle="Open a member profile to edit login and contact details.">
          <div className="max-h-96 overflow-y-auto pr-1">
            {members.map((member) => (
              <button key={member._id} onClick={() => setEditMember({ ...member, password: "" })} className="mb-2 grid w-full grid-cols-[42px_1fr_auto] items-center gap-3 rounded-lg border border-emerald-100 bg-white p-3 text-left text-sm transition hover:border-leaf hover:bg-emerald-50">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 font-extrabold text-leaf">{member.memberNo}</span>
                <span>
                  <span className="block font-bold text-slate-900">{member.name}</span>
                  <span className="text-xs text-slate-500">{member.username} | {member.phone || "No phone"}</span>
                </span>
                <span className="text-xs font-bold text-leaf">Edit</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Online Collections / ഓൺലൈൻ അടവ്" subtitle={`${pendingCollections.length} pending`}>
          <div className="space-y-3">
            {pendingCollections.map((item) => (
              <div key={item._id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm">
                <p className="font-bold text-slate-900">{item.member?.name}</p>
                <p className="text-slate-600">Rs.{item.amount} | {item.reference || "No reference"}</p>
                <p className="mt-1 text-slate-500">{item.note || "Online thrift payment"}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary" onClick={() => reviewCollection(item._id, "approved")}>Approve</button>
                  <button className="btn-soft" onClick={() => reviewCollection(item._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {!pendingCollections.length && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-slate-600">No pending online collections</p>}
          </div>
        </Panel>

        <Panel title="Loan Requests / അപേക്ഷകൾ" subtitle={`${pendingLoans.length} pending`}>
          <div className="space-y-3">
            {pendingLoans.map((item) => (
              <div key={item._id} className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm">
                <p className="font-bold text-slate-900">{item.member?.name}</p>
                <p className="text-slate-600">Rs.{item.amount} | {item.installments} installments</p>
                <p className="mt-1 text-slate-500">{item.purpose || "No purpose added"}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary" onClick={() => approveLoan(item._id, "active")}>Approve</button>
                  <button className="btn-soft" onClick={() => approveLoan(item._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {!pendingLoans.length && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-slate-600">No pending loan requests</p>}
          </div>
        </Panel>

        <Panel title="Withdrawal Requests / പിൻവലിക്കൽ" subtitle={`${pendingWithdrawals.length} pending`}>
          <div className="space-y-3">
            {pendingWithdrawals.map((item) => (
              <div key={item._id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm">
                <p className="font-bold text-slate-900">{item.member?.name}</p>
                <p className="text-slate-600">Rs.{item.amount} | Balance Rs.{item.member?.balance || 0}</p>
                <p className="mt-1 text-slate-500">{item.reason || "No reason added"}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary" onClick={() => reviewWithdrawal(item._id, "approved")}>Approve</button>
                  <button className="btn-soft" onClick={() => reviewWithdrawal(item._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {!pendingWithdrawals.length && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-slate-600">No pending withdrawal requests</p>}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Transaction Ledger / രേഖകൾ" subtitle="Latest group transactions and passbook entries." action={<WalletCards className="text-leaf" size={22} />}>
          <TransactionTable transactions={transactions} />
        </Panel>
      </div>

      {editMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <form onSubmit={saveMember} className="w-full max-w-lg rounded-xl border border-emerald-100 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Edit Member</h2>
                <p className="text-sm text-slate-500">Update profile, username and password</p>
              </div>
              <button type="button" onClick={() => setEditMember(null)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3">
              <input className="input" value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} placeholder="Name" required />
              <input className="input" value={editMember.username} onChange={(e) => setEditMember({ ...editMember, username: e.target.value })} placeholder="Username" minLength={3} required />
              <input className="input" type="password" value={editMember.password} onChange={(e) => setEditMember({ ...editMember, password: e.target.value })} placeholder="New password, leave blank to keep current" minLength={6} />
              <input className="input" value={editMember.phone} onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })} placeholder="Phone" />
              <textarea className="input min-h-24" value={editMember.address} onChange={(e) => setEditMember({ ...editMember, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditMember(null)} className="btn-soft">Cancel</button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
