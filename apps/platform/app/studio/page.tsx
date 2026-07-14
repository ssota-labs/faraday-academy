"use client";

import { useState } from "react";

export default function StudioPage() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ensureProject() {
    if (courseId && draftId) return { courseId, draftId };
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-faraday-user-id": "creator_demo",
      },
      body: JSON.stringify({
        slug: `draft-${Date.now().toString(36)}`,
        title: "Untitled course",
      }),
    });
    const data = await res.json();
    setCourseId(data.courseId);
    setDraftId(data.draftId);
    return { courseId: data.courseId as string, draftId: data.draftId as string };
  }

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    try {
      const proj = await ensureProject();
      const res = await fetch("/api/studio/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-faraday-user-id": "creator_demo",
        },
        body: JSON.stringify({
          courseId: proj.courseId,
          draftId: proj.draftId,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error?.message ?? "…" },
      ]);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)",
        height: "100vh",
        background: "#f3efe6",
      }}
    >
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #d9d1c3",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", margin: "0 0 1rem" }}>
          Faraday Studio
        </h1>
        <div style={{ flex: 1, overflow: "auto", display: "grid", gap: "0.75rem" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                background: m.role === "user" ? "#fff" : "#e4f2eb",
                padding: "0.75rem",
                borderRadius: 8,
              }}
            >
              <strong style={{ fontSize: 12 }}>{m.role}</strong>
              <div>{m.content}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Describe a lesson…"
            style={{ flex: 1, padding: "0.65rem", borderRadius: 8, border: "1px solid #cbbfae" }}
          />
          <button
            type="button"
            onClick={send}
            disabled={busy}
            style={{
              background: "#0b6e4f",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "0.65rem 1rem",
            }}
          >
            Send
          </button>
        </div>
      </section>
      <section style={{ background: "#1a1f2e", color: "#f7f4ef", padding: "1rem" }}>
        <div style={{ opacity: 0.7, marginBottom: 8 }}>Preview</div>
        {previewUrl ? (
          <iframe
            title="preview"
            src={previewUrl}
            style={{ width: "100%", height: "calc(100% - 2rem)", border: 0, background: "#fff" }}
            sandbox="allow-scripts"
          />
        ) : (
          <p style={{ opacity: 0.6 }}>Preview appears after the agent has an index.html.</p>
        )}
      </section>
    </div>
  );
}
