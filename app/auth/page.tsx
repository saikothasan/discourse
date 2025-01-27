import Auth from "../../components/Auth"

export const metadata = {
  title: "Authentication",
  description: "Sign in or create an account for Discourse Clone",
}

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Authentication</h1>
      <Auth />
    </div>
  )
}

