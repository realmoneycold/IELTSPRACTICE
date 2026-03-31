"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, StickyNote, CheckCircle, AlertCircle, Mic, MicOff, Play, Pause, RotateCcw } from "lucide-react"
import { getTestById } from "@/lib/tests-registry"
import { submitReadingAnswers, submitListeningAnswers, submitWritingAnswers, submitSpeakingAnswers } from "@/app/actions/submit-test"
import { uploadAudioToR2, generateAudioFileName } from "@/lib/r2"

interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'matching-headings' | 'short-answer' | 'matching' | 'map-diagram' | 'form-completion'
  question: string
  options?: string[]
  correctAnswer?: string | number
  points: number
  audioUrl?: string
  instructions?: string
}

interface TestConfig {
  id: string
  title: string
  skill: string
  type: string
  duration: string
  passage?: string
  audioUrl?: string
  transcript?: string
  tasks?: {
    task1?: {
      title: string
      question: string
      instructions: string
      image?: string
    }
    task2?: {
      title: string
      question: string
      instructions: string
    }
  }
  parts?: {
    part1?: {
      title: string
      questions: string[]
    }
    part2?: {
      title: string
      cueCard: {
        topic: string
        points: string[]
      }
    }
    part3?: {
      title: string
      questions: string[]
    }
  }
  questions: Question[]
}

const READING_PASSAGE = `The History of Timekeeping

For millennia, humans have been fascinated by the measurement of time. The earliest timekeeping devices were natural phenomena such as the rising and setting of the sun, the phases of the moon, and the changing of seasons. These natural cycles provided the foundation for the first calendars and timekeeping systems.

The invention of mechanical timekeeping devices marked a significant advancement in human civilization. The first mechanical clocks, developed in medieval Europe around the 14th century, were large, weight-driven devices that could only indicate the hours. These early clocks were typically installed in church towers and public buildings, serving as community timekeepers.

The introduction of the pendulum clock by Christiaan Huygens in 1656 revolutionized timekeeping accuracy. The pendulum's regular swing allowed clocks to maintain time with unprecedented precision, reducing error from several hours per day to mere minutes. This improvement made mechanical clocks practical for domestic use and scientific applications.

The 20th century witnessed another transformation in timekeeping with the development of electronic and atomic clocks. The quartz crystal oscillator, invented in the 1920s, provided even greater accuracy than mechanical devices. However, the true revolution came with the atomic clock, first demonstrated in 1955, which uses the vibrations of atoms to measure time with incredible precision.

Today, atomic clocks form the basis of the Global Positioning System (GPS) and international time standards. The most accurate atomic clocks can maintain time to within a few nanoseconds per day, making them essential for modern telecommunications, navigation, and scientific research.

Despite these technological advances, the fundamental human need to measure and organize time remains unchanged. From ancient sundials to modern atomic clocks, timekeeping devices continue to shape how we live, work, and understand our place in the universe.`

const LISTENING_AUDIO_URL = "/audio/listening-test-1.mp3"
const LISTENING_TRANSCRIPT = `Interviewer: Good morning, Sarah. Thanks for coming in today. I understand you're applying for the Marketing Manager position at our company.

Sarah: Yes, that's right. Thank you for having me. I'm very excited about this opportunity.

Interviewer: Great. Let's start with your background. Can you tell me about your experience in marketing?

Sarah: Certainly. I've been working in marketing for about eight years now. I started as a marketing coordinator at a small tech startup, where I learned the fundamentals of digital marketing, social media management, and content creation.

Interviewer: That sounds like a good foundation. What did you do after that?

Sarah: After two years, I moved to a larger advertising agency as a marketing specialist. There, I worked with various clients in different industries, including retail, healthcare, and technology. I was responsible for developing comprehensive marketing campaigns and analyzing their performance.

Interviewer: And what about your most recent position?

Sarah: For the past three years, I've been working as a senior marketing executive at a multinational corporation. In this role, I lead a team of five marketing professionals and oversee our company's global marketing strategy. We've launched several successful campaigns that increased our brand awareness by 40% and our sales by 25% over the last two years.

Interviewer: Impressive results. What strategies do you think are most effective in today's digital landscape?

Sarah: I believe data-driven marketing is crucial. Understanding customer behavior through analytics allows us to create more targeted and effective campaigns. Additionally, personalization and omnichannel approaches are essential to reach customers where they are most active.

Interviewer: How do you handle challenges or setbacks in your work?

Sarah: I view challenges as opportunities for growth. When a campaign doesn't perform as expected, I analyze the data to understand what went wrong, gather feedback from the team, and adjust our strategy accordingly. It's important to be flexible and willing to pivot when necessary.

Interviewer: That's a great approach. What are your career goals for the next few years?

Sarah: I'm looking to take on more leadership responsibilities and help shape marketing strategies at a strategic level. I'm particularly interested in exploring emerging technologies like AI and machine learning in marketing, and I believe this position offers the perfect opportunity to do that.

Interviewer: Well, Sarah, it's been a pleasure speaking with you. Do you have any questions for us?

Sarah: Yes, I'd love to know more about the team structure and how this role collaborates with other departments.

Interviewer: Excellent question. You'll be working closely with our sales team, product development, and customer service. We have a very collaborative culture here, and marketing plays a crucial role in driving our business objectives.

Sarah: That sounds wonderful. Thank you for your time today.

Interviewer: Thank you, Sarah. We'll be in touch within the next week regarding the next steps.`

const WRITING_TASKS = {
  task1: {
    title: "Task 1: Report Writing",
    question: `The chart below shows the percentage of household income spent on different categories in five European countries in 2020.

Write a report for a university lecturer describing the information shown below.`,
    instructions: `You should write at least 150 words.
Allow approximately 20 minutes for this task.
Write in an academic style.`,
    image: "/images/writing-task1-chart.png"
  },
  task2: {
    title: "Task 2: Essay Writing",
    question: `Some people believe that technology has made our lives more complex, while others argue that it has simplified our existence.

Discuss both these views and give your own opinion.`,
    instructions: `You should write at least 250 words.
Allow approximately 40 minutes for this task.
Give reasons for your answer and include any relevant examples from your own knowledge or experience.`
  }
}

const SPEAKING_PARTS = {
  part1: {
    title: "Part 1: Introduction and Interview",
    questions: [
      "Let's talk about your hometown. What do you like most about where you live?",
      "How long have you lived there?",
      "Do you think you'll continue living there in the future?",
      "What's the weather like in your hometown?"
    ]
  },
  part2: {
    title: "Part 2: Individual Long Turn",
    cueCard: {
      topic: "Describe a memorable holiday you have had",
      points: [
        "where you went",
        "when you went there",
        "who you went with",
        "and explain why it was memorable"
      ]
    }
  },
  part3: {
    title: "Part 3: Two-way Discussion",
    questions: [
      "How have holidays changed in your country over the past few decades?",
      "Do you think people prefer domestic or international holidays? Why?",
      "What role do holidays play in a person's life?",
      "How might holidays be different in the future?"
    ]
  }
}

// Reading questions for R_AP_01
const READING_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'According to the passage, what was the main limitation of early mechanical clocks?',
    options: [
      'They were too expensive for most people',
      'They could only indicate hours',
      'They required constant maintenance',
      'They were not portable'
    ],
    correctAnswer: 1,
    points: 1
  },
  {
    id: 'q2',
    type: 'true-false',
    question: 'The pendulum clock was invented in the 14th century.',
    correctAnswer: 'False',
    points: 1
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'What made atomic clocks revolutionary compared to previous timekeeping devices?',
    options: [
      'They were smaller and more portable',
      'They used atomic vibrations for unprecedented precision',
      'They were less expensive to produce',
      'They didn\'t require any power source'
    ],
    correctAnswer: 1,
    points: 1
  },
  {
    id: 'q4',
    type: 'true-false',
    question: 'Modern atomic clocks can maintain time to within a few nanoseconds per day.',
    correctAnswer: 'True',
    points: 1
  },
  {
    id: 'q5',
    type: 'short-answer',
    question: 'What system relies on atomic clocks for its operation? (Maximum 2 words)',
    correctAnswer: 'GPS',
    points: 1
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    question: 'According to the passage, what was the primary purpose of early mechanical clocks?',
    options: [
      'Personal timekeeping',
      'Scientific research',
      'Community timekeeping',
      'Navigation'
    ],
    correctAnswer: 2,
    points: 1
  },
  {
    id: 'q7',
    type: 'true-false',
    question: 'The quartz crystal oscillator was more accurate than pendulum clocks.',
    correctAnswer: 'True',
    points: 1
  },
  {
    id: 'q8',
    type: 'short-answer',
    question: 'Who invented the pendulum clock? (Maximum 2 words)',
    correctAnswer: 'Christiaan Huygens',
    points: 1
  },
  {
    id: 'q9',
    type: 'true-false',
    question: 'The first mechanical clocks were developed in ancient Rome.',
    correctAnswer: 'False',
    points: 1
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    question: 'What does the passage suggest about the future of timekeeping?',
    options: [
      'Mechanical clocks will become obsolete',
      'Timekeeping will become even more precise',
      'Natural timekeeping methods will return',
      'People will stop measuring time altogether'
    ],
    correctAnswer: 1,
    points: 1
  }
]

// Listening questions for L_AP_01
const LISTENING_QUESTIONS: Question[] = [
  {
    id: 'lq1',
    type: 'multiple-choice',
    question: 'What position is Sarah applying for?',
    options: [
      'Marketing Coordinator',
      'Marketing Manager',
      'Marketing Specialist',
      'Senior Marketing Executive'
    ],
    correctAnswer: 1,
    points: 1
  },
  {
    id: 'lq2',
    type: 'multiple-choice',
    question: 'How long has Sarah been working in marketing?',
    options: [
      'About 5 years',
      'About 6 years',
      'About 7 years',
      'About 8 years'
    ],
    correctAnswer: 3,
    points: 1
  },
  {
    id: 'lq3',
    type: 'true-false',
    question: 'Sarah started her career at a large advertising agency.',
    correctAnswer: 'False',
    points: 1
  },
  {
    id: 'lq4',
    type: 'multiple-choice',
    question: 'What was Sarah\'s role at the multinational corporation?',
    options: [
      'Marketing Coordinator',
      'Marketing Specialist',
      'Senior Marketing Executive',
      'Marketing Manager'
    ],
    correctAnswer: 2,
    points: 1
  },
  {
    id: 'lq5',
    type: 'short-answer',
    question: 'By what percentage did brand awareness increase under Sarah\'s leadership? (Maximum 2 words)',
    correctAnswer: '40%',
    points: 1
  },
  {
    id: 'lq6',
    type: 'multiple-choice',
    question: 'What does Sarah believe is crucial in today\'s digital landscape?',
    options: [
      'Social media marketing',
      'Content creation',
      'Data-driven marketing',
      'Traditional advertising'
    ],
    correctAnswer: 2,
    points: 1
  },
  {
    id: 'lq7',
    type: 'true-false',
    question: 'Sarah views challenges as opportunities for growth.',
    correctAnswer: 'True',
    points: 1
  },
  {
    id: 'lq8',
    type: 'short-answer',
    question: 'How many people are on Sarah\'s current team? (Maximum 2 words)',
    correctAnswer: '5 people',
    points: 1
  },
  {
    id: 'lq9',
    type: 'multiple-choice',
    question: 'What emerging technology is Sarah particularly interested in?',
    options: [
      'Social media platforms',
      'Virtual reality',
      'AI and machine learning',
      'Blockchain technology'
    ],
    correctAnswer: 2,
    points: 1
  },
  {
    id: 'lq10',
    type: 'true-false',
    question: 'The company will contact Sarah within two weeks.',
    correctAnswer: 'False',
    points: 1
  }
]

// Writing tasks for W_AT_01
const WRITING_QUESTIONS: Question[] = [
  {
    id: 'w1',
    type: 'form-completion',
    question: WRITING_TASKS.task1.question,
    instructions: WRITING_TASKS.task1.instructions,
    points: 1
  },
  {
    id: 'w2',
    type: 'form-completion',
    question: WRITING_TASKS.task2.question,
    instructions: WRITING_TASKS.task2.instructions,
    points: 1
  }
]

// Speaking questions for S_AP_01
const SPEAKING_QUESTIONS: Question[] = [
  {
    id: 's1',
    type: 'short-answer',
    question: SPEAKING_PARTS.part1.questions.join(' '),
    points: 1
  },
  {
    id: 's2',
    type: 'short-answer',
    question: `${SPEAKING_PARTS.part2.cueCard.topic}: ${SPEAKING_PARTS.part2.cueCard.points.join(', ')}`,
    points: 1
  },
  {
    id: 's3',
    type: 'short-answer',
    question: SPEAKING_PARTS.part3.questions.join(' '),
    points: 1
  }
]

export default function TestPage({ params }: { params: { skill: string; testId: string } }) {
  const router = useRouter()
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes in seconds
  const [isTestActive, setIsTestActive] = useState(false)
  const [isTestSubmitted, setIsTestSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [notepadText, setNotepadText] = useState("")
  const [isNotepadVisible, setIsNotepadVisible] = useState(true)
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Load test configuration
  useEffect(() => {
    const config = getTestById(params.testId)
    if (config && config.skill === params.skill) {
      let testContent: any = {}
      
      // Load content based on skill
      switch (params.skill) {
        case 'reading':
          testContent = {
            passage: READING_PASSAGE,
            questions: READING_QUESTIONS
          }
          break
        case 'listening':
          testContent = {
            audioUrl: LISTENING_AUDIO_URL,
            transcript: LISTENING_TRANSCRIPT,
            questions: LISTENING_QUESTIONS
          }
          break
        case 'writing':
          testContent = {
            tasks: WRITING_TASKS,
            questions: WRITING_QUESTIONS
          }
          break
        case 'speaking':
          testContent = {
            parts: SPEAKING_PARTS,
            questions: SPEAKING_QUESTIONS
          }
          break
        default:
          testContent = {
            questions: []
          }
      }
      
      setTestConfig({
        ...config,
        ...testContent
      })
      
      // Parse duration and set initial time
      const durationMinutes = parseInt(config.duration) || 60
      setTimeRemaining(durationMinutes * 60)
    }
  }, [params.testId, params.skill])

  // Timer
  useEffect(() => {
    if (!isTestActive || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTestActive, timeRemaining])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const calculateScore = () => {
    if (!testConfig) return { score: 0, total: 0, percentage: 0 }

    let correct = 0
    testConfig.questions.forEach(question => {
      const userAnswer = answers[question.id]
      if (!userAnswer) return

      if (question.type === 'multiple-choice') {
        if (parseInt(userAnswer) === question.correctAnswer) {
          correct++
        }
      } else if (question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          correct++
        }
      } else if (question.type === 'short-answer') {
        if (userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase()) {
          correct++
        }
      }
    })

    return {
      score: correct,
      total: testConfig.questions.length,
      percentage: (correct / testConfig.questions.length) * 100
    }
  }

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleSubmitTest = async () => {
    if (isTestSubmitted) return

    setIsTestSubmitted(true)
    setIsTestActive(false)

    try {
      const score = calculateScore()
      let submissionData: any = {
        testId: params.testId,
        answers,
        score: score.score,
        timeSpent: 0, // Will be calculated client-side
      }

      // Handle skill-specific submissions
      let result
      switch (params.skill) {
        case 'reading':
          result = await submitReadingAnswers(params.testId, answers, score.score)
          break
        case 'listening':
          result = await submitListeningAnswers(params.testId, answers, score.score)
          break
        case 'writing':
          result = await submitWritingAnswers(params.testId, answers, score.score)
          break
        case 'speaking':
          // Upload audio if speaking test
          if (audioBlob) {
            // In a real implementation, you would upload to R2 here
            // For now, we'll just include the audio data in the submission
            submissionData.audioData = audioUrl
          }
          result = await submitSpeakingAnswers(params.testId, answers, score.score)
          break
        default:
          throw new Error('Unknown skill type')
      }
      
      if (result.success) {
        setTestResults(result)
        setShowResults(true)
      } else {
        console.error('Failed to submit test:', result.error)
        // Still show results locally even if server submission fails
        setTestResults({ score, message: 'Test completed (offline mode)' })
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      const score = calculateScore()
      setTestResults({ score, message: 'Test completed (offline mode)' })
      setShowResults(true)
    }
  }

  const startTest = () => {
    setIsTestActive(true)
  }

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id] || ""

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={index}
                  checked={userAnswer === index.toString()}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={!isTestActive || isTestSubmitted}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'true-false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={!isTestActive || isTestSubmitted}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'short-answer':
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={!isTestActive || isTestSubmitted}
            placeholder="Type your answer here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        )

      case 'form-completion':
        return (
          <div className="space-y-4">
            {question.instructions && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                {question.instructions}
              </div>
            )}
            <textarea
              value={userAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={!isTestActive || isTestSubmitted}
              placeholder="Type your response here..."
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="text-sm text-gray-500">
              Word count: {userAnswer.split(/\s+/).filter(word => word.length > 0).length}
            </div>
          </div>
        )

      default:
        return <div>Question type not supported</div>
    }
  }

  const renderSkillSpecificContent = () => {
    if (!testConfig) return null

    switch (params.skill) {
      case 'listening':
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Audio Player
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <audio ref={audioRef} controls className="w-full">
                  <source src={testConfig.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700">
                  <strong>Note:</strong> You can play the audio multiple times during the test.
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'writing':
        return (
          <div className="space-y-6">
            {testConfig.tasks?.task1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{testConfig.tasks.task1.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{testConfig.tasks.task1.question}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    {testConfig.tasks.task1.instructions}
                  </div>
                  <textarea
                    value={answers['w1'] || ''}
                    onChange={(e) => handleAnswerChange('w1', e.target.value)}
                    disabled={!isTestActive || isTestSubmitted}
                    placeholder="Write your response here..."
                    className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-sm text-gray-500">
                    Word count: {(answers['w1'] || '').split(/\s+/).filter(word => word.length > 0).length} / 150 minimum
                  </div>
                </CardContent>
              </Card>
            )}

            {testConfig.tasks?.task2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{testConfig.tasks.task2.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{testConfig.tasks.task2.question}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    {testConfig.tasks.task2.instructions}
                  </div>
                  <textarea
                    value={answers['w2'] || ''}
                    onChange={(e) => handleAnswerChange('w2', e.target.value)}
                    disabled={!isTestActive || isTestSubmitted}
                    placeholder="Write your essay here..."
                    className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-sm text-gray-500">
                    Word count: {(answers['w2'] || '').split(/\s+/).filter(word => word.length > 0).length} / 250 minimum
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'speaking':
        return (
          <div className="space-y-6">
            {testConfig.parts?.part1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{testConfig.parts.part1.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {testConfig.parts.part1.questions.map((question: string, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {testConfig.parts?.part2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{testConfig.parts.part2.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      {testConfig.parts.part2.cueCard.topic}
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      {testConfig.parts.part2.cueCard.points.map((point: string, index: number) => (
                        <li key={index}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "destructive" : "default"}
                        className="flex items-center gap-2"
                        disabled={!isTestActive || isTestSubmitted}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      
                      {isRecording && (
                        <div className="flex items-center gap-2 text-red-600">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                          Recording...
                        </div>
                      )}
                    </div>

                    {audioUrl && (
                      <div className="space-y-2">
                        <audio ref={audioRef} controls className="w-full">
                          <source src={audioUrl} type="audio/webm" />
                        </audio>
                        <div className="flex gap-2">
                          <Button
                            onClick={playAudio}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-4 h-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Play Recording
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setAudioUrl(null)
                              setAudioBlob(null)
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Re-record
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {testConfig.parts?.part3 && (
              <Card>
                <CardHeader>
                  <CardTitle>{testConfig.parts.part3.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testConfig.parts.part3.questions.map((question: string, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!testConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Test not found</h2>
          <p className="text-gray-600 mt-2">The requested test could not be loaded.</p>
          <Button onClick={() => router.push('/(student)/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (showResults && testResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Test Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {testResults.score.score}/{testResults.score.total}
              </div>
              <div className="text-gray-600">
                {testResults.score.percentage.toFixed(1)}% Correct
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Score Breakdown:</h3>
              <div className="space-y-1 text-sm">
                <div>Reading Score: {testResults.score.score}/{testResults.score.total}</div>
                <div>Band Score Estimate: {testResults.bandScore || 'Calculating...'}</div>
              </div>
            </div>

            <Button 
              onClick={() => router.push('/(student)/dashboard')} 
              className="w-full"
              size="lg"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/(student)/dashboard')}
                disabled={isTestActive}
              >
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{testConfig.title}</h1>
                <p className="text-sm text-gray-600">Reading Test</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>

              {/* Notepad Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNotepadVisible(!isNotepadVisible)}
              >
                <StickyNote className="w-4 h-4 mr-2" />
                Notes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`flex-1 ${isNotepadVisible ? 'lg:mr-80' : ''}`}>
            {/* Test Instructions or Start Button */}
            {!isTestActive && !isTestSubmitted && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Test Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Important Information:</h3>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• You have {testConfig.duration} to complete this test</li>
                      <li>• Read the passage carefully before answering questions</li>
                      <li>• Answer all questions - there is no penalty for wrong answers</li>
                      <li>• You can use the notepad for notes during the test</li>
                      <li>• The test will automatically submit when time expires</li>
                    </ul>
                  </div>
                  
                  <Button onClick={startTest} size="lg" className="w-full">
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Skill-Specific Content */}
            {(isTestActive || isTestSubmitted) && renderSkillSpecificContent()}

            {/* Reading Passage (only for reading tests) */}
            {(isTestActive || isTestSubmitted) && params.skill === 'reading' && testConfig.passage && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Reading Passage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {testConfig.passage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions */}
            {(isTestActive || isTestSubmitted) && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Questions</h2>
                
                {testConfig.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                        <Badge variant="outline">{question.points} point</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 font-medium">{question.question}</p>
                      {renderQuestion(question)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Submit Button */}
            {isTestActive && (
              <div className="mt-8">
                <Button onClick={handleSubmitTest} size="lg" className="w-full">
                  Submit Test
                </Button>
              </div>
            )}
          </div>

          {/* Notepad Sidebar */}
          {isNotepadVisible && (
            <div className="hidden lg:block fixed right-6 top-24 w-72 h-96">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <StickyNote className="w-5 h-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <textarea
                    value={notepadText}
                    onChange={(e) => setNotepadText(e.target.value)}
                    placeholder="Take notes here during the test..."
                    className="w-full h-80 p-4 border-0 resize-none focus:ring-0"
                    disabled={!isTestActive}
                  />
                  <div className="p-3 border-t text-xs text-gray-500">
                    {notepadText.length} characters
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
