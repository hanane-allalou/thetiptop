

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { API_BASE_URL } from "../services/apiBase"

interface User {
  id: string
  name: string
  email: string
  role: string
  storeLocation?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

   if (savedToken && savedUser) {
      // setToken(savedToken)
      // setUser(JSON.parse(savedUser))
      try {
      const parsedUser = JSON.parse(savedUser)
      setToken(savedToken)
      setUser(parsedUser)
    } catch (error) {
      console.error("Erreur lors du parsing de auth_user:", error)
      // Optionnel : Réinitialiser les valeurs si elles sont corrompues
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur de connexion")
      }

      const data = await response.json()

      setToken(data.access_token)
      setUser(data.user)

      localStorage.setItem("auth_token", data.access_token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))

      return data.user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}





// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom" // ⬅️ Import de useNavigate

// interface User {
//   id: string
//   name: string
//   email: string
//   role: string
//   storeLocation?: string
// }

// interface AuthContextType {
//   user: User | null
//   token: string | null
//   login: (email: string, password: string) => Promise<void>
//   logout: () => void
//   isLoading: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const navigate = useNavigate() // ⬅️ Initialisation de useNavigate
//   const [user, setUser] = useState<User | null>(null)
//   const [token, setToken] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const savedToken = localStorage.getItem("auth_token")
//     const savedUser = localStorage.getItem("auth_user")

//     if (savedToken && savedUser) {
//       try {
//         setToken(savedToken)
//         setUser(JSON.parse(savedUser))
//       } catch (e) {
//         console.warn("Impossible de parser auth_user :", e)
//         localStorage.removeItem("auth_user")
//       }
//     }

//     setIsLoading(false)
//   }, [])

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.message || "Erreur de connexion")
//       }

//       const data = await response.json()

//       setToken(data.access_token)
//       setUser(data.user)

//       localStorage.setItem("auth_token", data.access_token)
//       localStorage.setItem("auth_user", JSON.stringify(data.user))

//       navigate("/admin") // ⬅️ Redirection après connexion réussie
//     } catch (error) {
//       throw error
//     }
//   }

//   const logout = () => {
//     setUser(null)
//     setToken(null)
//     localStorage.removeItem("auth_token")
//     localStorage.removeItem("auth_user")
//   }

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }




















