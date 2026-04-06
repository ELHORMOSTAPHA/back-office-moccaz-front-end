import api from './api'

export interface TypeVehicule {
  id: number
  libelle_type_vehicule: string
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

/**
 * Get all vehicle types
 */
export const getTypeVehicules = async (): Promise<TypeVehicule[]> => {
  const response = await api.get('/type-vehicules')
  return response.data.data
}
