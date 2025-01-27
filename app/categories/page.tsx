export const metadata = {
  title: "Categories",
  description: "Browse all categories in our Discourse Clone",
}

import Link from "next/link"
import { supabase } from "../../lib/supabase"

interface Category {
  id: string
  name: string
  description: string
  parent_id: string | null
  subcategories?: Category[]
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description, parent_id")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  const categories = data as Category[]
  const rootCategories = categories.filter((c) => !c.parent_id)

  rootCategories.forEach((category) => {
    category.subcategories = categories.filter((c) => c.parent_id === category.id)
  })

  return rootCategories
}

export default async function Categories() {
  const categories = await fetchCategories()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <Link href={`/category/${category.id}`} className="text-xl font-medium hover:text-primary">
                {category.name}
              </Link>
              <p className="text-sm text-text-light mt-2">{category.description}</p>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="mt-4 ml-4">
                  <h3 className="text-lg font-medium mb-2">Subcategories:</h3>
                  <ul className="space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.id}>
                        <Link href={`/category/${subcategory.id}`} className="text-primary hover:underline">
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  )
}

