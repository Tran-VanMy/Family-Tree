// family-tree/client/src/components/Sidebar/index.jsx
import React, { useState } from 'react'

export default function Sidebar({ onAddPerson }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAddPerson(name.trim())
      setName('')
    } catch (err) {
      console.error(err)
      alert('Lỗi khi thêm người')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Controls</h3>
      <form onSubmit={handleSubmit}>
        <input
          style={{ padding: 8, width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #ccc' }}
          placeholder="Tên người"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          }}
        >
          {loading ? 'Đang thêm...' : 'Thêm người'}
        </button>
      </form>
    </div>
  )
}
