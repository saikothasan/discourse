"use client"

import type { Metadata } from "next"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import ReplyForm from "../../../components/ReplyForm"
import DOMPurify from "isomorphic-dompurify"
import VoteButtons from "../../../components/VoteButtons"
import MarkSolutionButton from "../../../components/MarkSolutionButton"
import BookmarkButton from "../../../components/BookmarkButton"
import { ArrowLeft, MessageCircle, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

const POSTS_PER_PAGE = 10

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: topic } = await supabase.from("topics").select("title, profiles(username)").eq("id", params.id).single()

  if (!topic) {
    return {
      title: "Topic Not Found",
    }
  }

  return {
    title: topic.title,
    description: `Join the discussion on "${topic.title}" started by ${topic.profiles.username}`,
    openGraph: {
      title: topic.title,
      description: `Join the discussion on "${topic.title}" started by ${topic.profiles.username}`,
    },
  }
}

export default async function Topic({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("*, profiles(username), categories(name), topic_tags(tags(id, name))")
    .eq("id", params.id)
    .single()

  const {
    data: posts,
    error: postsError,
    count,
  } = await supabase
    .from("posts")
    .select("*, profiles(username), votes(value)", { count: "exact" })
    .eq("topic_id", params.id)
    .order("created_at", { ascending: true })
    .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1)

  if (topicError || postsError) {
    console.error("Error fetching topic or posts:", topicError || postsError)
    return <div>Error loading topic. Please try again later.</div>
  }

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-primary hover:underline mb-4 inline-flex items-center">
        <ArrowLeft size={20} className="mr-2" />
        Back to Topics
      </Link>
      {topic && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{topic.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                Posted by {topic.profiles.username} in {topic.categories.name}
              </span>
              <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
              <BookmarkButton topicId={topic.id} />
            </div>
            {topic.topic_tags && topic.topic_tags.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                <Tag size={16} />
                {topic.topic_tags.map(({ tags }) => (
                  <Badge key={tags.id} variant="secondary">
                    {tags.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>
      )}
      {posts && posts.length > 0 ? (
        <>
          <div className="space-y-8">
            {posts.map((post, index) => (
              <Card key={post.id} className={index === 0 ? "border-primary" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.profiles.username}`} />
                      <AvatarFallback>{post.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{post.profiles.username}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at))} ago
                        </span>
                      </div>
                      <div
                        className="prose dark:prose-invert max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                      />
                      <div className="flex items-center space-x-4">
                        <VoteButtons postId={post.id} votes={post.votes} />
                        {index !== 0 && (
                          <MarkSolutionButton postId={post.id} topicId={topic.id} isSolution={post.is_solution} />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>No posts found.</p>
      )}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2" />
            Reply to this topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm topicId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

