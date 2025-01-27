import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "../../../lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: category } = await supabase.from("categories").select("name, description").eq("id", params.id).single()

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: category.name,
    description: category.description || `Browse topics in the ${category.name} category`,
    openGraph: {
      title: category.name,
      description: category.description || `Browse topics in the ${category.name} category`,
    },
  }
}

export default async function Category({ params }: { params: { id: string } }) {
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("id", params.id)
    .single()

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, created_at, profiles(username)")
    .eq("category_id", params.id)
    .order("created_at", { ascending: false })

  if (categoryError || topicsError) {
    console.error("Error fetching category or topics:", categoryError || topicsError)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/categories" className="text-primary hover:underline mb-4 inline-block">
        &larr; Back to Categories
      </Link>
      {category && (
        <>
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground mb-6">{category.description}</p>
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
                    <p className="text-sm text-muted-foreground">
                      Posted by {topic.profiles.username} • {formatDistanceToNow(new Date(topic.created_at))} ago
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No topics found in this category.</p>
          )}
        </>
      )}
    </div>
  )
}

