// client/src/components/PersonDetailModal/index.jsx
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material'

export default function PersonDetailModal({ open, onClose, person, onSave }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [notes, setNotes] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathYear, setDeathYear] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!person) {
      setName('')
      setGender('')
      setNotes('')
      setBirthYear('')
      setDeathYear('')
      return
    }
    setName(person.name ?? '')
    setGender(person.gender ?? '')
    setNotes(person.notes ?? '')
    setBirthYear(person.birth_date ? new Date(person.birth_date).getFullYear() : '')
    setDeathYear(person.death_date ? new Date(person.death_date).getFullYear() : '')
  }, [person, open])

  if (!person) return null

  const handleSave = async () => {
    if (!name.trim()) return alert('Tên không được để trống')
    const payload = {
      name: name.trim(),
      gender: gender || null,
      notes: notes || null,
      birth_date: birthYear ? `${birthYear}-01-01` : null,
      death_date: deathYear ? `${deathYear}-01-01` : null,
    }

    try {
      setSaving(true)
      if (onSave) {
        await onSave(person.id, payload)
      }
      onClose && onClose()
    } catch (err) {
      console.error('Update failed', err)
      alert('Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Xem / Chỉnh sửa thông tin người</DialogTitle>
      <DialogContent>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-18 h-18 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 font-semibold text-2xl">
            <div>{name?.charAt(0) ?? '?'}</div>
          </div>

          <div className="flex-1">
            <TextField fullWidth label="Tên" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <FormControl fullWidth>
            <InputLabel>Giới tính</InputLabel>
            <Select value={gender} label="Giới tính" onChange={(e) => setGender(e.target.value)}>
              <MenuItem value={''}>Chưa cung cấp</MenuItem>
              <MenuItem value={'Nam'}>Nam</MenuItem>
              <MenuItem value={'Nữ'}>Nữ</MenuItem>
              <MenuItem value={'Khác'}>Khác</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="mt-3">
          <TextField fullWidth label="Ghi chú" value={notes || ''} onChange={(e) => setNotes(e.target.value)} multiline rows={3} />
        </div>

        <div className="flex gap-2 mt-3">
          <TextField fullWidth label="Năm sinh (yyyy)" type="number" inputProps={{ min: 1000, max: 3000 }} value={birthYear ?? ''} onChange={(e) => setBirthYear(e.target.value)} />
          <TextField fullWidth label="Năm mất (yyyy)" type="number" inputProps={{ min: 1000, max: 3000 }} value={deathYear ?? ''} onChange={(e) => setDeathYear(e.target.value)} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
