"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Target } from "lucide-react"

interface DiagnosticQuestion {
  id: number
  skill: "READING" | "LISTENING" | "WRITING" | "SPEAKING"
  question: string
  options: string[]
  correctAnswer: number
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  // Reading Questions
  {
    id: 1,
    skill: "READING",
    question: "What is the main purpose of academic reading in IELTS?",
    options: [
      "To test vocabulary knowledge",
      "To assess comprehension of complex texts",
      "To evaluate reading speed",
      "To measure grammar accuracy"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    skill: "READING",
    question: "Which strategy is most effective for IELTS Reading?",
    options: [
      "Read every word carefully",
      "Skim for main ideas, then scan for details",
      "Translate each sentence",
      "Memorize the passage"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    skill: "READING",
    question: "How much time should you spend on each reading passage?",
    options: [
      "10 minutes per passage",
      "20 minutes per passage",
      "5 minutes per passage",
      "15 minutes per passage"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    skill: "READING",
    question: "What type of texts appear in IELTS Academic Reading?",
    options: [
      "Newspapers and magazines",
      "Academic journals and textbooks",
      "Novels and stories",
      "Emails and letters"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    skill: "READING",
    question: "How is the Reading section scored?",
    options: [
      "0-9 band scale",
      "0-40 raw score",
      "Percentage correct",
      "Points per question"
    ],
    correctAnswer: 0
  },

  // Listening Questions
  {
    id: 6,
    skill: "LISTENING",
    question: "What should you do before the audio starts?",
    options: [
      "Read the questions carefully",
      "Close your eyes",
      "Write down everything",
      "Practice pronunciation"
    ],
    correctAnswer: 0
  },
  {
    id: 7,
    skill: "LISTENING",
    question: "How many sections are in IELTS Listening?",
    options: [
      "2 sections",
      "3 sections",
      "4 sections",
      "5 sections"
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    skill: "LISTENING",
    question: "What happens after Section 4?",
    options: [
      "You get a 10-minute break",
      "The test ends",
      "You can check answers",
      "You review questions"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    skill: "LISTENING",
    question: "Which accent is most common in IELTS Listening?",
    options: [
      "American English",
      "British English",
      "Australian English",
      "Mixed accents"
    ],
    correctAnswer: 3
  },
  {
    id: 10,
    skill: "LISTENING",
    question: "How much time do you get to transfer answers?",
    options: [
      "5 minutes",
      "10 minutes",
      "No extra time",
      "2 minutes"
    ],
    correctAnswer: 1
  },

  // Writing Questions
  {
    id: 11,
    skill: "WRITING",
    question: "How many tasks are in IELTS Academic Writing?",
    options: [
      "1 task (150 words)",
      "2 tasks (150 + 250 words)",
      "3 tasks (100 words each)",
      "4 tasks (75 words each)"
    ],
    correctAnswer: 1
  },
  {
    id: 12,
    skill: "WRITING",
    question: "What is Task 1 about?",
    options: [
      "Writing an essay",
      "Describing visual information",
      "Writing a letter",
      "Expressing opinions"
    ],
    correctAnswer: 1
  },
  {
    id: 13,
    skill: "WRITING",
    question: "What is Task 2 about?",
    options: [
      "Data analysis",
      "Essay writing on a topic",
      "Creative writing",
      "Technical report"
    ],
    correctAnswer: 1
  },
  {
    id: 14,
    skill: "WRITING",
    question: "How much time is recommended for Task 1?",
    options: [
      "10 minutes",
      "20 minutes",
      "30 minutes",
      "40 minutes"
    ],
    correctAnswer: 1
  },
  {
    id: 15,
    skill: "WRITING",
    question: "What is most important in Writing assessment?",
    options: [
      "Perfect grammar",
      "Task achievement and coherence",
      "Beautiful handwriting",
      "Complex vocabulary"
    ],
    correctAnswer: 1
  },

  // Speaking Questions
  {
    id: 16,
    skill: "SPEAKING",
    question: "How many parts are in IELTS Speaking?",
    options: [
      "2 parts",
      "3 parts",
      "4 parts",
      "5 parts"
    ],
    correctAnswer: 1
  },
  {
    id: 17,
    skill: "SPEAKING",
    question: "What happens in Part 1?",
    options: [
      "Short questions about yourself",
      "Long speech on a topic",
      "Discussion with examiner",
      "Role-play scenario"
    ],
    correctAnswer: 0
  },
  {
    id: 18,
    skill: "SPEAKING",
    question: "How long is Part 2 preparation time?",
    options: [
      "30 seconds",
      "1 minute",
      "2 minutes",
      "No preparation time"
    ],
    correctAnswer: 1
  },
  {
    id: 19,
    skill: "SPEAKING",
    question: "What is Part 3 about?",
    options: [
      "More questions on Part 2 topic",
      "New unrelated topic",
      "Grammar test",
      "Pronunciation practice"
    ],
    correctAnswer: 0
  },
  {
    id: 20,
    skill: "SPEAKING",
    question: "How long does the Speaking test last?",
    options: [
      "11-14 minutes",
      "20-25 minutes",
      "30-35 minutes",
      "5-10 minutes"
    ],
    correctAnswer: 0
  }
]

export function DiagnosticTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQ = diagnosticQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }

  const calculateScore = () => {
    let correct = 0
    diagnosticQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const finalScore = calculateScore()
    setScore(finalScore)
    setIsSubmitted(true)

    // Submit to server
    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          score: finalScore,
          totalQuestions: diagnosticQuestions.length
        })
      })

      if (response.ok) {
        // Redirect to results page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting diagnostic test:", error)
      setIsSubmitting(false)
    }
  }

  const getSkillColor = (skill: string) => {
    const colors = {
      READING: "bg-blue-100 text-blue-800",
      LISTENING: "bg-green-100 text-green-800",
      WRITING: "bg-purple-100 text-purple-800",
      SPEAKING: "bg-orange-100 text-orange-800"
    }
    return colors[skill as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Test Completed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-600">
              {score}/{diagnosticQuestions.length}
            </div>
            <p className="text-gray-600">Questions Correct</p>
            <div className="text-lg">
              Band Score: {((score / diagnosticQuestions.length) * 9).toFixed(1)}
            </div>
            <p className="text-sm text-gray-500">Saving your results...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Question {currentQuestion + 1} of {diagnosticQuestions.length}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {Math.ceil((diagnosticQuestions.length - currentQuestion) * 1.5)} min remaining
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="w-full" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Skill:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(currentQ.skill)}`}>
            {currentQ.skill}
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQ.question}</h3>
          
          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`q${currentQ.id}-option${index}`} />
                <Label htmlFor={`q${currentQ.id}-option${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === diagnosticQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < diagnosticQuestions.length || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ.id]}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
