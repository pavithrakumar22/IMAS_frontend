import { type NextRequest, NextResponse } from "next/server"

type SubmitBody = {
  profile: {
    nickname: string
    areaOfOperation: string
    role: "RMP" | "CHW"
    experienceMonths: number
  } | null
  answers: Array<{ questionId: string; answer: string }>
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SubmitBody

  const answeredCount = body.answers.filter((a) => a.answer.trim().length > 0).length
  const total = Math.max(body.answers.length, 1)
  const score = Math.round((answeredCount / total) * 100)

  const summary =
    `Thank you, ${body.profile?.nickname ?? "Candidate"} (${body.profile?.role ?? "N/A"}). ` +
    `You answered ${answeredCount}/${total} questions. ` +
    `Experience: ${body.profile?.experienceMonths ?? 0} months. ` +
    `Area: ${body.profile?.areaOfOperation ?? "N/A"}.`

  return NextResponse.json({ result: { score, summary } })
}
