// app/api/interview/practice-questions/route.js
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Call your Express backend directly
    const response = await fetch('http://localhost:5000/api/interview/questions');
    
    if (!response.ok) {
      throw new Error('Failed to fetch questions from backend');
    }

    const data = await response.json();
    console.log("Backend response:", data);
    
    // Transform the data to match frontend expectations
    const transformedData = {
      success: data.success,
      sessionId: data.sessionId,
      message: data.message,
      questions: data.questions.map((q: any) => ({
        id: `q${q.questionId}`,
        text: q.question,
        type: "short" as const
      }))
    };

    console.log("Transformed data for frontend:", transformedData);
    
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error:', error);
    
    // Return fallback with correct structure
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch questions',
      questions: []
    });
  }
}