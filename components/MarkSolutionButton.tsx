"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Check } from "lucide-react"

interface MarkSolutionButtonProps {
  postId: string
  topicId: string
  isSolution: boolean
}

export default function MarkSolutionButton({ postId, topicId, isSolution }: MarkSolutionButtonProps) {
  const [isMarkedAsSolution, setIsMarkedAsSolution] = useState(isSolution)

  const handleMarkSolution = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert("You must be logged in to mark a solution")
      return
    }

    const { error } = await supabase.from("posts").update({ is_solution: !isMarkedAsSolution }).eq("id", postId)

    if (error) {
      console.error("Error marking solution:", error)
    } else {
      setIsMarkedAsSolution(!isMarkedAsSolution)

      // Create a notification for the post author
      await supabase.from("notifications").insert({
        user_id: user.id, // This should be the post author's ID in a real application
        type: "solution_marked",
        content: `Your post has been marked as the solution for a topic you participated in.`,
        related_topic_id: topicId,
        related_post_id: postId,
      })
    }
  }

  return (
    <button
      onClick={handleMarkSolution}
      className={`flex items-center space-x-1 p-1 rounded ${
        isMarkedAsSolution ? "bg-green-500 text-white" : "text-green-500 hover:bg-green-100"
      }`}
    >
      <Check size={16} />
      <span>{isMarkedAsSolution ? "Solution" : "Mark as Solution"}</span>
    </button>
  )
}

