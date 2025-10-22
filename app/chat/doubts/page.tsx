import DoubtsChat from "@/components/chat/doubts-chat"

export default function DoubtsPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4">
        <header className="py-8 text-center">
          <h1 className="text-balance text-3xl font-semibold md:text-4xl">How can I help you?</h1>
        </header>

        <div className="flex-1">
          <DoubtsChat />
        </div>
      </div>
    </main>
  )
}
