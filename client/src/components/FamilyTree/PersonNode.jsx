// family-tree/client/src/components/FamilyTree/PersonNode.jsx
import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { FiTrash2 } from 'react-icons/fi'
// import './PersonNode.css' // optional, you can style in FamilyTree.css instead

export default function PersonNode({ data }) {
  // data should contain: person, onDelete
  const person = data?.person
  const onDelete = data?.onDelete

  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 140,
        textAlign: 'center',
        padding: 8,
        borderRadius: 8,
        background: 'white',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
        position: 'relative',
      }}
    >
      {/* four handles for making connections */}
      {/* NOTE: We render only one visible handle per side (type="source"),
          and enable loose connection mode in ReactFlow so these handles
          can act as both start and drop targets. 
          => để đảm bảo kết nối được cả hai chiều, ta render thêm target handle ẩn cùng vị trí */}
      
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={true}
        style={{
          background: '#444',
          width: 10,
          height: 10,
          borderRadius: 6,
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={true}
        style={{
          background: 'transparent',
          border: 'none',
          width: 12,
          height: 12,
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={true}
        style={{
          background: '#444',
          width: 10,
          height: 10,
          borderRadius: 6,
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={true}
        style={{
          background: 'transparent',
          border: 'none',
          width: 12,
          height: 12,
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={true}
        style={{
          background: '#444',
          width: 10,
          height: 10,
          borderRadius: 6,
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={true}
        style={{
          background: 'transparent',
          border: 'none',
          width: 12,
          height: 12,
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={true}
        style={{
          background: '#444',
          width: 10,
          height: 10,
          borderRadius: 6,
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={true}
        style={{
          background: 'transparent',
          border: 'none',
          width: 12,
          height: 12,
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '9999px',
          margin: '0 auto 8px auto',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6',
          fontWeight: 600,
        }}
      >
        {person?.avatar_url ? (
          <img src={person.avatar_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: 20 }}>{person?.name?.charAt(0) ?? '?'}</div>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600 }}>{person?.name}</div>
      <div style={{ fontSize: 11, color: '#666' }}>
        {person?.birth_date ? new Date(person.birth_date).getFullYear() : ''}
      </div>

      {hover && (
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button
            title="Xóa người"
            onClick={() => onDelete && onDelete(person.id)}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 8px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      )}
    </div>
  )
}
