// client/src/components/Sidebar/index.jsx
import React, { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'

export default function Sidebar({
  onAddPerson,
  persons = [],
  onDeletePerson,
  onOpenPerson,
  // ✅ mới: quản lý branch families
  families = [],
  selectedFamilyId,
  onSelectFamily,
  onCreateFamily,
  onRenameFamily,
  onDeleteFamily,
}) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathYear, setDeathYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState('')
  const [notes, setNotes] = useState('')

  // state cho tạo nhánh
  const [newBranchName, setNewBranchName] = useState('')

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

  const handleCreateBranch = async (e) => {
    e.preventDefault()
    const n = newBranchName.trim()
    if (!n) return
    if (!onCreateFamily) return
    try {
      await onCreateFamily(n)
      setNewBranchName('')
    } catch (err) {
      console.error(err)
      alert('Tạo nhánh thất bại')
    }
  }

  const handleRenameBranch = async (fam) => {
    if (!onRenameFamily) return
    const newName = window.prompt('Tên nhánh mới:', fam.name || '')
    if (!newName || !newName.trim()) return
    try {
      await onRenameFamily(fam.family_id, newName.trim())
    } catch (err) {
      console.error(err)
      alert('Đổi tên nhánh thất bại')
    }
  }

  const handleDeleteBranch = async (fam) => {
    if (!onDeleteFamily) return
    if (!window.confirm(`Xóa nhánh "${fam.name}"?`)) return
    try {
      await onDeleteFamily(fam.family_id)
    } catch (err) {
      console.error(err)
      alert('Xóa nhánh thất bại')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="mt-0 mb-2 text-lg font-semibold text-gray-800">Controls</h3>

      {/* Form thêm người */}
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
          className={`w-full py-2.5 rounded-md text-white cursor-pointer ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Đang thêm...' : 'Thêm người'}
        </button>
      </form>

      {/* ✅ Phần mới: danh sách nhánh (branch families) */}
      <div className="flex flex-col flex-1 min-h-0 mt-3">
        <h4 className="mb-2 text-base font-semibold text-gray-700">
          Các nhánh (branch families)
        </h4>

        {/* Form tạo nhánh mới (FULL WIDTH giống ô Thêm người) */}
        <form onSubmit={handleCreateBranch} className="mb-3">
          <input
            className="w-full p-2.5 mb-2 border rounded-md text-sm"
            placeholder="Tên nhánh mới"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 cursor-pointer"
          >
            Thêm nhánh mới
          </button>
        </form>


        <div className="flex flex-col flex-1 gap-2 pr-1 overflow-y-auto">
          {(!families || families.length === 0) && (
            <div className="text-gray-500 text-sm">
              Chưa có nhánh nào. Hãy tạo nhánh mới.
            </div>
          )}

          {families.map((fam) => (
            <div
              key={fam.family_id}
              className={`flex items-center justify-between w-full p-2.5 bg-white rounded-lg shadow-sm transition ${
                String(selectedFamilyId) === String(fam.family_id)
                  ? 'border border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className="flex flex-col flex-1 text-left cursor-pointer"
                onClick={() => onSelectFamily && onSelectFamily(fam.family_id)}
              >
                <div className="text-[13px] font-semibold text-gray-800 truncate">
                  {fam.name || 'Unnamed branch'}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {fam.description || ''}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => handleRenameBranch(fam)}
                  className="px-2 py-1 text-xs rounded-md bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBranch(fam)}
                  className="px-2 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
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
