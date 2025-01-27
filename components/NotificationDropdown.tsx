"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import Link from "next/link"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  type: string
  content: string
  is_read: boolean
  created_at: string
  related_topic_id?: string
}

export default function NotificationDropdown({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching notifications:", error)
      } else {
        setNotifications(data)
      }
    }

    fetchNotifications()

    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 4)])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

    if (error) {
      console.error("Error marking notification as read:", error)
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell size={24} />
        {notifications.some((n) => !n.is_read) && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.related_topic_id ? `/topic/${notification.related_topic_id}` : "#"}
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${notification.is_read ? "" : "font-bold"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {notification.content}
                </Link>
              ))
            ) : (
              <p className="px-4 py-2 text-sm text-gray-700">No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

