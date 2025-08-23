
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const empty = { title:'', description:'', Img:'', link:'', github:'', features:'[]', techstack:'[]' }

export default function Projects(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const fetchItems = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('id', { ascending:false })
    if (error) setErr(error.message); else setItems(data)
    setLoading(false)
  }

  useEffect(()=>{ fetchItems() }, [])

  const reset = () => { setForm(empty); setEditingId(null) }

  const upsert = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      const payload = {
        title: (form.title || '').trim(),
        description: (form.description || '').trim(),
        Img: (form.Img || '').trim(),
        link: (form.link || '').trim(),
        github: (form.github || '').trim(),
        features: JSON.parse(form.features || '[]'),
        techstack: JSON.parse(form.techstack || '[]')
      }
      if(editingId){
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
      }
      reset(); fetchItems()
    } catch(ex){
      setErr(ex.message)
    }
  }

  const onEdit = (it) => {
    setEditingId(it.id)
    setForm({
      title: it.title || '',
      description: it.description || '',
      Img: it.Img || '',
      link: it.link || '',
      github: it.github || '',
      features: JSON.stringify(it.features || []),
      techstack: JSON.stringify(it.techstack || [])
    })
  }

  const onDelete = async (id) => {
    if(!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) setErr(error.message); else fetchItems()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Projects</h2>
        <p className="muted">Tambah / ubah project. Kolom <code>features</code> dan <code>techstack</code> menggunakan JSON array.</p>
        <form onSubmit={upsert} className="grid grid-2">
          <div>
            <label className="muted">Title</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          </div>
          <div>
            <label className="muted">Image URL</label>
            <input value={form.Img} onChange={e=>setForm({...form, Img:e.target.value})} />
          </div>
          <div className="grid">
            <label className="muted">Description</label>
            <textarea rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea>
          </div>
          <div>
            <label className="muted">Live Link</label>
            <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} />
          </div>
          <div>
            <label className="muted">Github Link</label>
            <input value={form.github} onChange={e=>setForm({...form, github:e.target.value})} />
          </div>
          <div>
            <label className="muted">Features (JSON array)</label>
            <input value={form.features} onChange={e=>setForm({...form, features:e.target.value})} placeholder='["fast","responsive"]' />
          </div>
          <div>
            <label className="muted">TechStack (JSON array)</label>
            <input value={form.techstack} onChange={e=>setForm({...form, techstack:e.target.value})} placeholder='["React","Supabase"]' />
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
            <thead><tr><th>Title</th><th>Description</th><th>Links</th><th>Tech</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td><strong>{it.title}</strong><div className="muted">{it.Img}</div></td>
                  <td>{it.description}</td>
                  <td>
                    {it.link && <div><a href={it.link} target="_blank" rel="noreferrer">Live</a></div>}
                    {it.github && <div><a href={it.github} target="_blank" rel="noreferrer">GitHub</a></div>}
                  </td>
                  <td>
                    <div className="muted">Features: {Array.isArray(it.features)? it.features.join(', '): ''}</div>
                    <div className="muted">Tech: {Array.isArray(it.techstack)? it.techstack.join(', '): ''}</div>
                  </td>
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
