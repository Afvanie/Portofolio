
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const empty = { year: new Date().getFullYear(), description:'' }

export default function Experiences(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const fetchItems = async () => {
    const { data, error } = await supabase.from('experiences').select('*').order('year', { ascending:false })
    if (error) setErr(error.message); else setItems(data)
    setLoading(false)
  }

  useEffect(()=>{ fetchItems() }, [])

  const reset = () => { setForm(empty); setEditingId(null) }

  const upsert = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      const payload = { year: Number(form.year), description: (form.description||'').trim() }
      if(editingId){
        const { error } = await supabase.from('experiences').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('experiences').insert(payload)
        if (error) throw error
      }
      reset(); fetchItems()
    } catch(ex){
      setErr(ex.message)
    }
  }

  const onEdit = (it) => { setEditingId(it.id); setForm({ year: it.year || new Date().getFullYear(), description: it.description || '' }) }

  const onDelete = async (id) => {
    if(!confirm('Delete this experience?')) return
    const { error } = await supabase.from('experiences').delete().eq('id', id)
    if (error) setErr(error.message); else fetchItems()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Years of Experience</h2>
        <p className="muted">Kelola tahun pengalaman dan deskripsi singkat.</p>
        <form onSubmit={upsert} className="grid grid-2">
          <div>
            <label className="muted">Year</label>
            <input type="number" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} required />
          </div>
          <div className="grid">
            <label className="muted">Description</label>
            <textarea rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea>
          </div>
          <div className="row">
            <button type="submit">{editingId? 'Update':'Add'}</button>
            {editingId && <button type="button" className="ghost" onClick={reset}>Cancel</button>}
          </div>
          {err && <div style={{color:'#ff8fa0'}}>{err}</div>}
        </form>
        <div className="space"></div>
        {loading? <div>Loading...</div> : (
          <table>
            <thead><tr><th>Year</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td><strong>{it.year}</strong></td>
                  <td>{it.description}</td>
                  <td className="row">
                    <button className="ghost" onClick={()=>onEdit(it)}>Edit</button>
                    <button className="danger" onClick={()=>onDelete(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
