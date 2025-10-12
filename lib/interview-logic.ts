// Core interview logic: question generation and simple scoring

export type InterviewRole = "RMP" | "CHW"
export type RuralContext =
  | "fever and body ache in a rural village setting"
  | "persistent cough in a child"
  | "maternal health during early pregnancy"
  | "management of diarrhoea in children"
  | "malaria symptoms in monsoon season"
  | "nutrition advice for underweight mothers"
  | "wound care with limited resources"
  | "high blood pressure in elderly rural patient"
  | "basic antenatal care visit"
  | "follow-up for tuberculosis treatment"
  | "postpartum bleeding management"
  | "skin infections during humid weather"
  | "supporting patients with suspected dengue"

export function generateQuestions(input: { role: InterviewRole; context: RuralContext }) {
  // Three competency areas across roles: triage, first-line care, referral & safety nets
  const base = [
    {
      id: "triage",
      text: `How would you triage and identify red flags for ${input.context}? Consider vital signs and danger signs in a rural setting.`,
    },
    {
      id: "first_line",
      text: `Outline first-line management appropriate for ${input.context}, keeping in mind limited resources and availability.`,
    },
    {
      id: "referral",
      text: `When would you refer the patient for higher-level care for ${input.context}? Include counseling and follow-up.`,
    },
  ]

  if (input.role === "CHW") {
    return base.map((q) => ({
      ...q,
      text:
        q.id === "first_line" ? q.text + " Focus on counseling, home-based measures, and timely escalation." : q.text,
    }))
  }

  if (input.role === "RMP") {
    return base.map((q) => ({
      ...q,
      text: q.id === "triage" ? q.text + " Mention any basic tests or empiric therapy you may start safely." : q.text,
    }))
  }

  return base
}

const KEYWORDS: Record<string, string[]> = {
  triage: [
    "red flag",
    "danger sign",
    "vitals",
    "fever",
    "respiratory rate",
    "dehydration",
    "bleeding",
    "severe",
    "confusion",
    "convulsion",
  ],
  first_line: [
    "oral rehydration",
    "paracetamol",
    "ORS",
    "zinc",
    "rest",
    "hydration",
    "net",
    "aseptic",
    "bandage",
    "cough hygiene",
    "nutrition",
  ],
  referral: [
    "refer",
    "escalate",
    "PHC",
    "district hospital",
    "follow up",
    "return if worse",
    "danger signs",
    "counsel",
    "ANC",
    "TB center",
  ],
}

// Simple heuristic scoring: keyword hits + length bonus, capped per question
export function scoreAnswer(questionId: string, answer: string, _ctx: { role: InterviewRole; context: RuralContext }) {
  const text = (answer || "").toLowerCase()
  const keywords = KEYWORDS[questionId] || []
  const hits = keywords.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0)

  const lengthBonus = Math.min(Math.floor(text.split(/\s+/).length / 20), 2) // up to +2
  const raw = hits + lengthBonus

  const cap = questionId === "triage" ? 6 : questionId === "first_line" ? 6 : 6
  return Math.min(raw, cap)
}

export function buildReport(state: {
  role: InterviewRole | null
  name: string
  context: RuralContext | null
  questions: { id: string; text: string }[]
  answers: Record<string, string>
  scores: Record<string, number>
}) {
  const perQuestionMax = 6
  const max = state.questions.length * perQuestionMax
  const total = state.questions.reduce((sum, q) => sum + (state.scores[q.id] ?? 0), 0)

  let rating: "Needs Improvement" | "Adequate" | "Excellent" = "Needs Improvement"
  if (total >= max * 0.75) rating = "Excellent"
  else if (total >= max * 0.45) rating = "Adequate"

  const summary =
    rating === "Excellent"
      ? "Strong awareness of red flags, appropriate first-line care, and clear referral criteria within rural constraints."
      : rating === "Adequate"
        ? "Covers key safety points with room to improve specificity on first-line care and referral triggers."
        : "Important safety and referral details are missing or vague. Strengthen triage and escalation planning."

  const recommendations = [
    "Use a standard red flags checklist for initial triage in rural settings.",
    "Document clear referral thresholds and ensure patient counseling on return warnings.",
    "Prefer simple, evidence-based first-line measures that match local availability.",
  ]

  return { total, max, rating, summary, recommendations }
}
