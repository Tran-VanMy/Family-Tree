// family-tree/client/src/components/Sidebar/index.jsx
import React, { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'

export default function Sidebar({ onAddPerson, persons = [], onDeletePerson }) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathYear, setDeathYear] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState('') // '', 'male', 'female', 'other'
  const [notes, setNotes] = useState('')

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e) => {
    const f = e.target.files?.[0]
    if (!f) {
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }
    setAvatarFile(f)
    try {
      const dataUrl = await readFileAsDataURL(f)
      setAvatarPreview(dataUrl)
    } catch (err) {
      console.error('Failed to read file', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        death_date: deathYear ? `${deathYear}-01-01` : null,
        avatar_url: avatarPreview ?? null,
        position_x: 200,
        position_y: 200,
        gender: gender || null,
        notes: notes || null,
      }
      await onAddPerson(payload)
      setName('')
      setBirthYear('')
      setDeathYear('')
      setAvatarFile(null)
      setAvatarPreview(null)
      setGender('')
      setNotes('')
    } catch (err) {
      console.error(err)
      alert('Lỗi khi thêm người')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!window.confirm('Xóa người này?')) return
    try {
      await onDeletePerson(id)
    } catch (err) {
      console.error(err)
      alert('Xóa thất bại')
    }
  }

  const renderYear = (birth_date, death_date) => {
    const birthYear = birth_date ? new Date(birth_date).getFullYear() : null
    const deathYear = death_date ? new Date(death_date).getFullYear() : null
    if (birthYear && deathYear) return `${birthYear} - ${deathYear}`
    if (birthYear) return `${birthYear}`
    return ''
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ marginTop: 0 }}>Controls</h3>

      {/* Form cố định trên đầu */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <input
          style={{ padding: 8, width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #ccc' }}
          placeholder="Tên người"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="number"
            min="1000"
            max="3000"
            placeholder="Năm sinh"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
          />
          <input
            type="number"
            min="1000"
            max="3000"
            placeholder="Năm mất (tùy chọn)"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
          />
        </div>

        {/* <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Avatar (tùy chọn)</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarPreview && (
            <div style={{ marginTop: 8 }}>
              <img src={avatarPreview} alt="preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
        </div> */}

        {/* Mới: gender + notes */}
        <div className="flex flex-wrap space-y-2">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
          >
            <option value=''>Giới tính (tùy chọn)</option>
            <option value='Nam'>Nam</option>
            <option value='Nữ'>Nữ</option>
            <option value='Khác'>Khác</option>
          </select>
          <input
            placeholder="Ghi chú ngắn (tùy chọn)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            marginTop: 8,
          }}
        >
          {loading ? 'Đang thêm...' : 'Thêm người'}
        </button>
      </form>

      {/* Danh sách có scroll */}
      <div style={{ marginTop: 12, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: '8px 0' }}>Danh sách người</h4>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
          {persons.length === 0 && <div style={{ color: '#666' }}>Chưa có người nào</div>}
          {persons.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                width: '100%',
                padding: 8,
                borderRadius: 8,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f3f4f6',
                  fontWeight: 600,
                }}>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>{p.name?.charAt(0) ?? '?'}</div>
                  )}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {renderYear(p.birth_date, p.death_date)}
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleRemove(p.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
