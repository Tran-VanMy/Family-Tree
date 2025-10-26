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

// ====================
// Danh sách loại quan hệ
// ====================
const RELATION_OPTIONS = [
  // Hôn nhân
  { id: "married", label: "Kết Hôn", type: "marriage", status: "Kết hôn" },
  { id: "divorced", label: "Ly Hôn", type: "marriage", status: "Ly hôn" },

  // Cha mẹ - con cái
  { id: "child_bio", label: "Cha/Mẹ → Con (Con ruột)", type: "parent_child", relationship: "Con ruột" },
  { id: "child_step", label: "Cha/Mẹ → Con (Con riêng)", type: "parent_child", relationship: "Con riêng" },
  { id: "child_adopted", label: "Cha/Mẹ → Con (Con nuôi)", type: "parent_child", relationship: "Con nuôi" },

  // Anh chị em
  { id: "brother", label: "Anh em", type: "sibling", relationship: "Anh em" },
  { id: "sister", label: "Chị em", type: "sibling", relationship: "Chị em" },
  { id: "brother_step", label: "Anh kế", type: "sibling_step", relationship: "Anh kế" },
  { id: "sister_step", label: "Chị kế", type: "sibling_step", relationship: "Chị kế" },
  { id: "younger_step", label: "Em kế", type: "sibling_step", relationship: "Em kế" },

  // Họ hàng
  { id: "relative", label: "Họ hàng", type: "relative", relationship: "Họ hàng" },

  // Thêm nhiều loại khác nếu cần...
]

export default function RelationModal({ open, onClose, onSave }) {
  const [selectedId, setSelectedId] = useState("")

  useEffect(() => {
    if (!open) setSelectedId("")
  }, [open])

  const handleSave = () => {
    const opt = RELATION_OPTIONS.find((o) => o.id === selectedId)
    if (!opt) return

    const payload = {
      type: opt.type,
      label: opt.label,
      note: opt.relationship || opt.status || "",
      relationship: opt.relationship || "",
      status: opt.status || "",
    }

    onSave(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Thêm quan hệ</DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "4px",
          },
        }}
      >
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Loại quan hệ</InputLabel>
          <Select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            label="Loại quan hệ"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  overflowY: "auto", // 🔥 Bắt buộc để hiện thanh cuộn
                  scrollbarWidth: "thin",
                },
              },
            }}
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
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!selectedId}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  )
}
