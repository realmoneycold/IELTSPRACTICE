"use client"

import { TestConfig } from "@/lib/tests-registry"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Lock, CheckCircle, Play } from "lucide-react"

interface TestCardProps {
  test: TestConfig & {
    completed?: boolean
    score?: number
  }
}

export function TestCard({ test }: TestCardProps) {
  const isLocked = test.requires && !test.completed
  const isCompleted = test.completed

  const getStatusColor = () => {
    if (isLocked) return "bg-gray-100 text-gray-600"
    if (isCompleted) return "bg-green-100 text-green-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusIcon = () => {
    if (isLocked) return <Lock className="h-4 w-4" />
    if (isCompleted) return <CheckCircle className="h-4 w-4" />
    return <Play className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (isLocked) return "Locked"
    if (isCompleted) return `Completed (${test.score?.toFixed(1)} points)`
    return "Available"
  }

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'reading': return "bg-blue-500"
      case 'listening': return "bg-green-500"
      case 'writing': return "bg-purple-500"
      case 'speaking': return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'reading': return "📚"
      case 'listening': return "🎧"
      case 'writing': return "✍️"
      case 'speaking': return "🎤"
      default: return "📝"
    }
  }

  return (
    <Card className={`transition-all hover:shadow-lg ${isLocked ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg ${getSkillColor(test.skill)} flex items-center justify-center text-white text-xl`}>
            {getSkillIcon(test.skill)}
          </div>
          <Badge className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{test.duration}</span>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {test.level}
            </span>
          </div>
          
          {test.requires && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Requires: {test.requires}
            </p>
          )}

          <Button 
            className="w-full"
            disabled={isLocked}
            variant={isCompleted ? "outline" : "default"}
          >
            {isCompleted ? "Review Results" : isLocked ? "Locked" : "Start Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
