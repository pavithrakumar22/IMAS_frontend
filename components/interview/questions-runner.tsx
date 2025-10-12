"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

export type Question = {
  id: string
  text: string
  type?: "short" | "number"
}

export type AnswerRecord = {
  questionId: string
  answer: string
}

export default function QuestionsRunner({
  questions,
  onComplete,
  isSubmitting = false,
}: {
  questions: Question[]
  onComplete: (answers: AnswerRecord[]) => void
  isSubmitting?: boolean
}) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentValue, setCurrentValue] = useState("")

  const loading = !questions || questions.length === 0

  useEffect(() => {
    // reset current answer when index changes
    const q = questions[idx]
    setCurrentValue(q ? (answers[q.id] ?? "") : "")
  }, [idx, questions, answers])

  const current = useMemo(() => questions[idx], [questions, idx])

  function handleNext() {
    if (!current || isSubmitting) return
    
    const trimmed = currentValue.trim()
    setAnswers((prev) => ({ ...prev, [current.id]: trimmed }))
    
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1)
    } else {
      const out: AnswerRecord[] = questions.map((q) => ({
        questionId: q.id,
        answer: ((prevAnswers) => prevAnswers[q.id] ?? "")(answers),
      }))
      // ensure last answer is included
      out[out.length - 1] = { questionId: current.id, answer: trimmed }
      onComplete(out)
    }
  }

  function handlePrevious() {
    if (idx > 0 && !isSubmitting) {
      setIdx(i => i - 1)
    }
  }

  // Check if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    if (questions.length === 0) return false
    
    const currentAnswers = { ...answers }
    // Include the current value being typed
    if (current) {
      currentAnswers[current.id] = currentValue
    }
    
    return questions.every(q => currentAnswers[q.id]?.trim().length > 0)
  }, [answers, currentValue, current, questions])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Question Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-muted-foreground">
            Question {idx + 1} of {questions.length}
          </Label>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Medical Scenario
          </span>
        </div>
        <p className="text-xl font-semibold leading-relaxed text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200">
          {current?.text}
        </p>
      </div>
      
      {/* Answer Textarea */}
      <div className="space-y-3">
        <Label htmlFor="answer-textarea" className="text-base font-medium">
          Your Medical Response
        </Label>
        <Textarea
          id="answer-textarea"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          placeholder="Provide your detailed clinical assessment, diagnosis, and management plan..."
          className="min-h-[250px] resize-y text-base leading-relaxed p-4 border-2 focus:border-blue-500 transition-colors"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Write your comprehensive medical response above</span>
          <span>{currentValue.length} characters</span>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={idx === 0 || isSubmitting}
          className="min-w-[100px]"
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-4">
          {/* Progress Dots */}
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === idx 
                    ? "bg-blue-600" 
                    : index < idx 
                      ? "bg-green-500" 
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext} 
            disabled={!currentValue.trim() || isSubmitting}
            className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Evaluating...
              </>
            ) : idx < questions.length - 1 ? (
              "Next Question"
            ) : (
              "Submit All Answers"
            )}
          </Button>
        </div>
      </div>
      
      {/* Submission Status */}
      {isSubmitting && (
        <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            ⏳ Evaluating your medical responses. This may take a few moments...
          </p>
        </div>
      )}
      
      {/* Progress Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {idx + 1} of {questions.length} questions completed
        {allQuestionsAnswered && !isSubmitting && idx === questions.length - 1 && (
          <span className="text-green-600 ml-2">• All questions answered</span>
        )}
      </div>
    </div>
  )
}
























// "use client"

// import { useEffect, useMemo, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Skeleton } from "@/components/ui/skeleton"

// export type Question = {
//   id: string
//   text: string
//   type?: "short" | "number"
// }

// export type AnswerRecord = {
//   questionId: string
//   answer: string
// }

// export default function QuestionsRunner({
//   questions,
//   onComplete,
//   isSubmitting = false, // Add this prop
// }: {
//   questions: Question[]
//   onComplete: (answers: AnswerRecord[]) => void
//   isSubmitting?: boolean // Add this type
// }) {
//   const [idx, setIdx] = useState(0)
//   const [answers, setAnswers] = useState<Record<string, string>>({})
//   const [currentValue, setCurrentValue] = useState("")

//   const loading = !questions || questions.length === 0

//   useEffect(() => {
//     // reset current answer when index changes
//     const q = questions[idx]
//     setCurrentValue(q ? (answers[q.id] ?? "") : "")
//   }, [idx, questions, answers])

//   const current = useMemo(() => questions[idx], [questions, idx])

//   function handleNext() {
//     if (!current || isSubmitting) return // Prevent action if submitting
    
//     const trimmed = currentValue.trim()
//     setAnswers((prev) => ({ ...prev, [current.id]: trimmed }))
    
//     if (idx < questions.length - 1) {
//       setIdx((i) => i + 1)
//     } else {
//       const out: AnswerRecord[] = questions.map((q) => ({
//         questionId: q.id,
//         answer: ((prevAnswers) => prevAnswers[q.id] ?? "")(answers),
//       }))
//       // ensure last answer is included
//       out[out.length - 1] = { questionId: current.id, answer: trimmed }
//       onComplete(out)
//     }
//   }

//   // Check if all questions are answered
//   const allQuestionsAnswered = useMemo(() => {
//     if (questions.length === 0) return false
    
//     const currentAnswers = { ...answers }
//     // Include the current value being typed
//     if (current) {
//       currentAnswers[current.id] = currentValue
//     }
    
//     return questions.every(q => currentAnswers[q.id]?.trim().length > 0)
//   }, [answers, currentValue, current, questions])

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         <Skeleton className="h-6 w-2/3" />
//         <Skeleton className="h-10 w-full" />
//         <div className="flex justify-end">
//           <Skeleton className="h-9 w-24" />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       <div className="grid gap-2">
//         <Label className="text-sm">
//           Question {idx + 1} of {questions.length}
//         </Label>
//         <p className="text-lg">{current?.text}</p>
//       </div>
//       <Input
//         value={currentValue}
//         onChange={(e) => setCurrentValue(e.target.value)}
//         placeholder="Type your answer"
//         aria-label="Answer"
//         disabled={isSubmitting} // Disable input when submitting
//       />
//       <div className="flex justify-end">
//         <Button 
//           onClick={handleNext} 
//           disabled={!currentValue.trim() || isSubmitting} // Disable if no answer or submitting
//         >
//           {isSubmitting ? (
//             <>
//               <span className="animate-spin mr-2">⏳</span>
//               Submitting...
//             </>
//           ) : idx < questions.length - 1 ? (
//             "Next"
//           ) : (
//             "Submit All Answers"
//           )}
//         </Button>
//       </div>
      
//       {/* Progress indicator */}
//       {isSubmitting && (
//         <div className="text-center text-sm text-muted-foreground">
//           Evaluating your answers... Please wait.
//         </div>
//       )}
//     </div>
//   )
// }