"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function Search() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [tag, setTag] = useState("")
  const [author, setAuthor] = useState("")
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("name").order("name")
    if (error) console.error("Error fetching categories:", error)
    else setCategories(data)
  }

  async function fetchTags() {
    const { data, error } = await supabase.from("tags").select("name").order("name")
    if (error) console.error("Error fetching tags:", error)
    else setTags(data)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const searchParams = new URLSearchParams({ q: query.trim() })
      if (category) searchParams.append("category", category)
      if (tag) searchParams.append("tag", tag)
      if (author) searchParams.append("author", author)
      router.push(`/search?${searchParams.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics..."
          className="flex-grow"
        />
        <Button type="submit">Search</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tag">Tag</Label>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger id="tag">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author username"
          />
        </div>
      </div>
    </form>
  )
}

