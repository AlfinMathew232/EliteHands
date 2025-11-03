"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [awake, setAwake] = useState(false); // hover wake/sleep
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! How can I help you today? I can pick the best service based on your requirement and guide you through booking.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const [hasToken, setHasToken] = useState(false);
  const [userType, setUserType] = useState(null);

  // Close panel when clicking outside (only when open)
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setAwake(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", []);

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("accessToken") || localStorage.getItem("token")) : null;
      setHasToken(!!token);
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userRaw) {
        try { setUserType(JSON.parse(userRaw)?.user_type || null); } catch {}
      }
    } catch {}
  }, [open]);

  async function fetchServicesSnapshot() {
    try {
      // Lightweight snapshot so we don't send huge payloads to the AI
      const [catsRes, svcsRes] = await Promise.all([
        fetch(`${apiBase}/api/services/categories/`),
        fetch(`${apiBase}/api/services/`), // public endpoint filtered by is_active=True on backend
      ]);
      const categories = catsRes.ok ? await catsRes.json() : [];
      const services = svcsRes.ok ? await svcsRes.json() : [];

      // Trim to essentials to control cost/latency
      const trimmed = Array.isArray(services)
        ? services.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category_name || s.category || "",
            description: s.description || "",
            pricing_note: s.pricing_note || s.price_range || "",
          }))
        : [];

      return { categories, services: trimmed.slice(0, 50) };
    } catch (e) {
      return { categories: [], services: [] };
    }
  }

  async function onSend(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const snapshot = await fetchServicesSnapshot();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, services: snapshot.services, categories: snapshot.categories }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      const reply = (data && data.reply) || "Sorry, I couldn't generate a response.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I'm having trouble right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {/* Floating bubble */}
      <div
        className={`w-12 h-12 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all duration-200 ${
          awake ? "bg-indigo-600 scale-105" : "bg-gray-800"
        }`}
        onMouseEnter={() => setAwake(true)}
        onMouseLeave={() => !open && setAwake(false)}
        onClick={() => setOpen((v) => !v)}
        title={awake ? "I'm awake! Click to chat" : "Click to chat"}
        aria-label="Open chat"
      >
        <span className="text-white text-lg" role="img" aria-label="bot">
          {awake || open ? "🤖" : "😴"}
        </span>
      </div>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="mt-3 w-[320px] sm:w-[360px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
            <div className="font-semibold">EliteHands Assistant</div>
            <button
              onClick={() => {
                setOpen(false);
                setAwake(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className="text-sm">
                <div className={m.role === "assistant" ? "font-medium text-indigo-600" : "font-semibold"}>
                  {m.role === "assistant" ? "Assistant" : "You"}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                {m.role === 'assistant' && /\bbooking\b|\/booking/i.test(m.content || '') && (
                  <div className="mt-2">
                    <Link href="/booking" className="inline-block text-indigo-600 hover:text-indigo-700 underline">
                      Go to booking page
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500">Thinking…</div>}
            {!loading && (
              (!hasToken || userType === "customer") && (
                <div className="mt-2">
                  <Link href="/booking" className="inline-block px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                    Book now
                  </Link>
                </div>
              )
            )}
          </div>

          <form onSubmit={onSend} className="border-t border-gray-200 dark:border-gray-700 px-2 py-2 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you need…"
              className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
