// client/src/components/RelationModal.jsx
import React, { useState } from "react";
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
} from "@mui/material";

const RELATION_TYPES = [
  "Cha",
  "Mẹ",
  "Anh",
  "Em",
  "Vợ",
  "Chồng",
  "Con",
  "Ông",
  "Bà",
  "Cháu",
];

export default function RelationModal({ open, onClose, onSave }) {
  const [relation, setRelation] = useState("");

  const handleSave = () => {
    if (!relation) return;
    onSave(relation);
    setRelation(""); // reset sau khi save
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm quan hệ</DialogTitle>
      <DialogContent>
        <FormControl fullWidth style={{ marginTop: 16 }}>
          <InputLabel>Loại quan hệ</InputLabel>
          <Select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            label="Loại quan hệ"
          >
            {RELATION_TYPES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
