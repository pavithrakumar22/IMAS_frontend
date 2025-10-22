"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const GEMINI_CHAT_API = process.env.NEXT_PUBLIC_GEMINI_CHAT_API || "" // e.g., "http://localhost:3001/gemini-chat"

export default function GeminiChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = input.trim()
    if (!trimmed) return
    if (!GEMINI_CHAT_API) {
      setError("Set NEXT_PUBLIC_GEMINI_CHAT_API to your Gemini chat endpoint.")
      return
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      // Simple protocol: POST { message, history } → { reply }
      const res = await fetch(GEMINI_CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Chat request failed (${res.status})`)
      }
      const data = await res.json()
      const replyText = data?.reply ?? "No response."
      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: replyText }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
      <div
        ref={listRef}
        className="h-64 overflow-y-auto rounded-md border border-border bg-background p-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask your medical doubts here. This chat uses your Gemini-backed endpoint.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className={m.role === "user" ? "text-foreground" : "text-muted-foreground"}>
                <span className="text-xs uppercase tracking-wide mr-2 opacity-70">{m.role}</span>
                <span className="whitespace-pre-wrap">{m.content}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-3 flex items-center gap-2">
        <input
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 outline-none"
          placeholder="Type your doubt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm text-destructive-foreground">{error}</p> : null}

      {GEMINI_CHAT_API === "" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: configure <code>NEXT_PUBLIC_GEMINI_CHAT_API</code> to point to your Gemini chat API.
        </p>
      ) : null}
    </div>
  )
}
