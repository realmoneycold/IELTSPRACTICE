import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateWritingScore(content: string, prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const fullPrompt = `
You are an IELTS examiner. Please evaluate the following writing response.

${prompt}

Student Response:
${content}

Please provide:
1. IELTS Band Score (0-9)
2. Detailed feedback on:
   - Task Achievement
   - Coherence and Cohesion
   - Lexical Resource
   - Grammatical Range and Accuracy
3. Specific suggestions for improvement

Format your response as JSON:
{
  "bandScore": 7.5,
  "feedback": {
    "taskAchievement": "...",
    "coherence": "...",
    "lexicalResource": "...",
    "grammar": "...",
    "suggestions": ["...", "..."]
  }
}
`

  try {
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('AI scoring error:', error)
    return {
      bandScore: 5.0,
      feedback: {
        taskAchievement: "Unable to generate feedback",
        coherence: "Unable to generate feedback",
        lexicalResource: "Unable to generate feedback",
        grammar: "Unable to generate feedback",
        suggestions: ["Please try again later"]
      }
    }
  }
}

export async function generateSpeakingScore(transcript: string, prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const fullPrompt = `
You are an IELTS examiner. Please evaluate the following speaking response.

${prompt}

Student Response Transcript:
${transcript}

Please provide:
1. IELTS Band Score (0-9)
2. Detailed feedback on:
   - Fluency and Coherence
   - Lexical Resource
   - Grammatical Range and Accuracy
   - Pronunciation
3. Specific suggestions for improvement

Format your response as JSON:
{
  "bandScore": 7.0,
  "feedback": {
    "fluency": "...",
    "lexicalResource": "...",
    "grammar": "...",
    "pronunciation": "...",
    "suggestions": ["...", "..."]
  }
}
`

  try {
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('AI scoring error:', error)
    return {
      bandScore: 5.0,
      feedback: {
        fluency: "Unable to generate feedback",
        lexicalResource: "Unable to generate feedback",
        grammar: "Unable to generate feedback",
        pronunciation: "Unable to generate feedback",
        suggestions: ["Please try again later"]
      }
    }
  }
}
