export interface User {
  username: string
  role: "admin" | "fieldworker"
}

export const CREDENTIALS = {
  admin: { password: "admin123", role: "admin" as const },
  fieldworker: { password: "field123", role: "fieldworker" as const },
}

export function validateCredentials(username: string, password: string): User | null {
  const user = CREDENTIALS[username as keyof typeof CREDENTIALS]
  if (user && user.password === password) {
    return { username, role: user.role }
  }
  return null
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearCurrentUser(): void {
  localStorage.removeItem("user")
}

export function hasPermission(user: User | null, permission: "upload" | "export" | "view"): boolean {
  if (!user) return false

  switch (permission) {
    case "upload":
    case "export":
      return user.role === "admin"
    case "view":
      return true
    default:
      return false
  }
}
