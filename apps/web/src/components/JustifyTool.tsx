import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Type,
  Send,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Hash,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

const MAX_WORDS_PER_DAY = 80000;

interface Props {
  apiUrl: string;
}

export function JustifyTool({ apiUrl }: Props) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("justify_token"),
  );
  const [email, setEmail] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordsRemaining, setWordsRemaining] = useState(MAX_WORDS_PER_DAY);
  const [isCopied, setIsCopied] = useState(false);

  const wordCountUsed = MAX_WORDS_PER_DAY - wordsRemaining;

  const handleGetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to get token");
        return;
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("justify_token", data.token);
      toast.success("Welcome! Your unique token has been generated.");
    } catch {
      toast.error("Cannot reach the API. Is the server running?");
    }
  };

  const handleJustify = async () => {
    if (!token || !inputText) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`${apiUrl}/api/justify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: inputText,
      });

      if (res.status === 402) {
        toast.error("402: Payment Required — Daily word limit reached.", {
          description: "You have exceeded the 80,000 words limit for today.",
        });
        setWordsRemaining(0);
        setIsProcessing(false);
        return;
      }

      if (res.status === 401) {
        toast.error("Token invalid or expired. Please login again.");
        logout();
        setIsProcessing(false);
        return;
      }

      if (!res.ok) {
        toast.error("Something went wrong.");
        setIsProcessing(false);
        return;
      }

      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining) setWordsRemaining(parseInt(remaining, 10));

      const text = await res.text();
      setOutputText(text);
      toast.success("Text justified successfully!");
    } catch {
      toast.error("Cannot reach the API. Is the server running?");
    }

    setIsProcessing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.info("Copied to clipboard");
  };

  const logout = () => {
    localStorage.removeItem("justify_token");
    setToken(null);
    setOutputText("");
    setWordsRemaining(MAX_WORDS_PER_DAY);
  };

  // ─── Login Screen ───
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6"></div>
          <h1 className="text-2xl font-bold text-center text-slate-100 mb-2 font-mono uppercase tracking-tighter">
            Initialize Access
          </h1>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Enter your email to receive a unique token for the Justification
            API.
          </p>

          <form onSubmit={handleGetToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foo@bar.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 focus:ring-2 focus:ring-slate-100 focus:border-slate-100 outline-none transition-all font-mono text-sm placeholder:text-slate-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-100 text-slate-950 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Token <Send className="w-3 h-3" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Secure authentication & rate-limiting
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Tool ───
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            Justify.io{" "}
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-500" /> Daily limit: 80,000
            words
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Your Token
            </span>
            <span className="font-mono text-xs text-slate-300 truncate max-w-30">
              {token}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl"
            title="Logout"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Type className="w-4 h-4" /> Input Text
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                {countWords(inputText)} words
              </span>
            </div>
            <textarea
              className="w-full h-100 p-6 outline-none resize-none bg-transparent text-slate-300 font-sans leading-relaxed placeholder:text-slate-700"
              placeholder="Paste your text here to justify it..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="p-4 bg-slate-950/30 border-t border-slate-800">
              <button
                onClick={handleJustify}
                disabled={!inputText || isProcessing}
                className={cn(
                  "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
                  inputText && !isProcessing
                    ? "bg-slate-100 text-slate-950 hover:bg-white shadow-lg shadow-black/20"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed",
                )}
              >
                {isProcessing ? (
                  <>
                    Processing <RefreshCw className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>Justify</>
                )}
              </button>
            </div>
          </div>

          {/* Usage Quota */}
          <div className="bg-slate-100 text-slate-950 rounded-2xl p-6 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                Usage Quota
              </h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-mono font-bold">
                  {wordCountUsed.toLocaleString()} / 80,000
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  words used
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((wordCountUsed / MAX_WORDS_PER_DAY) * 100, 100)}%`,
                  }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    wordCountUsed / MAX_WORDS_PER_DAY > 0.9
                      ? "bg-red-500"
                      : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
                  )}
                />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-40 h-40" />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Output
              </span>
              <button
                disabled={!outputText}
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-100 disabled:opacity-50 transition-colors"
              >
                {isCopied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {isCopied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="grow p-6 overflow-auto bg-slate-950/20">
              <AnimatePresence mode="wait">
                {outputText ? (
                  <motion.pre
                    key="output"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-[13px] leading-[1.6] text-slate-300 whitespace-pre overflow-x-auto bg-slate-950/50 p-4 border border-slate-800 rounded-xl shadow-inner selection:bg-slate-100 selection:text-slate-900"
                  >
                    {outputText}
                  </motion.pre>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6 py-20"
                  >
                    <div className="p-4 bg-slate-800 rounded-full">
                      <AlertCircle className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="text-xs uppercase tracking-widest font-bold text-center leading-relaxed">
                      Justified output will appear here.
                      <br />
                      Exactly 80 characters per line.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                    Encoding
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    text/plain
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                    Width
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    80 char
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
