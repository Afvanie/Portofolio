
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><div className="card">Loading...</div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
