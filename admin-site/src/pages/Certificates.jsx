
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const empty = { Img:'' }

export default function Certificates(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const fetchItems = async () => {
    const { data, error } = await supabase.from('certificates').select('*').order('id', { ascending:false })
    if (error) setErr(error.message); else setItems(data)
    setLoading(false)
  }

  useEffect(()=>{ fetchItems() }, [])

  const reset = () => { setForm(empty); setEditingId(null) }

  const upsert = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      const payload = { Img: form.Img.trim() }
      if(editingId){
        const { error } = await supabase.from('certificates').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('certificates').insert(payload)
        if (error) throw error
      }
      reset(); fetchItems()
    } catch(ex){
      setErr(ex.message)
    }
  }

  const onEdit = (it) => { setEditingId(it.id); setForm({ Img: it.Img || '' }) }

  const onDelete = async (id) => {
    if(!confirm('Delete this certificate?')) return
    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) setErr(error.message); else fetchItems()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Certificates</h2>
        <p className="muted">Simpan URL gambar sertifikat (bisa dari Supabase Storage bucket).</p>
        <form onSubmit={upsert} className="grid grid-2">
          <div className="grid" style={{gridTemplateColumns:'1fr'}}>
            <label className="muted">Image URL</label>
            <input value={form.Img} onChange={e=>setForm({...form, Img:e.target.value})} required />
            <div className="row"><button type="submit">{editingId? 'Update':'Add'}</button><button type="button" className="ghost" onClick={reset}>Clear</button></div>
          </div>
          <div className="muted">Contoh: https://YOUR_PROJECT.supabase.co/storage/v1/object/public/profile-images/certificate-1.png</div>
          {err && <div style={{color:'#ff8fa0'}}>{err}</div>}
        </form>
        <div className="space"></div>
        {loading? <div>Loading...</div> : (
          <table>
            <thead><tr><th>Preview</th><th>URL</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td>
                    <img 
                      alt="certificate" 
                      src={it.Img} 
                      style={{maxWidth:'140px', borderRadius:'10px'}} 
                    />
                  </td>

                  <td className="muted">{it.Img}</td>
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
