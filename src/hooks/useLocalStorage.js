import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Função para atualizar o valor
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
