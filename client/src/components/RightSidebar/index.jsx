// client/src/components/RightSidebar/index.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

export default function RightSidebar({
  persons = [],
  onDeletePerson,
  onOpenPerson,
  onLogout,
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ft_user");
    localStorage.removeItem("ft_family");
    onLogout && onLogout();
    navigate("/login");
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return persons;
    const num = Number(s);
    return persons.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const birthYear = p.birth_date
        ? new Date(p.birth_date).getFullYear()
        : null;
      return name.includes(s) || (Number.isFinite(num) && birthYear === num);
    });
  }, [q, persons]);

  const userStr = localStorage.getItem("ft_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const renderYear = (birth_date, death_date) => {
    const birthYear = birth_date ? new Date(birth_date).getFullYear() : null
    const deathYear = death_date ? new Date(death_date).getFullYear() : null
    if (birthYear && deathYear) return `${birthYear} - ${deathYear}`
    if (birthYear) return `${birthYear}`
    return ''
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold">Xin Chào {user?.username ?? "Khách"}</div>
        <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc năm sinh"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex-1 min-h-0 mt-3 overflow-y-auto flex flex-col gap-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-gray-500 text-sm">Không có kết quả</div>
        )}

        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenPerson && onOpenPerson(p)}
            className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold overflow-hidden">
                <span>{p.name?.charAt(0) ?? "?"}</span>
              </div>

              <div className="flex flex-col text-left flex-1">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-gray-500">
                  {renderYear(p.birth_date, p.death_date)}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!window.confirm("Xóa người này?")) return;
                onDeletePerson && onDeletePerson(p.id);
              }}
              className="bg-red-500 text-white rounded-md p-2 hover:bg-red-600 cursor-pointer"
              title="Xóa"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white rounded-md py-2 text-sm font-semibold hover:bg-red-600 cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
