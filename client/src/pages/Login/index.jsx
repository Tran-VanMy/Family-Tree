// client/src/pages/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return alert('Nhập email và password')
    try {
      setLoading(true)
      const res = await api.post('/auth/login', { email, password })
      // server may return { user, tree } or { user, family } depending on backend naming
      const user = res.data?.user
      const family = res.data?.family ?? res.data?.tree ?? null

      if (!user) return alert('Không nhận được thông tin user từ server')

      localStorage.setItem('ft_user', JSON.stringify(user))
      if (family) {
        // family may have family_id
        const fid = family.family_id ?? family.id
        if (fid) localStorage.setItem('ft_family', String(fid))
      }
      navigate('/app')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-[#f6f7fb] text-[#111827]">
      <div className="w-[420px] bg-white rounded-xl shadow p-6">
        <h2 className="m-0 mb-3 text-xl font-semibold">Đăng nhập</h2>
        <p className="text-sm text-gray-500 mb-3">
          Nếu chưa có tài khoản thì ấn{' '}
          <Link to="/register" className="text-blue-600 underline">
            Đăng ký
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-3 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-3 outline-none"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-3">
          <small className="text-gray-500 text-sm">
            Chào Mừng Bạn Đến Với Chúng Tôi - Hãy đăng nhập để sử dụng!
          </small>
        </div>
      </div>
    </div>
  )
}
