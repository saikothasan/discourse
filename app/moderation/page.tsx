export const metadata = {
  title: "Moderation",
  description: "Moderate content and users in Discourse Clone",
}
;("use client")

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { formatDistanceToNow } from "date-fns"

export default function Moderation() {
  const [reports, setReports] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchReports()
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function fetchReports() {
    const { data, error } = await supabase
      .from("reported_content")
      .select(`
        id,
        content_type,
        content_id,
        reason,
        status,
        created_at,
        reporter:profiles!reporter_id(username),
        reported:profiles!reported_id(username)
      `)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching reports:", error)
    else setReports(data)
  }

  async function updateReportStatus(reportId, newStatus) {
    const { error } = await supabase.from("reported_content").update({ status: newStatus }).eq("id", reportId)

    if (error) console.error("Error updating report status:", error)
    else fetchReports()
  }

  if (!currentUser || (currentUser.user_metadata.role !== "moderator" && currentUser.user_metadata.role !== "admin")) {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <p>
                    <strong>Reporter:</strong> {report.reporter.username}
                  </p>
                  <p>
                    <strong>Reported User:</strong> {report.reported.username}
                  </p>
                  <p>
                    <strong>Content Type:</strong> {report.content_type}
                  </p>
                  <p>
                    <strong>Reason:</strong> {report.reason}
                  </p>
                  <p>
                    <strong>Status:</strong> {report.status}
                  </p>
                  <p>
                    <strong>Reported:</strong> {formatDistanceToNow(new Date(report.created_at))} ago
                  </p>
                  <div className="mt-2">
                    <Select value={report.status} onValueChange={(value) => updateReportStatus(report.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

