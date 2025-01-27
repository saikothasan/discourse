"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Bookmark } from "lucide-react"

interface BookmarkButtonProps {
  topicId: string
}

export default function BookmarkButton({ topicId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("topic_id", topicId)
          .single()

        if (error) {
          console.error("Error checking bookmark status:", error)
        } else {
          setIsBookmarked(!!data)
        }
      }
    }

    checkBookmarkStatus()
  }, [topicId])

  const toggleBookmark = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert("You must be logged in to bookmark topics")
      return
    }

    if (isBookmarked) {
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("topic_id", topicId)

      if (error) {
        console.error("Error removing bookmark:", error)
      } else {
        setIsBookmarked(false)
      }
    } else {
      const { error } = await supabase.from("bookmarks").insert({ user_id: user.id, topic_id: topicId })

      if (error) {
        console.error("Error adding bookmark:", error)
      } else {
        setIsBookmarked(true)
      }
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`flex items-center space-x-1 ${isBookmarked ? "text-primary" : "text-gray-500"} hover:text-primary`}
    >
      <Bookmark size={20} />
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </button>
  )
}

