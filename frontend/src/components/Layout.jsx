import { LogOut, Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ title, subtitle, children }) {
  const { logout, user } = useAuth();
  return (
    <main className="min-h-screen bg-[#f4f8f1]">
      <header className="no-print sticky top-0 z-40 border-b border-emerald-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-leaf text-white shadow-lg shadow-emerald-900/15">
              <Sprout size={22} />
            </div>
            <div>
              <p className="font-malayalam text-lg font-bold text-leaf">അയൽക്കൂട്ടം</p>
              <p className="text-xs text-slate-500">Kudumbashree Neighborhood Group</p>
            </div>
          </div>
          <button onClick={logout} className="btn-soft">
            <LogOut size={16} /> {user?.username}
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-leaf via-emerald-700 to-lagoon px-5 py-6 text-white md:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Ayalkootam Workspace</p>
            <h1 className="mt-2 font-malayalam text-2xl font-extrabold md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">{subtitle}</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
