// client/src/services/api.js
import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
})

// Attach user & tree headers automatically from localStorage
api.interceptors.request.use((cfg) => {
  try {
    const userStr = localStorage.getItem('ft_user')
    const treeId = localStorage.getItem('ft_tree')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.id) cfg.headers['x-user-id'] = user.id
    }
    if (treeId) cfg.headers['x-tree-id'] = treeId
  } catch (e) {
    // ignore
  }
  return cfg
})

export default api
