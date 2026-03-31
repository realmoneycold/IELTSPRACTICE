import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, context, history } = await request.json()

    const systemPrompt = `You are an expert IELTS tutor helping students prepare for their IELTS exam. Your role is to:

1. Provide clear, actionable advice for IELTS preparation
2. Explain strategies for each section (Reading, Listening, Writing, Speaking)
3. Give feedback on practice questions and writing samples
4. Help with grammar, vocabulary, and pronunciation
5. Motivate students and provide study tips

Current context: ${context || "IELTS Practice Platform"}

Be encouraging, specific, and practical in your responses. Keep answers concise but comprehensive. Use a friendly, professional tone.`

    const conversationHistory = history
      ? history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : ""

    const prompt = `${conversationHistory}

User: ${message}

Please provide helpful IELTS guidance based on this question.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("AI Tutor API error:", error)
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    )
  }
}
