import { JustifyTool } from "./components/JustifyTool";
import { Toaster } from "sonner";
import { Cookie } from "lucide-react";
import { motion } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-x-hidden flex items-center justify-center py-12">
      {/* Floating Cookie */}
      <div className="fixed bottom-6 right-6 z-60 group">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="bg-slate-900 p-4 rounded-full shadow-2xl border border-slate-800 cursor-pointer relative z-10 hover:scale-110 transition-transform"
          >
            <Cookie className="w-8 h-8 text-amber-500 fill-amber-500/10" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360, x: [10, 20, 10], y: [-10, -20, -10] }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-4 -left-4 bg-white p-1.5 rounded-full shadow-lg border border-amber-50"
          >
            <Cookie className="w-3 h-3 text-amber-500" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360, x: [-15, -25, -15], y: [5, 15, 5] }}
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
              x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -bottom-2 -left-6 bg-white p-2 rounded-full shadow-lg border border-amber-50"
          >
            <Cookie className="w-4 h-4 text-amber-700" />
          </motion.div>
          <div className="absolute bottom-full right-0 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-4 group-hover:translate-y-0">
            <div className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-2xl whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-slate-800">
              <span>
                Sans vouloir faire de pot-de-vin, je vous assure que mes cookies
                praliné sont très bon...
              </span>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-800" />
            </div>
          </div>
        </div>
      </div>

      <main className="w-full">
        <JustifyTool apiUrl={API_URL} />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
