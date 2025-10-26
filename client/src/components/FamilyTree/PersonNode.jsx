// client/src/components/FamilyTree/PersonNode.jsx
import React, { useState } from "react"
import { Handle, Position } from "reactflow"

export default function PersonNode({ data }) {
  const person = data?.person
  const onOpen = data?.onOpen
  const [hover, setHover] = useState(false)

  const handleStyle = {
    background: "#555",
    width: 12,
    height: 12,
    borderRadius: "50%",
    boxShadow: "0 0 0 2px rgba(0,0,0,0.05)",
  }

  const genderColor =
    person?.gender === "Nam"
      ? "border-blue-400"
      : person?.gender === "Nữ"
      ? "border-pink-400"
      : "border-gray-300"

  const birthYear = person?.birth_date
    ? new Date(person.birth_date).getFullYear()
    : null
  const deathYear = person?.death_date
    ? new Date(person.death_date).getFullYear()
    : null

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={() => onOpen && onOpen()}
      className={`w-[140px] text-center p-2 rounded-2xl bg-white shadow-md relative cursor-pointer transition-all duration-150 ${
        hover ? "scale-105 shadow-lg" : ""
      } border-2 ${genderColor}`}
    >
      {/* --- Top handle only --- */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={true}
        style={{
          ...handleStyle,
          top: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center bg-gray-100 font-semibold border border-gray-300">
        <div className="text-[20px] text-gray-700">
          {person?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      </div>

      <div className="text-[13px] font-semibold text-gray-900 truncate">
        {person?.name || "Không tên"}
      </div>

      <div className="text-[11px] text-gray-500">
        {birthYear && deathYear
          ? `${birthYear} - ${deathYear}`
          : birthYear
          ? `${birthYear}`
          : ""}
      </div>
    </div>
  )
}
