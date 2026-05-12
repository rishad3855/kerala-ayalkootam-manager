import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeIndianRupee, Lock, ShieldCheck, Sprout, UserRound, UsersRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const quickLogins = [
  { label: "Admin", username: "admin", password: "admin123", icon: ShieldCheck },
  { label: "Member", username: "member1", password: "password1", icon: UsersRound }
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loggedIn = await login(form.username, form.password);
      navigate(loggedIn.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function chooseLogin(item) {
    setSelectedRole(item.label);
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf1] px-4 py-8 text-slate-900">
      <div className="absolute inset-0 login-pattern" />
      <motion.div
        aria-hidden="true"
        className="absolute left-0 top-0 h-24 w-full bg-leaf/90"
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-20 w-full bg-spice/15"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }} className="rounded-lg border border-white/25 bg-leaf/80 p-5 text-white shadow-xl shadow-emerald-950/20 backdrop-blur-md lg:pr-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur">
            <Sprout size={18} /> Kudumbashree Neighborhood Group
          </div>
          <h1 className="mt-6 font-malayalam text-4xl font-extrabold leading-tight text-white md:text-6xl">
            അയൽക്കൂട്ടം മാനേജർ
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50 md:text-lg">
            Weekly thrift collection, member passbooks, small loans and local group reports in one calm, mobile-friendly workspace.
          </p>
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["20", "Fixed members"],
              ["Weekly", "Collection flow"],
              ["PDF/CSV", "Reports"]
            ].map(([value, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="rounded-lg border border-white/25 bg-emerald-950/20 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-50">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full rounded-lg border border-white/60 bg-white/80 p-5 shadow-xl shadow-emerald-950/10 backdrop-blur-xl md:p-7"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Secure login</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Welcome back</h2>
              <p className="mt-1 font-malayalam text-sm text-slate-600">അഡ്മിൻ / അംഗം ആയി പ്രവേശിക്കുക</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 3, -3, 0], y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="grid h-12 w-12 place-items-center rounded-md bg-emerald-50 text-leaf"
            >
              <BadgeIndianRupee size={24} />
            </motion.div>
          </div>

          <div className="mb-5 rounded-md border border-emerald-100 bg-emerald-50 p-1">
            <div className="grid grid-cols-2 gap-1">
            {quickLogins.map((item) => {
              const Icon = item.icon;
              const active = selectedRole === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => chooseLogin(item)}
                  className={`group relative flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-extrabold transition ${
                    active ? "text-leaf" : "text-slate-600 hover:text-leaf"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="login-role-active"
                      className="absolute inset-0 rounded-md bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={17} /> {item.label}
                  </span>
                </button>
              );
            })}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <motion.label className="block" whileFocusWithin={{ scale: 1.01 }}>
              <span className="mb-1 block text-sm font-semibold text-slate-700">Username</span>
              <div className="flex h-12 items-center gap-3 rounded-md border border-emerald-200 bg-white px-2 ring-leaf/20 transition focus-within:ring-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-50 text-leaf">
                  <UserRound size={17} />
                </span>
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder={selectedRole === "Admin" ? "Enter admin username" : "Enter member username"}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </motion.label>
            <motion.label className="block" whileFocusWithin={{ scale: 1.01 }}>
              <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
              <div className="flex h-12 items-center gap-3 rounded-md border border-emerald-200 bg-white px-2 ring-leaf/20 transition focus-within:ring-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-50 text-leaf">
                  <Lock size={17} />
                </span>
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </motion.label>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.98 }} className="btn-primary h-11 w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login to dashboard"}
              {!loading && <ArrowRight size={17} />}
            </motion.button>
          </form>
        </motion.section>
      </section>
    </main>
  );
}
