import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Upload, Edit3, Play, BarChart3, Home } from 'lucide-react'
import UploadPage from './pages/UploadPage'
import EditorPage from './pages/EditorPage'
import PlayerPage from './pages/PlayerPage'
import AnalyticsPage from './pages/AnalyticsPage'
import HomePage from './pages/HomePage'

function App() {
  const location = useLocation()
  const isPlayerMode = location.pathname.startsWith('/player/')

  // Esconder navegação no modo player para experiência imersiva
  if (isPlayerMode) {
    return (
      <Routes>
        <Route path="/player/:projectId" element={<PlayerPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <span className="font-semibold text-gray-900">MVP TCERR</span>
            </Link>
            
            <nav className="flex space-x-1">
              <NavLink to="/" icon={<Home size={18} />} label="Início" />
              <NavLink to="/upload" icon={<Upload size={18} />} label="Upload" />
              <NavLink to="/editor" icon={<Edit3 size={18} />} label="Editor" />
              <NavLink to="/analytics" icon={<BarChart3 size={18} />} label="Análise" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </div>
  )
}

function NavLink({ to, icon, label }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default App
