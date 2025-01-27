"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import Link from "next/link"

interface UserProfileProps {
  userId: string
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      } else {
        setProfile(profileData)
      }

      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, title, created_at, categories(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (topicsError) {
        console.error("Error fetching topics:", topicsError)
      } else {
        setTopics(topicsData)
      }

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, content, created_at, topics(id, title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (postsError) {
        console.error("Error fetching posts:", postsError)
      } else {
        setPosts(postsData)
      }
    }

    fetchProfileData()
  }, [userId])

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${profile.username}`}
          alt={`${profile.username}'s avatar`}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{profile.username}</h1>
          <p className="text-muted-foreground">Joined on {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Recent Topics</h2>
          {topics.length > 0 ? (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="card">
                  <Link href={`/topic/${topic.id}`} className="text-lg font-medium hover:text-primary">
                    {topic.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-2">
                    Posted in {topic.categories.name} on {new Date(topic.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No topics found.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Recent Posts</h2>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="card">
                  <Link href={`/topic/${post.topics.id}`} className="text-lg font-medium hover:text-primary">
                    {post.topics.title}
                  </Link>
                  <p className="text-sm mt-2">{post.content.substring(0, 100)}...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Posted on {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No posts found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

