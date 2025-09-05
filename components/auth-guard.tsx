"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type User } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "fieldworker"
  fallbackPath?: string
}

export function AuthGuard({ children, requiredRole, fallbackPath = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (!currentUser) {
      router.push(fallbackPath)
      return
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    setIsLoading(false)
  }, [router, requiredRole, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
