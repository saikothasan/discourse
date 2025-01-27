import Link from "next/link"
import { supabase } from "../lib/supabase"
import { MessageCircle, Users, TrendingUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export const metadata = {
  title: "Home",
  description: "Welcome to Discourse Clone - Join discussions on various topics",
}

export default async function Home() {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, description")
    .order("name", { ascending: true })
    .limit(5)

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, created_at, profiles(username), categories(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: trendingTopics, error: trendingTopicsError } = await supabase
    .from("topics")
    .select("id, title, created_at, profiles(username), categories(name), posts(count)")
    .order("posts(count)", { ascending: false })
    .limit(5)

  if (categoriesError || topicsError || trendingTopicsError) {
    console.error("Error fetching data:", categoriesError || topicsError || trendingTopicsError)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" />
              Recent Topics
            </CardTitle>
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
                      Posted by {topic.profiles.username} in {topic.categories.name} •{" "}
                      {formatDistanceToNow(new Date(topic.created_at))} ago
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
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendingTopics && trendingTopics.length > 0 ? (
              <div className="space-y-4">
                {trendingTopics.map((topic) => (
                  <div key={topic.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <Link
                      href={`/topic/${topic.id}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {topic.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {topic.posts[0].count} posts • Posted by {topic.profiles.username} in {topic.categories.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No trending topics found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories && categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <Link
                      href={`/category/${category.id}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No categories found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

