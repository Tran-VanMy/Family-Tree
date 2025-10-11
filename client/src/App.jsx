// client/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import FamilyTree from './components/FamilyTree'
import Login from './pages/Login'
import Register from './pages/Register'

// Protected wrapper (very simple: check localStorage)
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('ft_user')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <FamilyTree />
          </ProtectedRoute>
        }
      />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
