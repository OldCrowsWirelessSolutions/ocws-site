"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { pickGreeting } from "@/lib/corvus-chat";
import { CORVUS_JOSHUA_CHAT } from "@/lib/corvus-ui-strings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CorvisChatProps {
  code: string;
  comfortLevel?: number;
  hasRecentVerdict?: boolean;
  isFreeTier?: boolean;
  /** When true, renders inline (no FAB, no fixed positioning) — for use in a full-page chat tab */
  expanded?: boolean;
  /** Founder mode — Joshua Turner. Uses founder-specific greetings and peer-level tone. */
  isFounder?: boolean;
  /** VIP founding member */
  isVIP?: boolean;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function TypewriterText({
  text,
  speed = 14,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed("");
    if (!text) { onDoneRef.current?.(); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); onDoneRef.current?.(); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <>{displayed}</>;
}

// ─── Loading dots ─────────────────────────────────────────────────────────────

function ThinkingDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color: "#00C2C7", fontFamily: "monospace" }}>{"•".repeat(dots)}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CorvusChat({
  code,
  comfortLevel = 2,
  hasRecentVerdict = false,
  isFreeTier = false,
  expanded = false,
  isFounder = false,
  isVIP = false,
}: CorvisChatProps) {
  // In expanded mode the panel is always "open"
  const [open, setOpen]                     = useState(expanded);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [typingId, setTypingId]             = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(isFreeTier ? 3 : null);
  const [limited, setLimited]               = useState(false);
  const [upgradeMsg, setUpgradeMsg]         = useState("");
  const bottomRef                           = useRef<HTMLDivElement>(null);
  const inputRef                            = useRef<HTMLInputElement>(null);
  const greetedRef                          = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Greeting on first open
  useEffect(() => {
    if (!open || greetedRef.current) return;
    greetedRef.current = true;
    const id = `msg-${Date.now()}`;
    let greeting: string;
    if (isFounder) {
      greeting = CORVUS_JOSHUA_CHAT[Math.floor(Math.random() * CORVUS_JOSHUA_CHAT.length)];
    } else {
      greeting = pickGreeting(hasRecentVerdict);
    }
    setMessages([{ id, role: "assistant", content: greeting }]);
    setTypingId(id);
  }, [open, hasRecentVerdict, isFounder]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || limited) return;
    setInput("");

    const userMsgId = `msg-${Date.now()}-u`;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, message: text, comfortLevel }),
      });
      const data = await res.json() as {
        response?: string;
        limited?: boolean;
        message?: string;
        messagesRemaining?: number;
        error?: string;
      };

      if (data.limited) {
        // Show limit message as Corvus message + upgrade prompt
        const limitId = `msg-${Date.now()}-l`;
        setMessages((prev) => [...prev, {
          id: limitId,
          role: "assistant",
          content: "That's your third free question. I have more answers but they require a subscription. $20 a month. Worth it.",
        }]);
        setTypingId(limitId);
        setLimited(true);
        setMessagesRemaining(0);
        setUpgradeMsg(data.message ?? "");
        return;
      }

      if (data.response) {
        const aiId = `msg-${Date.now()}-a`;
        setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: data.response! }]);
        setTypingId(aiId);
        if (data.messagesRemaining !== undefined) {
          setMessagesRemaining(data.messagesRemaining);
        }
      } else if (data.error) {
        const errId = `msg-${Date.now()}-e`;
        const errMsg = res.status === 401
          ? "Your session code wasn't recognized. Try logging out and back in."
          : "Corvus is temporarily unavailable. Try again in a moment.";
        setMessages((prev) => [...prev, { id: errId, role: "assistant", content: errMsg }]);
        setTypingId(errId);
        console.error("[CorvusChat] API error:", res.status, data.error);
      }
    } catch (err) {
      console.error("[CorvusChat] fetch error:", err);
      const errId = `msg-${Date.now()}-e`;
      setMessages((prev) => [...prev, { id: errId, role: "assistant", content: "Connection issue. Try again." }]);
      setTypingId(errId);
    } finally {
      setLoading(false);
    }
  }, [input, loading, limited, code, comfortLevel]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearConversation() {
    setMessages([]);
    setLimited(false);
    setUpgradeMsg("");
    setTypingId(null);
    greetedRef.current = false;
    // Re-trigger greeting
    setTimeout(() => {
      greetedRef.current = false;
      const id = `msg-${Date.now()}`;
      const greeting = pickGreeting(hasRecentVerdict);
      setMessages([{ id, role: "assistant", content: greeting }]);
      setTypingId(id);
    }, 50);
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const panelStyle: React.CSSProperties = expanded ? {
    // Inline expanded mode — fills the container
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "480px",
    background: "#0D1520",
    border: "1.5px solid rgba(0,194,199,0.35)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  } : {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "min(380px, calc(100vw - 32px))",
    height: "min(520px, calc(100dvh - 100px))",
    background: "#0D1520",
    border: "1.5px solid rgba(0,194,199,0.35)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    zIndex: 9000,
    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,194,199,0.08)",
    overflow: "hidden",
    animation: open ? "corvus-chat-slide-in 0.2s ease-out" : undefined,
  };

  const headerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(184,146,42,0.15), rgba(184,146,42,0.08))",
    borderBottom: "1px solid rgba(184,146,42,0.25)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  };

  const messagesAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "14px 14px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0,194,199,0.15) transparent",
  };

  const inputBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    padding: "10px 12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "#080d14",
    flexShrink: 0,
  };

  const fabStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: open ? "#0D6E7A" : "#00C2C7",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9001,
    boxShadow: open
      ? "0 4px 20px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,194,199,0.45), 0 0 0 3px rgba(0,194,199,0.15)",
    transition: "all 0.2s ease",
    fontSize: "20px",
    color: "#0D1520",
    fontWeight: 900,
  };

  if (expanded) {
    // Inline / full-page mode — render panel directly, no FAB
    return (
      <div style={panelStyle} role="region" aria-label="Corvus Chat">
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🐦‍⬛</span>
            <span style={{ color: "#D4AF37", fontFamily: "monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.2em" }}>
              CORVUS · CHAT
            </span>
          </div>
          <button
            onClick={clearConversation}
            style={{ background: "none", border: "none", color: "#555", fontSize: "11px", cursor: "pointer", padding: 0, letterSpacing: "0.05em" }}
          >
            Clear
          </button>
        </div>

        {messagesRemaining !== null && !limited && (
          <div style={{ background: "rgba(184,146,42,0.06)", borderBottom: "1px solid rgba(184,146,42,0.12)", padding: "6px 14px", fontSize: "11px", color: "#B8922A", fontFamily: "monospace", flexShrink: 0 }}>
            {messagesRemaining} of {3} free messages remaining
          </div>
        )}

        <div style={messagesAreaStyle}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isTyping = typingId === msg.id;
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: "8px" }}>
                {!isUser && (
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,194,199,0.12)", border: "1px solid rgba(0,194,199,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, marginTop: "2px" }}>
                    🐦‍⬛
                  </div>
                )}
                <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isUser ? "rgba(0,194,199,0.15)" : "#0a1018", border: isUser ? "1px solid rgba(0,194,199,0.25)" : "1px solid rgba(255,255,255,0.06)", borderLeft: !isUser ? "2.5px solid rgba(0,194,199,0.4)" : undefined, color: isUser ? "#e0f7f8" : "#cccccc", fontSize: "13.5px", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {isTyping ? <TypewriterText text={msg.content} speed={14} onDone={() => setTypingId(null)} /> : msg.content}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,194,199,0.12)", border: "1px solid rgba(0,194,199,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🐦‍⬛</div>
              <div style={{ padding: "9px 13px", background: "#0a1018", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "2.5px solid rgba(0,194,199,0.4)", borderRadius: "14px 14px 14px 4px", fontSize: "13px" }}>
                <ThinkingDots />
              </div>
            </div>
          )}
          {limited && (
            <div style={{ background: "rgba(184,146,42,0.08)", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "12px", padding: "14px 16px", marginTop: "4px" }}>
              <p style={{ color: "#B8922A", fontSize: "12px", marginBottom: "10px" }}>{upgradeMsg || "Subscribe for unlimited access to Corvus."}</p>
              <a href="/#pricing" style={{ display: "inline-block", background: "rgba(184,146,42,0.15)", border: "1px solid rgba(184,146,42,0.3)", color: "#D4AF37", fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "8px", textDecoration: "none" }}>
                Subscribe to Nest — $20/mo →
              </a>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={inputBarStyle}>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading || limited} placeholder={limited ? "Subscribe to continue…" : "Ask Corvus…"}
            style={{ flex: 1, background: "#0D1520", border: "1px solid rgba(0,194,199,0.2)", borderRadius: "8px", padding: "9px 12px", color: "#ffffff", fontSize: "13px", outline: "none", fontFamily: "inherit", opacity: limited ? 0.4 : 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,194,199,0.5)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(0,194,199,0.2)"; }}
          />
          <button onClick={sendMessage} disabled={loading || limited || !input.trim()}
            style={{ background: loading || limited || !input.trim() ? "rgba(0,194,199,0.08)" : "#00C2C7", border: "none", borderRadius: "8px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || limited || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.15s", color: loading || limited || !input.trim() ? "rgba(0,194,199,0.4)" : "#0D1520", fontSize: "16px", fontWeight: 700 }}
            aria-label="Send"
          >→</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes corvus-chat-slide-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>

      {/* Floating button */}
      <button
        style={fabStyle}
        onClick={() => setOpen((v) => !v)}
        title="Chat with Corvus"
        aria-label="Chat with Corvus"
      >
        {open ? "✕" : "🐦‍⬛"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={panelStyle} role="dialog" aria-label="Corvus Chat">
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>🐦‍⬛</span>
              <span style={{ color: "#D4AF37", fontFamily: "monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.2em" }}>
                CORVUS · CHAT
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={clearConversation}
                style={{ background: "none", border: "none", color: "#444", fontSize: "11px", cursor: "pointer", padding: 0, letterSpacing: "0.05em" }}
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#555", fontSize: "16px", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Free tier counter */}
          {messagesRemaining !== null && !limited && (
            <div style={{
              background: "rgba(184,146,42,0.06)",
              borderBottom: "1px solid rgba(184,146,42,0.12)",
              padding: "6px 14px",
              fontSize: "11px",
              color: "#B8922A",
              fontFamily: "monospace",
              flexShrink: 0,
            }}>
              {messagesRemaining} of {3} free messages remaining
            </div>
          )}

          {/* Messages */}
          <div style={messagesAreaStyle}>
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isTyping = typingId === msg.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%",
                      background: "rgba(0,194,199,0.12)",
                      border: "1px solid rgba(0,194,199,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", flexShrink: 0, marginTop: "2px",
                    }}>
                      🐦‍⬛
                    </div>
                  )}
                  <div style={{
                    maxWidth: "80%",
                    padding: "9px 13px",
                    borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isUser ? "rgba(0,194,199,0.15)" : "#0a1018",
                    border: isUser
                      ? "1px solid rgba(0,194,199,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderLeft: !isUser ? "2.5px solid rgba(0,194,199,0.4)" : undefined,
                    color: isUser ? "#e0f7f8" : "#cccccc",
                    fontSize: "13.5px",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    {isTyping ? (
                      <TypewriterText
                        text={msg.content}
                        speed={14}
                        onDone={() => setTypingId(null)}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  background: "rgba(0,194,199,0.12)",
                  border: "1px solid rgba(0,194,199,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", flexShrink: 0,
                }}>
                  🐦‍⬛
                </div>
                <div style={{
                  padding: "9px 13px",
                  background: "#0a1018",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: "2.5px solid rgba(0,194,199,0.4)",
                  borderRadius: "14px 14px 14px 4px",
                  fontSize: "13px",
                }}>
                  <ThinkingDots />
                </div>
              </div>
            )}

            {/* Upgrade prompt after limit */}
            {limited && (
              <div style={{
                background: "rgba(184,146,42,0.08)",
                border: "1px solid rgba(184,146,42,0.2)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginTop: "4px",
              }}>
                <p style={{ color: "#B8922A", fontSize: "12px", marginBottom: "10px" }}>
                  {upgradeMsg || "Subscribe for unlimited access to Corvus."}
                </p>
                <a
                  href="/#pricing"
                  style={{
                    display: "inline-block",
                    background: "rgba(184,146,42,0.15)",
                    border: "1px solid rgba(184,146,42,0.3)",
                    color: "#D4AF37",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "7px 16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Subscribe to Nest — $20/mo →
                </a>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={inputBarStyle}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || limited}
              placeholder={limited ? "Subscribe to continue…" : "Ask Corvus…"}
              style={{
                flex: 1,
                background: "#0D1520",
                border: "1px solid rgba(0,194,199,0.2)",
                borderRadius: "8px",
                padding: "9px 12px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
                opacity: limited ? 0.4 : 1,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,194,199,0.5)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(0,194,199,0.2)"; }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || limited || !input.trim()}
              style={{
                background: loading || limited || !input.trim()
                  ? "rgba(0,194,199,0.08)"
                  : "#00C2C7",
                border: "none",
                borderRadius: "8px",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading || limited || !input.trim() ? "not-allowed" : "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
                color: loading || limited || !input.trim() ? "rgba(0,194,199,0.4)" : "#0D1520",
                fontSize: "16px",
                fontWeight: 700,
              }}
              aria-label="Send"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
