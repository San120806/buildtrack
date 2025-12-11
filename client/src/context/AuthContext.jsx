"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const response = await api.get("/auth/me")
        setUser(response.data?.data || null)
      } catch (error) {
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    const data = response.data?.data || {}
    const { token, ...userData } = data
    if (token) {
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(userData)
    }
    return userData
  }

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData)
    const data = response.data?.data || {}
    const { token, ...user } = data
    if (token) {
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)
    }
    return user
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data)
    const userData = response.data?.data || null
    setUser(userData)
    return userData
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isContractor: user?.role === "contractor",
        isArchitect: user?.role === "architect",
        isClient: user?.role === "client",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
