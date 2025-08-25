"use client"

import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getDictionary } from "@/lib/i18n"
import { toast } from "@/hooks/use-toast"

export function UserNav() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const dict = getDictionary('en') // Or dynamically get locale

  const userEmail = session?.user?.email || 'Guest'
  const userInitials = userEmail.charAt(0).toUpperCase()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      })
      router.push('/auth/login')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage\
