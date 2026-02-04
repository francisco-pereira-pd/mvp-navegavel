import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { X, RotateCcw, ChevronLeft, Home, BarChart3 } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useAnalytics } from '../hooks/useAnalytics'

function PlayerPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProject } = useProjects()
  const { startSession, endSession, recordClick, recordScreenView } = useAnalytics()
  
  const project = getProject(projectId)
  
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [clickIndicators, setClickIndicators] = useState([])
  const [history, setHistory] = useState([0])
  const [showControls, setShowControls] = useState(true)
  
  const imageRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  const currentScreen = project?.screens[currentScreenIndex]

  // Iniciar sessão de rastreamento
  useEffect(() => {
    if (project) {
      const newSessionId = startSession(projectId)
      setSessionId(newSessionId)
      
      // Registrar visualização da primeira tela
      if (project.screens.length > 0) {
        recordScreenView(newSessionId, project.screens[0].id)
      }

      return () => {
        endSession(newSessionId)
      }
    }
  }, [projectId])

  // Registrar visualização quando mudar de tela
  useEffect(() => {
    if (sessionId && currentScreen) {
      recordScreenView(sessionId, currentScreen.id)
    }
  }, [currentScreenIndex, sessionId])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-4">Projeto não encontrado</h2>
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <Home size={18} />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    )
  }

  if (project.screens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-4">Nenhuma tela no projeto</h2>
          <Link 
            to="/upload"
            state={{ projectId: project.id }}
            className="inline-flex items-center space-x-2 bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <span>Adicionar Telas</span>
          </Link>
        </div>
      </div>
    )
  }

  const getRelativePosition = (e) => {
    const image = imageRef.current
    if (!image) return null

    const imageRect = image.getBoundingClientRect()
    
    const x = ((e.clientX - imageRect.left) / imageRect.width) * 100
    const y = ((e.clientY - imageRect.top) / imageRect.height) * 100
    
    return { 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)),
      clientX: e.clientX,
      clientY: e.clientY
    }
  }

  const handleClick = (e) => {
    const pos = getRelativePosition(e)
    if (!pos) return

    // Mostrar indicador de clique
    const indicatorId = Date.now()
    setClickIndicators(prev => [...prev, { id: indicatorId, x: pos.clientX, y: pos.clientY }])
    setTimeout(() => {
      setClickIndicators(prev => prev.filter(i => i.id !== indicatorId))
    }, 500)

    // Verificar se clicou em um hotspot
    const clickedHotspot = currentScreen.hotspots.find(hotspot => {
      return (
        pos.x >= hotspot.x &&
        pos.x <= hotspot.x + hotspot.width &&
        pos.y >= hotspot.y &&
        pos.y <= hotspot.y + hotspot.height
      )
    })

    // Registrar clique
    if (sessionId) {
      recordClick(sessionId, {
        screenId: currentScreen.id,
        x: pos.x,
        y: pos.y,
        isHotspot: !!clickedHotspot,
        hotspotId: clickedHotspot?.id || null,
        targetScreenId: clickedHotspot?.targetScreenId || null
      })
    }

    // Navegar se clicou em hotspot com destino
    if (clickedHotspot?.targetScreenId) {
      const targetIndex = project.screens.findIndex(s => s.id === clickedHotspot.targetScreenId)
      if (targetIndex !== -1) {
        setHistory(prev => [...prev, targetIndex])
        setCurrentScreenIndex(targetIndex)
      }
    }
  }

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop()
      const previousIndex = newHistory[newHistory.length - 1]
      setHistory(newHistory)
      setCurrentScreenIndex(previousIndex)
    }
  }

  const handleRestart = () => {
    setCurrentScreenIndex(0)
    setHistory([0])
  }

  const handleExit = () => {
    if (sessionId) {
      endSession(sessionId)
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Controls Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExit}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <X size={20} />
                <span className="text-sm">Sair</span>
              </button>
              
              <div className="h-4 w-px bg-gray-600"></div>
              
              <span className="text-white font-medium">{project.name}</span>
              <span className="text-gray-400 text-sm">
                Tela {currentScreenIndex + 1} de {project.screens.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                disabled={history.length <= 1}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                <span>Voltar</span>
              </button>
              
              <button
                onClick={handleRestart}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <RotateCcw size={16} />
                <span>Reiniciar</span>
              </button>

              <div className="h-4 w-px bg-gray-600"></div>

              <Link
                to="/analytics"
                state={{ projectId: project.id }}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <BarChart3 size={16} />
                <span>Análise</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative cursor-pointer"
          onClick={handleClick}
        >
          <img
            ref={imageRef}
            src={currentScreen.imageData}
            alt={currentScreen.name}
            className="max-h-[90vh] max-w-full w-auto shadow-2xl"
            draggable={false}
          />
          
          {/* Debug: Show hotspots (hidden in production) */}
          {false && currentScreen.hotspots.map(hotspot => (
            <div
              key={hotspot.id}
              className="absolute border-2 border-blue-500/30 bg-blue-500/10"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`
              }}
            />
          ))}
        </div>
      </div>

      {/* Click Indicators */}
      {clickIndicators.map(indicator => (
        <div
          key={indicator.id}
          className="click-indicator"
          style={{
            left: indicator.x,
            top: indicator.y
          }}
        />
      ))}

      {/* Screen Name Indicator */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          {currentScreen.name}
        </div>
      </div>
    </div>
  )
}

export default PlayerPage
