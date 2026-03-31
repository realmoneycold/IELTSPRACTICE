"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AITutorChat } from "@/components/AITutorChat"
import { Bot, Sparkles, Calendar, Target, Trophy } from "lucide-react"

export function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>
      
      <AITutorChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        context="Student Dashboard"
      />
    </>
  )
}
