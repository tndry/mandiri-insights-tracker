"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  validateCredentials,
  hasPermission,
  type User,
} from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const validatedUser = validateCredentials(username, password)

    if (validatedUser) {
      setCurrentUser(validatedUser)
      setUser(validatedUser)
      return { success: true }
    }

    return { success: false, error: "Invalid username or password" }
  }

  const logout = () => {
    clearCurrentUser()
    setUser(null)
    router.push("/login")
  }

  const checkPermission = (permission: "upload" | "export" | "view"): boolean => {
    return hasPermission(user, permission)
  }

  return {
    user,
    isLoading,
    login,
    logout,
    checkPermission,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isFieldWorker: user?.role === "fieldworker",
  }
}
