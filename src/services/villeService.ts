import api from './api'

export interface Ville {
  id: number
  nom_ville: string
  created_at?: string
  updated_at?: string
}

export interface VilleResponse {
  data: Ville[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

/**
 * Get all villes from the database
 */
export const getAllVilles = async (): Promise<Ville[]> => {
  try {
    const response = await api.get('/villes', {
      params: {
        paginated: false // Get all villes without pagination
      }
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching villes:', error)
    throw error
  }
}

/**
 * Get a specific ville by ID
 */
export const getVilleById = async (id: number): Promise<Ville> => {
  try {
    const response = await api.get(`/villes/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching ville ${id}:`, error)
    throw error
  }
}
