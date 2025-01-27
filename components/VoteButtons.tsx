"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { ArrowUp, ArrowDown } from "lucide-react"

interface Vote {
  value: number
}

interface VoteButtonsProps {
  postId: string
  votes: Vote[]
}

export default function VoteButtons({ postId, votes }: VoteButtonsProps) {
  const [voteCount, setVoteCount] = useState(votes.reduce((acc, vote) => acc + vote.value, 0))
  const [userVote, setUserVote] = useState<number | null>(null)

  const handleVote = async (value: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert("You must be logged in to vote")
      return
    }

    if (userVote === value) {
      // User is un-voting
      const { error } = await supabase.from("votes").delete().eq("user_id", user.id).eq("post_id", postId)

      if (error) {
        console.error("Error removing vote:", error)
      } else {
        setVoteCount((prev) => prev - value)
        setUserVote(null)
      }
    } else {
      // User is voting or changing their vote
      const { error } = await supabase.from("votes").upsert({ user_id: user.id, post_id: postId, value })

      if (error) {
        console.error("Error upserting vote:", error)
      } else {
        setVoteCount((prev) => prev + value - (userVote || 0))
        setUserVote(value)
      }
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded ${userVote === 1 ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
      >
        <ArrowUp size={16} />
      </button>
      <span>{voteCount}</span>
      <button
        onClick={() => handleVote(-1)}
        className={`p-1 rounded ${userVote === -1 ? "bg-red-500 text-white" : "hover:bg-gray-200"}`}
      >
        <ArrowDown size={16} />
      </button>
    </div>
  )
}

