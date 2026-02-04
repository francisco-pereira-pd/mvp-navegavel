import { useLocalStorage } from './useLocalStorage'
import { v4 as uuidv4 } from 'uuid'

export function useAnalytics() {
  const [sessions, setSessions] = useLocalStorage('mvp-tcerr-sessions', [])

  const startSession = (projectId) => {
    const session = {
      id: uuidv4(),
      projectId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      clicks: [],
      screenViews: []
    }
    setSessions([...sessions, session])
    return session.id
  }

  const endSession = (sessionId) => {
    setSessions(sessions.map(s =>
      s.id === sessionId
        ? { ...s, endedAt: new Date().toISOString() }
        : s
    ))
  }

  const recordClick = (sessionId, clickData) => {
    const click = {
      id: uuidv4(),
      ...clickData,
      timestamp: new Date().toISOString()
    }

    setSessions(sessions.map(s =>
      s.id === sessionId
        ? { ...s, clicks: [...s.clicks, click] }
        : s
    ))
  }

  const recordScreenView = (sessionId, screenId) => {
    const view = {
      screenId,
      timestamp: new Date().toISOString()
    }

    setSessions(sessions.map(s =>
      s.id === sessionId
        ? { ...s, screenViews: [...s.screenViews, view] }
        : s
    ))
  }

  const getProjectSessions = (projectId) => {
    return sessions.filter(s => s.projectId === projectId)
  }

  const getSessionStats = (projectId) => {
    const projectSessions = getProjectSessions(projectId)
    
    if (projectSessions.length === 0) {
      return {
        totalSessions: 0,
        totalClicks: 0,
        avgClicksPerSession: 0,
        avgSessionDuration: 0,
        clickHeatmap: {},
        screenViewCounts: {},
        missedClicks: []
      }
    }

    const totalClicks = projectSessions.reduce((sum, s) => sum + s.clicks.length, 0)
    
    // Calcular duração média das sessões
    const completedSessions = projectSessions.filter(s => s.endedAt)
    const avgSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => {
          const duration = new Date(s.endedAt) - new Date(s.startedAt)
          return sum + duration
        }, 0) / completedSessions.length / 1000 // em segundos
      : 0

    // Agrupar cliques por tela para heatmap
    const clickHeatmap = {}
    projectSessions.forEach(session => {
      session.clicks.forEach(click => {
        if (!clickHeatmap[click.screenId]) {
          clickHeatmap[click.screenId] = []
        }
        clickHeatmap[click.screenId].push({
          x: click.x,
          y: click.y,
          isHotspot: click.isHotspot
        })
      })
    })

    // Contar visualizações por tela
    const screenViewCounts = {}
    projectSessions.forEach(session => {
      session.screenViews.forEach(view => {
        screenViewCounts[view.screenId] = (screenViewCounts[view.screenId] || 0) + 1
      })
    })

    // Cliques perdidos (fora dos hotspots)
    const missedClicks = projectSessions.flatMap(s => 
      s.clicks.filter(c => !c.isHotspot)
    )

    return {
      totalSessions: projectSessions.length,
      totalClicks,
      avgClicksPerSession: totalClicks / projectSessions.length,
      avgSessionDuration,
      clickHeatmap,
      screenViewCounts,
      missedClicks
    }
  }

  const clearProjectSessions = (projectId) => {
    setSessions(sessions.filter(s => s.projectId !== projectId))
  }

  return {
    sessions,
    startSession,
    endSession,
    recordClick,
    recordScreenView,
    getProjectSessions,
    getSessionStats,
    clearProjectSessions
  }
}

export default useAnalytics
