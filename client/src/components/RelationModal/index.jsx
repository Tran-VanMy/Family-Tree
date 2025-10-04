// client/src/components/RelationModal.jsx
import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"

// Chỉ 4 tuỳ chọn như bạn yêu cầu.
// Mỗi mục có `id` (unique), `label` (hiển thị) và `type` (mapping tới enum DB)
const RELATION_OPTIONS = [
  { id: "married", label: "Kết Hôn", type: "spouse" },
  { id: "child", label: "Con", type: "parent_child" },
  { id: "bro_sis", label: "Anh / Em", type: "sibling" },
  { id: "sis_bro", label: "Chị / Em", type: "sibling" },
]

export default function RelationModal({ open, onClose, onSave }) {
  const [selectedId, setSelectedId] = useState("")

  useEffect(() => {
    if (!open) setSelectedId("")
  }, [open])

  const handleSave = () => {
    if (!selectedId) return
    const opt = RELATION_OPTIONS.find((o) => o.id === selectedId)
    if (!opt) return
    // Gọi onSave với object { type, label }
    onSave({ type: opt.type, label: opt.label })
    setSelectedId("")
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm quan hệ</DialogTitle>
      <DialogContent>
        <FormControl fullWidth style={{ marginTop: 16 }}>
          <InputLabel>Loại quan hệ</InputLabel>
          <Select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            label="Loại quan hệ"
          >
            {RELATION_OPTIONS.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  )
}
