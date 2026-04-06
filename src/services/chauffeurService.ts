import api from './api'

export interface Chauffeur {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

/**
 * Get all chauffeurs without pagination
 */
export const getAllChauffeurs = async (): Promise<Chauffeur[]> => {
  const response = await api.get('/chauffeurs?paginated=false')
  return response.data.data
}
