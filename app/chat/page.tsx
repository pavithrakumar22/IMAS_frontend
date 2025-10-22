import MedicalQueryForm from "@/components/chat/medical-query-form"

export default function ChatPage() {
  return (
    <main className="w-full px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-pretty">Health Assistant</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Submit your details to get a tailored response, and ask follow-up doubts in the chat.
        </p>
      </header>

      <section className="w-full">
        <MedicalQueryForm />
      </section>
    </main>
  )
}











// import MedicalQueryForm from "@/components/chat/medical-query-form"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"

// export default function ChatPage() {
//   return (
//     <main className="w-full px-4 py-8">
//       <header className="mb-8 text-center">
//         <h1 className="text-3xl font-bold text-pretty">Health Assistant</h1>
//         <p className="text-muted-foreground text-lg mt-2">
//           Submit your details to get a tailored response, and ask follow-up doubts in the Gemini chat box.
//         </p>
//       </header>

//       <section className="w-full">
//         <MedicalQueryForm />
//       </section>
//     </main>
//   )
// }
