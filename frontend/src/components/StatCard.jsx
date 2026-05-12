import { motion } from "framer-motion";

export default function StatCard({ label, value, icon: Icon, accent = "leaf" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{value}</p>
        </div>
        {Icon && (
          <div className={`grid h-12 w-12 place-items-center rounded-lg ${accent === "spice" ? "bg-orange-50 text-spice" : "bg-emerald-50 text-leaf"}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
