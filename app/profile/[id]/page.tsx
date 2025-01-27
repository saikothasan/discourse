import type { Metadata } from "next"
import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", params.id).single()

  if (!profile) {
    return {
      title: "User Not Found",
    }
  }

  return {
    title: `${profile.username}'s Profile`,
    description: `View ${profile.username}'s profile, recent topics, and posts on Discourse Clone`,
    openGraph: {
      title: `${profile.username}'s Profile`,
      description: `View ${profile.username}'s profile, recent topics, and posts on Discourse Clone`,
    },
  }
}

async function getUserProfile(userId: string) {
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return null
  }

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, created_at, categories(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (topicsError) {
    console.error("Error fetching topics:", topicsError)
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, content, created_at, topics(id, title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (postsError) {
    console.error("Error fetching posts:", postsError)
  }

  return { profile, topics, posts }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const userData = await getUserProfile(params.id)

  if (!userData) {
    return <div>Error loading user profile. Please try again later.</div>
  }

  const { profile, topics, posts } = userData

  const isOwnProfile = profile.id === (await supabase.auth.getUser()).data.user?.id

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={profile.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${profile.username}`}
            />
            <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{profile.username}</CardTitle>
            <p className="text-muted-foreground">Joined {formatDistanceToNow(new Date(profile.created_at))} ago</p>
          </div>
          {isOwnProfile && (
            <Button asChild className="ml-auto">
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p>{profile.bio || "No bio provided"}</p>
          {profile.website && (
            <p className="mt-2">
              Website:{" "}
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <Link
                      href={`/topic/${topic.id}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {topic.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted in {topic.categories.name} • {formatDistanceToNow(new Date(topic.created_at))} ago
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No topics found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <Link
                      href={`/topic/${post.topics.id}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {post.topics.title}
                    </Link>
                    <p className="text-sm mt-2">{post.content.substring(0, 100)}...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted {formatDistanceToNow(new Date(post.created_at))} ago
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No posts found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

