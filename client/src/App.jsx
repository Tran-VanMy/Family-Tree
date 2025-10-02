// family-tree/client/src/App.jsx
import React from 'react'
import FamilyTree from './components/FamilyTree'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <FamilyTree SidebarComponent={Sidebar} />
    </div>
  )
}
