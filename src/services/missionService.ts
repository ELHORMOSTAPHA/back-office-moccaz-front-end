/**
 * Mission Service
 * All API calls related to missions
 */

import api from './api'

// Type definitions for API responses
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

/**
 * Mission type matching backend response
 */
export interface Mission {
  id: number
  id_chauffeur: number
  id_vehicule: number
  type_mission: string
  date_enlevement: string
  statut: 'À planifier' | 'Planifiée' | 'Traitement en cours' | 'Livrée' | 'Anomalie' | 'Clôturée'
  id_parent_demande?: number | null
  created_at: string
  updated_at: string
  chauffeur?: {
    id: number
    nom: string
    prenom: string
    telephone: string
  }
  vehicule?: {
    id: number
    immatriculation: string
    marque: string
    modele: string
  }
  parent_demande?: {
    id: number
    code_barre: string
    type_demande: string
    status: string
    date_enlevement: string
    date_livraison_souhaitee?: string | null
  }
  trajets?: any[]
}

/**
 * Create Mission Data
 */
export interface CreateMissionData {
  id_chauffeur: number
  id_vehicule: number
  type_mission: string
  date_enlevement: string
  statut?: 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
  id_parent_demande?: number | null
  trajets?: number[]
}

/**
 * Get all missions with optional filters
 */
export const getAllMissions = async (filters?: {
  per_page?: number
  order_by?: string
  order?: 'asc' | 'desc'
  keyword?: string
  statut?: string
  paginated?: boolean
  filter_by_delivery_date?: boolean
}): Promise<ApiResponse<Mission[]>> => {
  const params = new URLSearchParams()

  if (filters?.per_page) params.append('per_page', filters.per_page.toString())
  if (filters?.order_by) params.append('order_by', filters.order_by)
  if (filters?.order) params.append('order', filters.order)
  if (filters?.keyword) params.append('keyword', filters.keyword)
  if (filters?.statut) params.append('statut', filters.statut)
  if (filters?.paginated !== undefined) params.append('paginated', filters.paginated.toString())
  if (filters?.filter_by_delivery_date !== undefined) params.append('filter_by_delivery_date', filters.filter_by_delivery_date.toString())

  const response = await api.get(`/missions?${params.toString()}`)
  return response.data
}

/**
 * Get a single mission by ID
 */
export const getMission = async (id: number): Promise<ApiResponse<Mission>> => {
  const response = await api.get(`/missions/${id}`)
  return response.data
}

/**
 * Get missions by vehicle ID
 */
export const getMissionsByVehicule = async (vehiculeId: number, filters?: {
  statut?: string
  type_mission?: string
  date_from?: string
  filter_by_delivery_date?: boolean
}): Promise<ApiResponse<Mission[]>> => {
  const params = new URLSearchParams()
  params.append('id_vehicule', vehiculeId.toString())
  params.append('paginated', 'false')

  if (filters?.statut) params.append('statut', filters.statut)
  if (filters?.type_mission) params.append('type_mission', filters.type_mission)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.filter_by_delivery_date !== undefined) params.append('filter_by_delivery_date', filters.filter_by_delivery_date.toString())

  const response = await api.get(`/missions?${params.toString()}`)
  return response.data
}

/**
 * Create a new mission
 */
export const createMission = async (data: CreateMissionData): Promise<ApiResponse<Mission>> => {
  const response = await api.post('/missions', data)
  return response.data
}

/**
 * Add trajets to an existing mission and update status to mixte
 */
export const addTrajetsToMission = async (missionId: number, trajetIds: number[]): Promise<ApiResponse<Mission>> => {
  const response = await api.patch(`/missions/${missionId}/add-trajets`, {
    trajets: trajetIds
  })
  return response.data
}

/**
 * Update a mission
 */
export const updateMission = async (id: number, data: Partial<CreateMissionData>): Promise<ApiResponse<Mission>> => {
  const response = await api.put(`/missions/${id}`, data)
  return response.data
}

/**
 * Delete a mission
 */
export const deleteMission = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/missions/${id}`)
  return response.data
}

/**
 * Update mission status
 */
export const updateMissionStatus = async (
  id: number,
  statut: Mission['statut']
): Promise<ApiResponse<Mission>> => {
  const response = await api.put(`/missions/${id}`, { statut })
  return response.data
}
