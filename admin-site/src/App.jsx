
import React from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import AuthProvider, { useAuth } from './AuthContext'
import Protected from './components/Protected'
import { supabase } from './supabaseClient'
import Projects from './pages/Projects'
import Certificates from './pages/Certificates'
import Experiences from './pages/Experiences'
import Login from './pages/Login'

function NavBar() {
  const { user } = useAuth()
  const loc = useLocation()
  const onLogout = async () => { await supabase.auth.signOut() }
  return (
    <div className="container">
      <div className="navbar">
        <div className="row">
          <span style={{fontWeight:700}}>Admin Panel</span>
          <span className="pill muted">Supabase</span>
        </div>
        <div className="navlinks">
          {user && <>
            <Link className="pill" to="/dashboard/projects">Projects</Link>
            <Link className="pill" to="/dashboard/certificates">Certificates</Link>
            <Link className="pill" to="/dashboard/experiences">Experiences</Link>
            <button className="ghost" onClick={onLogout}>Logout</button>
          </>}
          {!user && loc.pathname !== '/login' && <Link className="pill" to="/login">Login</Link>}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/projects" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/projects" element={<Protected><Projects /></Protected>} />
        <Route path="/dashboard/certificates" element={<Protected><Certificates /></Protected>} />
        <Route path="/dashboard/experiences" element={<Protected><Experiences /></Protected>} />
        <Route path="*" element={<div className="container"><div className="card">404</div></div>} />
      </Routes>
    </AuthProvider>
  )
}
