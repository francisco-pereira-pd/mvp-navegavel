import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { 
  BarChart3, MousePointer2, Clock, Users, Play, 
  Trash2, Download, ChevronDown, Eye, Target
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useAnalytics } from '../hooks/useAnalytics'

function AnalyticsPage() {
  const location = useLocation()
  const { projects } = useProjects()
  const { getSessionStats, getProjectSessions, clearProjectSessions } = useAnalytics()
  
  const [selectedProjectId, setSelectedProjectId] = useState(location.state?.projectId || '')
  const [selectedScreenId, setSelectedScreenId] = useState('')
  const [showHeatmap, setShowHeatmap] = useState(true)
  
  const project = projects.find(p => p.id === selectedProjectId)
  const stats = selectedProjectId ? getSessionStats(selectedProjectId) : null
  const sessions = selectedProjectId ? getProjectSessions(selectedProjectId) : []
  const selectedScreen = project?.screens.find(s => s.id === selectedScreenId)

  //  Selecionar primeira tela quando mudar projeto
  useEffect(() => {
    if (project?.screens.length > 0 && !selectedScreenId) {
      setSelectedScreenId(project.screens[0].id)
    }
  }, [project, selectedScreenId])

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados de teste deste projeto? Esta ação não pode ser desfeita.')) {
      clearProjectSessions(selectedProjectId)
    }
  }

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportData = () => {
    const data = {
      project: project?.name,
      exportedAt: new Date().toISOString(),
      stats,
      sessions
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${project?.name || 'projeto'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise de Usabilidade</h1>
          <p className="text-gray-600">Visualize métricas e heatmaps dos testes realizados.</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Projeto
        </label>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value)
              setSelectedScreenId('')
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">-- Selecione um projeto --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.screens.length} telas)</option>
            ))}
          </select>
          
          {selectedProjectId && (
            <>
              <Link
                to={`/player/${selectedProjectId}`}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play size={18} />
                <span>Testar</span>
              </Link>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={18} />
                <span>Exportar</span>
              </button>
              <button
                onClick={handleClearData}
                className="flex items-center space-x-2 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
                <span>Limpar Dados</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecione um projeto para ver as análises.</p>
        </div>
      ) : stats?.totalSessions === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum teste realizado</h3>
          <p className="text-gray-500 mb-6">
            Compartilhe o link do protótipo para começar a coletar dados.
          </p>
          <Link
            to={`/player/${selectedProjectId}`}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            <Play size={20} />
            <span>Iniciar Teste</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Sessões de Teste"
              value={stats.totalSessions}
              color="blue"
            />
            <StatCard
              icon={<MousePointer2 className="w-6 h-6" />}
              label="Total de Cliques"
              value={stats.totalClicks}
              color="green"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Cliques/Sessão"
              value={stats.avgClicksPerSession.toFixed(1)}
              color="purple"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Duração Média"
              value={formatDuration(stats.avgSessionDuration)}
              color="orange"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Heatmap */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Heatmap de Cliques</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        showHeatmap 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Eye size={16} />
                      <span>{showHeatmap ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                  </div>
                </div>

                {/* Screen Selector */}
                <div className="mb-4">
                  <select
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {project?.screens.map(screen => (
                      <option key={screen.id} value={screen.id}>
                        {screen.name} ({stats.clickHeatmap[screen.id]?.length || 0} cliques)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Heatmap Display */}
                {selectedScreen && (
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedScreen.imageData}
                      alt={selectedScreen.name}
                      className="w-full"
                    />
                    
                    {showHeatmap && stats.clickHeatmap[selectedScreenId]?.map((click, index) => (
                      <div
                        key={index}
                        className={`absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                          click.isHotspot 
                            ? 'bg-green-500/60' 
                            : 'bg-red-500/60'
                        }`}
                        style={{
                          left: `${click.x}%`,
                          top: `${click.y}%`
                        }}
                        title={click.isHotspot ? 'Clique em hotspot' : 'Clique perdido'}
                      />
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Clique em hotspot</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Clique perdido</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sessões Recentes</h3>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {sessions.slice(-10).reverse().map((session, index) => (
                    <div
                      key={session.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Sessão #{sessions.length - index}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.endedAt 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {session.endedAt ? 'Finalizada' : 'Em andamento'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Início: {formatDate(session.startedAt)}</p>
                        {session.endedAt && (
                          <p>
                            Duração: {formatDuration(
                              (new Date(session.endedAt) - new Date(session.startedAt)) / 1000
                            )}
                          </p>
                        )}
                        <p>{session.clicks.length} cliques • {session.screenViews.length} telas vistas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missed Clicks Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Cliques Perdidos</h3>
                <p className="text-3xl font-bold text-red-500 mb-2">
                  {stats.missedClicks.length}
                </p>
                <p className="text-sm text-gray-500">
                  Cliques fora das áreas interativas. Considere adicionar hotspots nesses locais.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

export default AnalyticsPage
