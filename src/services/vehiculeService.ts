import api from './api'

export interface Vehicule {
  id: number
  immatriculation: string
  marque: string
  modele: string
  tonnage: number
  id_type_vehicule: number
  type_vehicule?: {
    id: number
    libelle_type_vehicule: string
  }
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

/**
 * Get all vehicules without pagination
 */
export const getAllVehicules = async (): Promise<Vehicule[]> => {
  const response = await api.get('/vehicules?paginated=false')
  return response.data.data
}
