'use client'

import Profile from '@/components/profile/Profile'
import { NavbarDemo } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { LoadingState } from '@/components/LoadingState'

export default function ProfilePage() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Loading your strategic profile..." />
  }

  return (
    <main className="min-h-screen flex flex-col">
      <NavbarDemo session={session} profile={profile} />
      <div className="flex-1 flex flex-col">
        <Profile />
      </div>
      <Footer />
    </main>
  )
}
