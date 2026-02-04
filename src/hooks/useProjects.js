import { useLocalStorage } from './useLocalStorage'
import { v4 as uuidv4 } from 'uuid'

export function useProjects() {
  const [projects, setProjects] = useLocalStorage('mvp-tcerr-projects', [])

  const createProject = (name) => {
    const newProject = {
      id: uuidv4(),
      name,
      screens: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProjects([...projects, newProject])
    return newProject
  }

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ))
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const getProject = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  const addScreen = (projectId, screen) => {
    const newScreen = {
      id: uuidv4(),
      ...screen,
      hotspots: [],
      order: projects.find(p => p.id === projectId)?.screens.length || 0
    }
    
    setProjects(projects.map(p => 
      p.id === projectId
        ? { ...p, screens: [...p.screens, newScreen], updatedAt: new Date().toISOString() }
        : p
    ))
    return newScreen
  }

  const updateScreen = (projectId, screenId, updates) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? {
            ...p,
            screens: p.screens.map(s => 
              s.id === screenId ? { ...s, ...updates } : s
            ),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }

  const deleteScreen = (projectId, screenId) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? {
            ...p,
            screens: p.screens.filter(s => s.id !== screenId),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }

  const addHotspot = (projectId, screenId, hotspot) => {
    const newHotspot = {
      id: uuidv4(),
      ...hotspot
    }

    setProjects(projects.map(p => 
      p.id === projectId
        ? {
            ...p,
            screens: p.screens.map(s => 
              s.id === screenId
                ? { ...s, hotspots: [...s.hotspots, newHotspot] }
                : s
            ),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
    return newHotspot
  }

  const updateHotspot = (projectId, screenId, hotspotId, updates) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? {
            ...p,
            screens: p.screens.map(s => 
              s.id === screenId
                ? {
                    ...s,
                    hotspots: s.hotspots.map(h => 
                      h.id === hotspotId ? { ...h, ...updates } : h
                    )
                  }
                : s
            ),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }

  const deleteHotspot = (projectId, screenId, hotspotId) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? {
            ...p,
            screens: p.screens.map(s => 
              s.id === screenId
                ? { ...s, hotspots: s.hotspots.filter(h => h.id !== hotspotId) }
                : s
            ),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addScreen,
    updateScreen,
    deleteScreen,
    addHotspot,
    updateHotspot,
    deleteHotspot
  }
}

export default useProjects
