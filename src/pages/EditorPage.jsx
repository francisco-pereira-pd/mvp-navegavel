import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { 
  ChevronLeft, ChevronRight, Play, Trash2, Plus, 
  MousePointer2, Move, Image, Link as LinkIcon, Save,
  Eye, Upload
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'

function EditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, getProject, addHotspot, updateHotspot, deleteHotspot, deleteScreen } = useProjects()
  
  const projectId = location.state?.projectId || projects[0]?.id
  const project = getProject(projectId)
  
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0)
  const [selectedHotspotId, setSelectedHotspotId] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState(null)
  const [currentRect, setCurrentRect] = useState(null)
  const [tool, setTool] = useState('select') // 'select' | 'draw'
  const [showHotspots, setShowHotspots] = useState(true)
  
  const imageContainerRef = useRef(null)
  const imageRef = useRef(null)

  const currentScreen = project?.screens[selectedScreenIndex]
  const selectedHotspot = currentScreen?.hotspots.find(h => h.id === selectedHotspotId)

  //  Reset selected hotspot when changing screens
  useEffect(() => {
    setSelectedHotspotId(null)
  }, [selectedScreenIndex])

  if (!project) {
    return (
      <div className="text-center py-20">
        <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum projeto selecionado</h2>
        <p className="text-gray-500 mb-6">Crie ou selecione um projeto para começar.</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          <Upload size={20} />
          <span>Criar Projeto</span>
        </Link>
      </div>
    )
  }

  if (project.screens.length === 0) {
    return (
      <div className="text-center py-20">
        <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma tela no projeto</h2>
        <p className="text-gray-500 mb-6">Faça upload de imagens para começar.</p>
        <Link
          to="/upload"
          state={{ projectId: project.id }}
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          <Upload size={20} />
          <span>Upload de Telas</span>
        </Link>
      </div>
    )
  }

  const getRelativePosition = (e) => {
    const container = imageContainerRef.current
    const image = imageRef.current
    if (!container || !image) return null

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()
    
    // Calcular a posição relativa à imagem
    const x = ((e.clientX - imageRect.left) / imageRect.width) * 100
    const y = ((e.clientY - imageRect.top) / imageRect.height) * 100
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  const handleMouseDown = (e) => {
    if (tool !== 'draw') return
    
    const pos = getRelativePosition(e)
    if (!pos) return
    
    setIsDrawing(true)
    setDrawStart(pos)
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || tool !== 'draw') return
    
    const pos = getRelativePosition(e)
    if (!pos || !drawStart) return
    
    const x = Math.min(drawStart.x, pos.x)
    const y = Math.min(drawStart.y, pos.y)
    const width = Math.abs(pos.x - drawStart.x)
    const height = Math.abs(pos.y - drawStart.y)
    
    setCurrentRect({ x, y, width, height })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect || tool !== 'draw') {
      setIsDrawing(false)
      return
    }
    
    // Só criar hotspot se tiver tamanho mínimo
    if (currentRect.width > 2 && currentRect.height > 2) {
      addHotspot(project.id, currentScreen.id, {
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.width,
        height: currentRect.height,
        targetScreenId: null,
        label: `Hotspot ${currentScreen.hotspots.length + 1}`
      })
    }
    
    setIsDrawing(false)
    setDrawStart(null)
    setCurrentRect(null)
  }

  const handleHotspotClick = (e, hotspot) => {
    e.stopPropagation()
    if (tool === 'select') {
      setSelectedHotspotId(hotspot.id)
    }
  }

  const handleDeleteHotspot = () => {
    if (selectedHotspotId) {
      deleteHotspot(project.id, currentScreen.id, selectedHotspotId)
      setSelectedHotspotId(null)
    }
  }

  const handleUpdateHotspotTarget = (targetScreenId) => {
    if (selectedHotspotId) {
      updateHotspot(project.id, currentScreen.id, selectedHotspotId, { 
        targetScreenId: targetScreenId || null 
      })
    }
  }

  const handleDeleteScreen = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tela?')) {
      deleteScreen(project.id, currentScreen.id)
      if (selectedScreenIndex > 0) {
        setSelectedScreenIndex(selectedScreenIndex - 1)
      }
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">
            Tela {selectedScreenIndex + 1} de {project.screens.length}: {currentScreen?.name}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/player/${project.id}`}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play size={18} />
            <span>Testar Protótipo</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Screen List */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Telas</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {project.screens.map((screen, index) => (
                <button
                  key={screen.id}
                  onClick={() => setSelectedScreenIndex(index)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    index === selectedScreenIndex
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="w-full aspect-video rounded bg-gray-200 overflow-hidden mb-2">
                    <img
                      src={screen.imageData}
                      alt={screen.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">{screen.name}</p>
                  <p className="text-xs text-gray-400">{screen.hotspots.length} hotspots</p>
                </button>
              ))}
            </div>
            <Link
              to="/upload"
              state={{ projectId: project.id }}
              className="flex items-center justify-center space-x-1 w-full mt-3 p-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Adicionar Telas</span>
            </Link>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTool('select')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  tool === 'select' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MousePointer2 size={18} />
                <span className="text-sm">Selecionar</span>
              </button>
              <button
                onClick={() => setTool('draw')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  tool === 'draw' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus size={18} />
                <span className="text-sm">Novo Hotspot</span>
              </button>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showHotspots 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Eye size={18} />
                <span className="text-sm">{showHotspots ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedScreenIndex(Math.max(0, selectedScreenIndex - 1))}
                disabled={selectedScreenIndex === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                {selectedScreenIndex + 1} / {project.screens.length}
              </span>
              <button
                onClick={() => setSelectedScreenIndex(Math.min(project.screens.length - 1, selectedScreenIndex + 1))}
                disabled={selectedScreenIndex === project.screens.length - 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div 
            ref={imageContainerRef}
            className="bg-gray-900 rounded-xl overflow-hidden relative"
            style={{ minHeight: '500px' }}
          >
            <div className="flex items-center justify-center p-4">
              <div 
                className="relative inline-block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
              >
                <img
                  ref={imageRef}
                  src={currentScreen.imageData}
                  alt={currentScreen.name}
                  className="max-h-[70vh] w-auto"
                  draggable={false}
                />
                
                {/* Hotspots */}
                {showHotspots && currentScreen.hotspots.map(hotspot => (
                  <div
                    key={hotspot.id}
                    onClick={(e) => handleHotspotClick(e, hotspot)}
                    className={`hotspot ${selectedHotspotId === hotspot.id ? 'selected' : ''}`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      width: `${hotspot.width}%`,
                      height: `${hotspot.height}%`
                    }}
                  >
                    {hotspot.targetScreenId && (
                      <div className="absolute -top-6 left-0 bg-primary-600 text-white text-xs px-2 py-0.5 rounded flex items-center space-x-1">
                        <LinkIcon size={10} />
                        <span>
                          {project.screens.find(s => s.id === hotspot.targetScreenId)?.name || 'Link'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Drawing Preview */}
                {isDrawing && currentRect && (
                  <div
                    className="absolute border-2 border-primary-500 bg-primary-500/20"
                    style={{
                      left: `${currentRect.x}%`,
                      top: `${currentRect.y}%`,
                      width: `${currentRect.width}%`,
                      height: `${currentRect.height}%`
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Propriedades</h3>
            
            {selectedHotspot ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hotspot Selecionado
                  </label>
                  <input
                    type="text"
                    value={selectedHotspot.label || ''}
                    onChange={(e) => updateHotspot(project.id, currentScreen.id, selectedHotspotId, { label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Nome do hotspot"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <LinkIcon size={14} className="inline mr-1" />
                    Navegar para
                  </label>
                  <select
                    value={selectedHotspot.targetScreenId || ''}
                    onChange={(e) => handleUpdateHotspotTarget(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="">-- Selecione a tela --</option>
                    {project.screens.map(screen => (
                      <option key={screen.id} value={screen.id}>
                        {screen.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDeleteHotspot}
                    className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Excluir Hotspot</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MousePointer2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Selecione um hotspot ou desenhe um novo para editar suas propriedades.
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Ações da Tela</h4>
              <button
                onClick={handleDeleteScreen}
                className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                <span>Excluir Tela</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage
