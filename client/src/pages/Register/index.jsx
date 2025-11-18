// client/src/pages/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !username || !password) return alert('Nhập đủ email, username, password')
    try {
      setLoading(true)
      const res = await api.post('/auth/register', { email, password, username })
      const user = res.data?.user
      const family = res.data?.family ?? res.data?.tree ?? null

      if (!user) return alert('Đăng ký nhưng không nhận user từ server')

      localStorage.setItem('ft_user', JSON.stringify(user))
      if (family) {
        const fid = family.family_id ?? family.id
        if (fid) localStorage.setItem('ft_family', String(fid))
      }
      navigate('/app')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-[#f6f7fb] text-[#111827]">
      <div className="w-[420px] bg-white rounded-xl shadow p-6">
        <h2 className="m-0 mb-3 text-xl font-semibold">Đăng ký</h2>
        <p className="text-sm text-gray-500 mb-3">
          Hãy điều đầy đủ thông tin: Email - Tên - Mật khẩu để sử dụng dịch vụ
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
            placeholder="Tên hiển thị"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-3 outline-none"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-3">
          <small className="text-gray-500 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 underline">
              Đăng nhập
            </Link>
          </small>
        </div>
      </div>
    </div>
  )
}
