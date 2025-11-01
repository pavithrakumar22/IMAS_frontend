"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProfileStep, { type ProfileData } from "@/components/interview/profile-step"
import QuestionsRunner, { type AnswerRecord, type Question } from "@/components/interview/questions-runner"
import useSWR, { mutate } from "swr"

type Step = "profile" | "questions" | "result"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InterviewPage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedRole = params.get("role") as "RMP" | "CHW" | null
  const { user: clerkUser } = useUser()

  const [step, setStep] = useState<Step>("profile")
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    message: string;
    evaluations?: any[];
    summary?: any;
  } | null>(null)
  const [interviewKey, setInterviewKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch practice questions only when on questions step
  const { data: questionsData } = useSWR<{
    success: boolean;
    sessionId: string;
    questions: Question[];
    message: string;
  }>(
    step === "questions" ? `/interview/practice-questions?key=${interviewKey}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      onSuccess: (data) => {
        console.log("Questions fetched successfully:", data)
        if (data.success && data.sessionId) {
          setSessionId(data.sessionId);
        }
      },
      onError: (error) => {
        console.error("Error fetching questions:", error)
      }
    }
  )

  const questions = useMemo(() => questionsData?.questions ?? [], [questionsData])

  // Function to update interview status in database
  const updateInterviewStatus = async (passed: boolean) => {
    try {
      if (!clerkUser) {
        throw new Error("User not authenticated")
      }

      const updateResponse = await fetch("http://localhost:5000/api/auth/update-user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: clerkUser.id,
          updates: {
            interviewPassed: passed
          }
        }),
      })

      console.log("Interview status update response:", updateResponse.status)

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error("Error updating interview status:", errorText)
        throw new Error(`Failed to update interview status: ${updateResponse.status}`)
      }

      const result = await updateResponse.json()
      console.log("Interview status updated successfully:", result)
      return result
    } catch (error) {
      console.error("Error updating interview status:", error)
      throw error
    }
  }

  async function handleProfileSubmit(data: ProfileData) {
    try {
      console.log("Profile data received:", data)

      if (!clerkUser) {
        throw new Error("User not authenticated")
      }

      // Update user profile in database
      const updateResponse = await fetch("http://localhost:5000/api/auth/update-user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: clerkUser.id,
          updates: {
            displayName: data.nickname,
            role: data.role,
            experienceYears: Math.round(data.experienceMonths / 12),
            areaOfOperation: data.areaOfOperation,
          }
        }),
      })

      console.log("Response status:", updateResponse.status)

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to update user profile: ${updateResponse.status}`)
      }

      const result = await updateResponse.json()
      setProfile(data)
      setStep("questions")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(`Failed to save profile: ${error.message}`)
    }
  }

  async function handleInterviewComplete(collectedAnswers: AnswerRecord[]) {
    try {
      setAnswers(collectedAnswers)
      setIsSubmitting(true)

      // Extract just the answer texts for evaluation
      const answerTexts = collectedAnswers.map(a => a.answer);

      console.log("=== DEBUG EVALUATION ===");
      console.log("Session ID from state:", sessionId);
      console.log("Answers count:", answerTexts.length);

      // Check if sessionId is valid
      if (!sessionId || sessionId.length === 0) {
        console.error("ERROR: sessionId is empty!");
        throw new Error("Session ID is missing. Please refresh and try again.");
      }

      const requestPayload = {
        sessionId: sessionId,
        answers: answerTexts
      };

      console.log("Sending evaluation request with sessionId:", sessionId);

      const res = await fetch("http://localhost:5000/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      console.log("Response status:", res.status);

      const responseText = await res.text();
      console.log("Raw response text:", responseText);

      if (!res.ok) {
        throw new Error(`Evaluation failed: ${res.status} - ${responseText}`);
      }

      let evaluationResult;
      try {
        evaluationResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Invalid response format from server");
      }

      console.log("Evaluation result:", evaluationResult);

      const averageScore = parseFloat(evaluationResult.summary?.averageScore) || 0;
      const passed = averageScore >= 7;

      // Update database with interview result
      await updateInterviewStatus(passed);

      setResult({
        score: averageScore,
        passed: passed,
        message: passed ? "Congratulations! You passed the interview." : "You did not pass the interview. Please try again.",
        evaluations: evaluationResult.evaluations || [],
        summary: evaluationResult.summary || {}
      });

      setStep("result");

      // Auto-redirect to dashboard if passed after 3 seconds
      if (passed) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }

    } catch (error) {
      console.error("Error during evaluation:", error);
      setResult({
        score: 0,
        passed: false,
        message: `Evaluation failed: ${error.message}. Please try again.`
      });
      setStep("result");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToDashboard() {
    router.push("/dashboard");
  }

  function retryInterview() {
    console.log("Retrying interview...");
    
    // Reset all states
    setStep("profile");
    setResult(null);
    setAnswers([]);
    setSessionId("");
    setProfile(null);
    setIsSubmitting(false);
    
    // Increment the key to force SWR to re-fetch questions
    setInterviewKey(prev => prev + 1);
    
    // Clear SWR cache for the questions
    mutate('/interview/practice-questions', undefined, { revalidate: false });
    
    console.log("Interview reset complete, ready for new session");
  }

  return (
    <main className="min-h-dvh p-6 flex items-center justify-center">
      <Card className="w-full max-w-4xl"> {/* Increased max width */}
        {step === "profile" && (
          <>
            <CardHeader>
              <CardTitle className="text-balance">Interview: Profile</CardTitle>
              <CardDescription>Tell us a bit about you before we begin.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileStep defaultRole={preselectedRole ?? undefined} onSubmit={handleProfileSubmit} />
            </CardContent>
          </>
        )}

        {step === "questions" && (
          <>
            <CardHeader>
              <CardTitle>Practice Interview</CardTitle>
              <CardDescription>Answer each question thoroughly and completely.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {questions.length > 0 ? (
                <QuestionsRunner 
                  key={`questions-runner-${interviewKey}`}
                  questions={questions} 
                  onComplete={handleInterviewComplete}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <div className="text-center py-8">
                  <p>Loading questions...</p>
                </div>
              )}
            </CardContent>
          </>
        )}

        {step === "result" && result && (
          <>
            <CardHeader>
              <CardTitle>Interview Result</CardTitle>
              <CardDescription>Your practice results are below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className={`rounded-lg border p-6 ${result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${result.passed ? "text-green-600" : "text-red-600"}`}>
                    {result.passed ? "PASS" : "FAIL"}
                  </p>
                  <p className="text-lg mt-2">
                    Score: <span className="font-semibold">{result.score.toFixed(1)}/10</span>
                  </p>
                  <p className="text-muted-foreground mt-2">{result.message}</p>

                  {result.summary?.competency && (
                    <p className="mt-2">
                      <span className="font-medium">Competency Level:</span> {result.summary.competency}
                    </p>
                  )}
                </div>
              </div>

              {result.evaluations && result.evaluations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detailed Feedback:</h3>
                  {result.evaluations.map((evaluation, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">Question {index + 1}:</p>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${evaluation.score >= 7 ? "bg-green-100 text-green-800" :
                            evaluation.score >= 5 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                          }`}>
                          {evaluation.score}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{evaluation.question}</p>
                      <p className="text-sm">
                        <span className="font-medium">Feedback:</span> {evaluation.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.passed && (
                <p className="text-sm text-muted-foreground text-center">
                  Redirecting to dashboard in a few seconds...
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-6">
              {!result.passed && (
                <Button variant="secondary" onClick={retryInterview}>
                  Try Again
                </Button>
              )}
              <Button onClick={goToDashboard}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </main>
  )
}