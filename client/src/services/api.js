// client/src/services/api.js
import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
})

// Attach user & family headers automatically from localStorage
api.interceptors.request.use((cfg) => {
  try {
    const userStr = localStorage.getItem('ft_user')
    const familyId = localStorage.getItem('ft_family') || localStorage.getItem('ft_tree')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.id) cfg.headers['x-user-id'] = String(user.id)
    }
    // server expects x-family-id (we accept ft_family or legacy ft_tree)
    if (familyId) cfg.headers['x-family-id'] = String(familyId)
  } catch (e) {
    // ignore
  }
  return cfg
})

export default api
