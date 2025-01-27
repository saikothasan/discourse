"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditProfile() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      const { data, error, status } = await supabase
        .from("profiles")
        .select("username, full_name, bio, website")
        .eq("id", user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setFullName(data.full_name)
        setBio(data.bio)
        setWebsite(data.website)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      const updates = {
        id: user.id,
        username,
        full_name: fullName,
        bio,
        website,
        updated_at: new Date(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) {
        throw error
      }

      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateProfile()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username || ""} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" value={fullName || ""} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio || ""} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" value={website || ""} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving ..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

