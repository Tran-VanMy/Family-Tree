// client/src/components/PersonDetailModal.jsx
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

export default function PersonDetailModal({ open, onClose, person }) {
  if (!person) return null

  // Hàm format dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const birthDate = formatDate(person.birth_date)
  const deathDate = formatDate(person.death_date)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Thông tin người</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 72,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            fontWeight: 600,
            fontSize: 28,
          }}>
            {person.avatar_url ? (
              <img src={person.avatar_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div>{person.name?.charAt(0) ?? '?'}</div>
            )}
          </div>
          <div>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{person.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {birthDate && deathDate ? `${birthDate} - ${deathDate}` : birthDate ? `${birthDate}` : ''}
            </Typography>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Typography variant="caption" color="textSecondary">Giới tính</Typography>
          <Typography>{person.gender ?? 'Chưa cung cấp'}</Typography>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Typography variant="caption" color="textSecondary">Ghi chú</Typography>
          <Typography>{person.notes ?? 'Không có'}</Typography>
        </div>

        <div style={{ marginTop: 8 }}>
          <Typography variant="caption" color="textSecondary">Ngày sinh</Typography>
          <Typography>{birthDate || 'Không có'}</Typography>
        </div>

        <div style={{ marginTop: 8 }}>
          <Typography variant="caption" color="textSecondary">Ngày mất</Typography>
          <Typography>{deathDate || 'Không có'}</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
