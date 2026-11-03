"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface LoginFormProps {
  title: string
  description: string
  allowedRoles?: string[]
}

export default function LoginForm({ title, description }: LoginFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const user = await login(email, password)
      if (user) {
        if (user.role === "admin" || user.role === "manager") {
          navigate("/admin")
        } else if (user.role === "employee") {
          navigate("/employee")
        } else {
          navigate("/")
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 font-fairplay">
      <Card className="w-full max-w-lg mx-auto -mt-4">
        <CardHeader className="text-center p-5 sm:p-7">
          <CardTitle className="flex items-center justify-center gap-4 text-darkgreen text-xl sm:text-2xl">
            <LogIn className="h-8 w-8 sm:h-10 sm:w-10" />
            {title}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-darkgreen">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
            <div>
              <label className="block text-base sm:text-lg font-medium mb-2 sm:mb-3 text-darkgreen">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="text-base sm:text-lg h-10"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-medium mb-2 sm:mb-3 text-darkgreen">
                Mot de passe
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="text-base sm:text-lg h-10"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="p-3 sm:p-5">
                <XCircle className="h-5 w-5 sm:h-7 sm:w-7" />
                <AlertDescription className="text-base sm:text-lg">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-darkgreen hover:bg-green-900 p-3 sm:p-4 text-lg sm:text-xl"
            >
              {loading ? "Connexion..." : "CONTINUER"}
            </Button>
          </form>

          <div className="mt-7 sm:mt-9 p-3 sm:p-5 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Accès sécurisé :</h4>
            <div className="text-sm sm:text-base space-y-1 text-green-900">
              <p>Les identifiants de connexion sont fournis par l’administrateur.</p>
              <p>Veuillez vous authentifier via votre compte personnel.</p>
              <p>Contactez le support en cas de problème d’accès.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
