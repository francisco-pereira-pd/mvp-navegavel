import { useState, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Upload, Image, X, ChevronRight, Plus, GripVertical } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'

function UploadPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, createProject, addScreen } = useProjects()
  
  const [selectedProjectId, setSelectedProjectId] = useState(location.state?.projectId || '')
  const [newProjectName, setNewProjectName] = useState('')
  const [uploadedImages, setUploadedImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    processFiles(files)
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    processFiles(files)
  }

  const processFiles = async (files) => {
    const newImages = await Promise.all(
      files.map(async (file, index) => {
        const imageData = await readFileAsDataURL(file)
        return {
          id: `temp-${Date.now()}-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageData,
          file
        }
      })
    )
    setUploadedImages(prev => [...prev, ...newImages])
  }

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const updateImageName = (id, newName) => {
    setUploadedImages(prev => prev.map(img => 
      img.id === id ? { ...img, name: newName } : img
    ))
  }

  const handleCreateProjectAndContinue = () => {
    let projectId = selectedProjectId

    //  Criar novo projeto se necessário
    if (!projectId && newProjectName.trim()) {
      const newProject = createProject(newProjectName.trim())
      projectId = newProject.id
    }

    if (!projectId) {
      alert('Por favor, selecione ou crie um projeto.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Por favor, faça upload de pelo menos uma imagem.')
      return
    }

    // Adicionar telas ao projeto
    uploadedImages.forEach((img, index) => {
      addScreen(projectId, {
        name: img.name,
        imageData: img.imageData,
        order: index
      })
    })

    // Navegar para o editor
    navigate('/editor', { state: { projectId } })
  }

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...uploadedImages]
    const [movedItem] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedItem)
    setUploadedImages(newImages)
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload de Telas</h1>
      <p className="text-gray-600 mb-8">
        Faça upload das imagens exportadas do Figma para criar seu protótipo navegável.
      </p>

      {/* Project Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Projeto</h2>
        
        <div className="space-y-4">
          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar projeto existente
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value)
                  setNewProjectName('')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">-- Selecione --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criar novo projeto
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value)
                setSelectedProjectId('')
              }}
              placeholder="Nome do novo projeto..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Imagens das Telas</h2>
        
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Arraste as imagens aqui
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou clique para selecionar arquivos
          </p>
          <p className="text-xs text-gray-400">
            Suporta PNG, JPG, JPEG, GIF, WebP
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">
                {uploadedImages.length} {uploadedImages.length === 1 ? 'imagem' : 'imagens'} carregadas
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus size={16} />
                <span>Adicionar mais</span>
              </button>
            </div>

            <div className="space-y-3">
              {uploadedImages.map((img, index) => (
                <div
                  key={img.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg group"
                >
                  <button className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical size={20} />
                  </button>
                  
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img 
                      src={img.imageData} 
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={img.name}
                      onChange={(e) => updateImageName(img.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Nome da tela..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Ordem: {index + 1}</p>
                  </div>

                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateProjectAndContinue}
          disabled={uploadedImages.length === 0 || (!selectedProjectId && !newProjectName.trim())}
          className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continuar para o Editor</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default UploadPage
