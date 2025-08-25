import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDictionary } from "@/lib/i18n"

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  const dict = getDictionary("en") // Or dynamically get locale

  if (error || !user) {
    redirect("/auth/login")
  }

  // In a real app, you might fetch additional user profile data from your 'public.users' table
  // For now, we'll just use the Supabase auth user data.

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{dict.profile.title}</CardTitle>
          <CardDescription>Manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{dict.common.email}</Label>
            <Input id="email" type="email" value={user.email || ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input id="user-id" type="text" value={user.id} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="created-at">{dict.common.createdAt}</Label>
            <Input id="created-at" type="text" value={new Date(user.created_at).toLocaleString()} readOnly disabled />
          </div>
          {/* You can add more profile fields here, e.g., name, address, etc. */}
          {/* <Button className="w-full">{dict.profile.updateProfile}</Button> */}
          <p className="text-sm text-muted-foreground text-center">
            Profile updates are currently handled via Supabase.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
