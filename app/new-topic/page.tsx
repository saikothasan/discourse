"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import RichTextEditor from "../../components/RichTextEditor"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@radix-ui/react-alert"

export default function NewTopic() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true })

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
      } else {
        setCategories(categoriesData)
      }

      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("id, name")
        .order("name", { ascending: true })

      if (tagsError) {
        console.error("Error fetching tags:", tagsError)
      } else {
        setTags(tagsData)
      }
    }

    fetchCategoriesAndTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      setError("You must be logged in to create a topic")
      return
    }

    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .insert({ title, user_id: user.data.user.id, category_id: categoryId })
      .select()
      .single()

    if (topicError) {
      console.error("Error creating topic:", topicError)
      setError("Failed to create topic. Please try again.")
      return
    }

    const { error: postError } = await supabase
      .from("posts")
      .insert({ content, user_id: user.data.user.id, topic_id: topic.id })

    if (postError) {
      console.error("Error creating post:", postError)
      setError("Failed to create initial post. Please try again.")
      return
    }

    // Insert topic tags
    if (selectedTags.length > 0) {
      const topicTags = selectedTags.map((tagId) => ({
        topic_id: topic.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("topic_tags").insert(topicTags)

      if (tagError) {
        console.error("Error adding tags:", tagError)
        setError("Failed to add tags. The topic was created, but without tags.")
      }
    }

    router.push(`/topic/${topic.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <h1 className="text-3xl font-bold mb-6">Create New Topic</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="category" className="block mb-2">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="input"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                  )
                }
                className={`px-2 py-1 rounded ${
                  selectedTags.includes(tag.id) ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block mb-2">
            Content
          </label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <button type="submit" className="btn-primary">
          Create Topic
        </button>
      </form>
    </div>
  )
}

