import apiService from './api'

export interface Depot {
  id: number
  nom_depot: string
  adresse_depot: string
  ville_depot: string
  id_client: number
  created_at?: string
  updated_at?: string
}

export interface DepotsResponse {
  success: boolean
  data: Depot[]
}

/**
 * Get all depots for the current client
 */
export const getClientDepots = async (): Promise<Depot[]> => {
  const response = await apiService.get('/depots')
  return response.data.data
}

/**
 * Get a specific depot by ID
 */
export const getDepot = async (id: number): Promise<Depot> => {
  const response = await apiService.get(`/depots/${id}`)
  return response.data.data
}
