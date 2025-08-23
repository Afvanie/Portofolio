
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    nav('/dashboard/projects')
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Login</h2>
        <p className="muted">Gunakan email yang sudah terdaftar di tabel <code>admins</code> Supabase.</p>
        <form onSubmit={handleLogin} className="grid" style={{gap:'.8rem', maxWidth:520}}>
          <div>
            <label className="muted">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="muted">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          {error && <div style={{color:'#ff8fa0'}}>{error}</div>}
          <div className="row">
            <button type="submit" disabled={loading}>{loading?'Loading...':'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
