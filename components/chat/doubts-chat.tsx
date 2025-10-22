"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"

type Role = "user" | "assistant"

type Message = {
  id: string
  role: Role
  content: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function DoubtsChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const api = process.env.NEXT_PUBLIC_GEMINI_CHAT_API

  const canSend = input.trim().length > 0 && !!api && !isSending

  function scrollToBottom() {
    queueMicrotask(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!canSend) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsSending(true)
    scrollToBottom()

    try {
      const payload = {
        messages: messages.concat(userMsg).map((m) => ({ role: m.role, content: m.content })),
      }

      const res = await fetch(api!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data = await res.json().catch(() => ({}))
      const replyText =
        data?.reply ??
        data?.message ??
        data?.content ??
        data?.text ??
        "I'm here to help. Could you please clarify your question?"

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: String(replyText),
      }

      setMessages((prev) => [...prev, assistantMsg])
      scrollToBottom()
    } catch {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn’t reach the chat service right now. Please try again.",
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsSending(false)
    }
  }

  const emptyState = useMemo(() => messages.length === 0, [messages.length])

  return (
    <section className="relative flex h-full min-h-full flex-col">
      {/* Conversation: scrolls; chat stays full height */}
      <div
        ref={listRef}
        className={cx(
          "flex-1 overflow-y-auto rounded-xl border border-border bg-background",
          "p-4 md:p-6",
          emptyState && "flex items-center justify-center",
        )}
        aria-live="polite"
        aria-busy={isSending}
      >
        {emptyState ? (
          <p className="text-center text-muted-foreground">Start a conversation below.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {messages.map((m) => (
              <li key={m.id} className="flex">
                <div
                  className={cx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base",
                    "shadow-sm border border-border",
                    m.role === "user" ? "ml-auto bg-muted" : "mr-auto bg-card",
                  )}
                >
                  <p className="whitespace-pre-wrap text-pretty">{m.content}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Composer: sticky at the bottom */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 mt-4 rounded-2xl border border-input bg-card shadow-sm"
      >
        <div className="p-3 md:p-4">
          <label className="sr-only" htmlFor="chat-input">
            Message Gemini
          </label>
          <textarea
            id="chat-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Gemini"
            className={cx(
              "w-full resize-none bg-transparent outline-none",
              "text-base md:text-[1rem] leading-6 placeholder:text-muted-foreground",
            )}
            aria-label="Message Gemini"
          />

          <div className="mt-3 flex items-center justify-end">
            {/* Simple actions only */}
            <button
              type="button"
              className="mr-2 rounded-full border border-input px-3 py-2 text-sm text-muted-foreground"
              title="Attach (coming soon)"
              aria-label="Attach"
              disabled
            >
              Attach
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-medium",
                canSend ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
              aria-label="Send message"
            >
              {isSending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </form>

      {!api && <p className="mt-2 text-center text-sm text-destructive">NEXT_PUBLIC_GEMINI_CHAT_API is not set.</p>}
    </section>
  )
}
