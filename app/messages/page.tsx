export const metadata = {
  title: "Messages",
  description: "View and send private messages in Discourse Clone",
}
;("use client")

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { formatDistanceToNow } from "date-fns"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState("")
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchMessages()
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function fetchMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("private_messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        recipient_id,
        profiles!sender_id(username),
        recipient:profiles!recipient_id(username)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching messages:", error)
    else setMessages(data)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !recipient.trim()) return

    const { data: recipientUser, error: recipientError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", recipient)
      .single()

    if (recipientError || !recipientUser) {
      alert("Recipient not found")
      return
    }

    const { error } = await supabase.from("private_messages").insert({
      content: newMessage,
      sender_id: currentUser.id,
      recipient_id: recipientUser.id,
    })

    if (error) console.error("Error sending message:", error)
    else {
      setNewMessage("")
      setRecipient("")
      fetchMessages()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Private Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendMessage} className="mb-4 space-y-4">
            <Input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient username"
              required
            />
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              required
            />
            <Button type="submit">Send Message</Button>
          </form>
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <p className="font-semibold">
                    {message.sender_id === currentUser.id ? "You" : message.profiles.username} to{" "}
                    {message.sender_id === currentUser.id ? message.recipient.username : "You"}
                  </p>
                  <p>{message.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at))} ago
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

