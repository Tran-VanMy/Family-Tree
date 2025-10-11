import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { FiTrash2 } from 'react-icons/fi'

export default function PersonNode({ data }) {
  const person = data?.person
  const onDelete = data?.onDelete
  const onOpen = data?.onOpen // hàm mở modal chi tiết nếu có

  const [hover, setHover] = useState(false)

  // common handle style
  const handleStyle = {
    background: '#444',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
    boxShadow: '0 0 0 2px rgba(0,0,0,0.06)',
  }

  return (
    // dùng onDoubleClick để tránh xung đột với drag/connect.
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={() => onOpen && onOpen()}
      className="w-[140px] text-center p-2 rounded-lg bg-white shadow-md relative cursor-pointer"
    >
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={true}
        style={{
          ...handleStyle,
          top: 0,
          transform: 'translateY(-50%)',
          left: '50%',
          position: 'absolute',
          translate: '0 0',
          marginLeft: -6,
        }}
      />

      {/* Right */}
      {/* <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={true}
        style={{
          ...handleStyle,
          right: 0,
          transform: 'translateX(50%)',
          top: '50%',
          position: 'absolute',
          marginTop: -6,
        }}
      /> */}

      {/* Bottom */}
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        style={{
          ...handleStyle,
          bottom: 0,
          transform: 'translateY(50%)',
          left: '50%',
          position: 'absolute',
          marginLeft: -6,
        }}
      /> */}

      {/* Left */}
      {/* <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={true}
        style={{
          ...handleStyle,
          left: 0,
          transform: 'translateX(-50%)',
          top: '50%',
          position: 'absolute',
          marginTop: -6,
        }}
      /> */}

      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center bg-gray-100 font-semibold"
      >
        {person?.avatar_url ? (
          <img
            src={person.avatar_url}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-[20px]">{person?.name?.charAt(0) ?? '?'}</div>
        )}
      </div>

      {/* Tên + năm sinh/mất */}
      <div className="text-[13px] font-semibold">{person?.name}</div>
      <div className="text-[11px] text-gray-600">
        {(() => {
          const birthYear = person?.birth_date ? new Date(person.birth_date).getFullYear() : null
          const deathYear = person?.death_date ? new Date(person.death_date).getFullYear() : null

          if (birthYear && deathYear) {
            return `${birthYear} - ${deathYear}`
          } else if (birthYear) {
            return `${birthYear}`
          } else {
            return ''
          }
        })()}
      </div>
    </div>
  )
}
