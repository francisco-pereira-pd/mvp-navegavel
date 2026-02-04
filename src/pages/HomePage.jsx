import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Folder, Trash2, Play, Edit3, Clock, Image } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'

function HomePage() {
  const { projects, createProject, deleteProject } = useProjects()
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const navigate = useNavigate()

  const handleCreateProject = (e) => {
    e.preventDefault()
    if (newProjectName.trim()) {
      const project = createProject(newProjectName.trim())
      setNewProjectName('')
      setShowNewProject(false)
      navigate('/upload', { state: { projectId: project.id } })
    }
  }

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(projectId)
    }
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

  return (
    <div className="animate-fade-in">
      {/*  Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Teste de Usabilidade com Protótipos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Faça upload das telas do Figma, defina áreas clicáveis e crie protótipos 
          navegáveis para testar a usabilidade com usuários reais.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StepCard 
          number={1} 
          title="Upload" 
          description="Faça upload das imagens das telas do Figma"
          icon={<Image className="w-6 h-6" />}
        />
        <StepCard 
          number={2} 
          title="Hotspots" 
          description="Defina as áreas clicáveis e suas navegações"
          icon={<Edit3 className="w-6 h-6" />}
        />
        <StepCard 
          number={3} 
          title="Testar" 
          description="Compartilhe o link e colete dados de uso"
          icon={<Play className="w-6 h-6" />}
        />
        <StepCard 
          number={4} 
          title="Analisar" 
          description="Veja heatmaps e métricas de usabilidade"
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Meus Projetos</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>Novo Projeto</span>
          </button>
        </div>

        {/* New Project Form */}
        {showNewProject && (
          <form onSubmit={handleCreateProject} className="mb-6 p-4 bg-gray-50 rounded-lg animate-slide-up">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nome do projeto..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum projeto ainda.</p>
            <p className="text-gray-400 text-sm">Clique em "Novo Projeto" para começar.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
        {icon}
      </div>
      <div className="text-sm font-medium text-primary-600 mb-1">Passo {number}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

function ProjectCard({ project, onDelete, formatDate }) {
  const navigate = useNavigate()
  
  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
      onClick={() => navigate('/editor', { state: { projectId: project.id } })}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
            <Folder size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{project.name}</h3>
            <p className="text-xs text-gray-500">{project.screens.length} telas</p>
          </div>
        </div>
        <button
          onClick={(e) => onDelete(project.id, e)}
          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {/* Screen Thumbnails */}
      {project.screens.length > 0 && (
        <div className="flex -space-x-2 mb-3">
          {project.screens.slice(0, 4).map((screen, idx) => (
            <div
              key={screen.id}
              className="w-12 h-12 rounded border-2 border-white bg-gray-200 overflow-hidden"
              style={{ zIndex: 4 - idx }}
            >
              <img 
                src={screen.imageData} 
                alt={screen.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {project.screens.length > 4 && (
            <div className="w-12 h-12 rounded border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
              +{project.screens.length - 4}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Atualizado: {formatDate(project.updatedAt)}</span>
        <div className="flex space-x-2">
          <Link
            to={`/player/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:text-primary-600"
          >
            <Play size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
