import { supabase } from "../../lib/supabase"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

export default async function SearchResults({
  searchParams,
}: { searchParams: { q: string; category?: string; tag?: string; author?: string } }) {
  const { q, category, tag, author } = searchParams

  let query = supabase
    .from("topics")
    .select(`
      id,
      title,
      created_at,
      profiles(username),
      categories(name),
      topic_tags(tags(name))
    `)
    .textSearch("title", q)
    .order("created_at", { ascending: false })

  if (category) {
    query = query.eq("categories.name", category)
  }

  if (tag) {
    query = query.eq("topic_tags.tags.name", tag)
  }

  if (author) {
    query = query.eq("profiles.username", author)
  }

  const { data: topics, error } = await query

  if (error) {
    console.error("Error fetching search results:", error)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{q}"</h1>
      {topics && topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/topic/${topic.id}`}
                    className="text-xl font-medium hover:text-primary transition-colors"
                  >
                    {topic.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Posted by {topic.profiles.username} in {topic.categories.name} •{" "}
                  {formatDistanceToNow(new Date(topic.created_at))} ago
                </p>
                <div className="flex flex-wrap gap-2">
                  {topic.topic_tags.map(({ tags }) => (
                    <Badge key={tags.name} variant="secondary">
                      {tags.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  )
}

