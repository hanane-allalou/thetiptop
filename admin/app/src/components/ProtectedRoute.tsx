"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "./LoginForm"


interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  title: string
  description: string
}

export default function ProtectedRoute({ children, allowedRoles, title, description }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
 

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm title={title} description={description} allowedRoles={allowedRoles} />
  }

 

  if (allowedRoles && !allowedRoles.includes(user.role.trim())) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
