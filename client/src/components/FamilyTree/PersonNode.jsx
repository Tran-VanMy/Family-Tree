// family-tree/client/src/components/FamilyTree/PersonNode.jsx
import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { FiTrash2 } from 'react-icons/fi'

export default function PersonNode({ data }) {
  const person = data?.person
  const onDelete = data?.onDelete

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
      <Handle
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
      />

      {/* Bottom */}
      <Handle
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
      />

      {/* Left */}
      <Handle
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
          <img
            src={person.avatar_url}
            alt={person.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ fontSize: 20 }}>{person?.name?.charAt(0) ?? '?'}</div>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600 }}>{person?.name}</div>
      <div style={{ fontSize: 11, color: '#666' }}>
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
