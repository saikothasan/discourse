"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"
import { Mention, MentionsInput } from "react-mentions"

interface MentionInputProps {
  value: string
  onChange: (value: string, mentions: string[]) => void
}

export default function MentionInput({ value, onChange }: MentionInputProps) {
  const [users, setUsers] = useState([])
  const mentionsRef = useRef([])

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data, error } = await supabase.from("profiles").select("id, username").order("username")
    if (error) console.error("Error fetching users:", error)
    else setUsers(data)
  }

  const handleChange = (event, newValue, newPlainTextValue, mentions) => {
    mentionsRef.current = mentions.map((mention) => mention.id)
    onChange(newValue, mentionsRef.current)
  }

  return (
    <MentionsInput
      value={value}
      onChange={handleChange}
      className="mentions"
      placeholder="Type your message. Use @ to mention users."
    >
      <Mention
        trigger="@"
        data={users.map((user) => ({ id: user.id, display: user.username }))}
        renderSuggestion={(suggestion, search, highlightedDisplay) => (
          <div className="user-suggestion">{highlightedDisplay}</div>
        )}
      />
    </MentionsInput>
  )
}

