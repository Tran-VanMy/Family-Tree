// client/src/components/Sidebar/index.jsx
import React, { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'

export default function Sidebar({ onAddPerson, persons = [], onDeletePerson, onOpenPerson }) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathYear, setDeathYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        death_date: deathYear ? `${deathYear}-01-01` : null,
        position_x: 200,
        position_y: 200,
        gender: gender || null,
        notes: notes || null,
      }
      await onAddPerson(payload)
      setName('')
      setBirthYear('')
      setDeathYear('')
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
    <div className="flex flex-col h-full">
      <h3 className="mt-0 mb-2 text-lg font-semibold text-gray-800">Controls</h3>

      <form onSubmit={handleSubmit} className="mb-3">
        <input
          className="w-full p-2.5 mb-2 border rounded-md"
          placeholder="Tên người"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-2 mb-2">
          <input
            type="number"
            min="1000"
            max="3000"
            placeholder="Năm sinh"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="flex-1 p-2.5 border rounded-md"
          />
          <input
            type="number"
            min="1000"
            max="3000"
            placeholder="Năm mất"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            className="flex-1 p-2.5 border rounded-md"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="flex-1 p-2.5 border rounded-md"
          >
            <option value="">Giới tính (tùy chọn)</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>

          <input
            placeholder="Ghi chú ngắn"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 p-2.5 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Đang thêm...' : 'Thêm người'}
        </button>
      </form>

      <div className="flex flex-col flex-1 min-h-0 mt-3">
        <h4 className="mb-2 text-base font-semibold text-gray-700">Danh sách người</h4>

        <div className="flex flex-col flex-1 gap-2 pr-1 overflow-y-auto">
          {persons.length === 0 && <div className="text-gray-500 text-sm">Chưa có người nào</div>}

          {persons.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between w-full p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onOpenPerson && onOpenPerson(p)}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 font-semibold text-gray-800 flex-shrink-0">
                  <div>{p.name?.charAt(0) ?? '?'}</div>
                </div>

                <div className="text-left flex-1">
                  <div className="text-[13px] font-semibold text-gray-800">{p.name}</div>
                  <div className="text-[12px] text-gray-500">{renderYear(p.birth_date, p.death_date)}</div>
                </div>
              </div>

              <button
                onClick={() => handleRemove(p.id)}
                className="ml-3 flex items-center justify-center px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
