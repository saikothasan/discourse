"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Send } from "lucide-react"
import { Button } from "./ui/button"
import MentionInput from "./MentionInput"

export default function ReplyForm({ topicId }: { topicId: string }) {
  const [content, setContent] = useState("")
  const [mentions, setMentions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      alert("You must be logged in to reply")
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from("posts").insert({
      content,
      user_id: user.data.user.id,
      topic_id: topicId,
      mentions: mentions,
    })

    if (error) {
      console.error("Error creating reply:", error)
      alert("Failed to post reply. Please try again.")
    } else {
      setContent("")
      setMentions([])
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MentionInput
        value={content}
        onChange={(value, newMentions) => {
          setContent(value)
          setMentions(newMentions)
        }}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Posting..." : "Post Reply"}
      </Button>
    </form>
  )
}

