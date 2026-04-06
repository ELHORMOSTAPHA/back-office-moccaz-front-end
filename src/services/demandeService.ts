/**
 * Demande Service
 * All API calls related to demandes
 */

import api, { type PaginatedResponse } from './api'

// Type definitions for API responses
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

/**
 * Demande type matching backend response
 */
export interface Demande {
  id: number
  code_barre: string
  client: {
    id: number
    nom: string
    prenom: string
    raison_sociale: string
    email: string
    telephone: string
    type_client: 'particulier' | 'societe'
  }
  type_demande: 'Transport' | 'Messagerie'
  type_vehicule?: {
    id: number
    libelle: string
  } | null
  nombre_tonne: number
  nombre_colies?: number
  tailles_colies?: string
  date_enlevement: string
  date_enlevement_formatted: string
  date_livraison_souhaitee?: string | null
  date_livraison_souhaitee_formatted?: string | null
  status: 'À planifier' | 'Planifiée' | 'Traitement en cours' | 'Livrée' | 'Anomalie' | 'Clôturée'
  notes?: string
  adresse_enlevement: string
  adresse_livraison: string
  ville_depart: {
    id: number
    nom: string
  }
  ville_arrivee: {
    id: number
    nom: string
  }
  voyages?: any[]
  is_parent?: boolean
  created_at: string
  updated_at: string
}

/**
 * Create Demande DTO
 */
export interface CreateDemandeDTO {
  id_client: number
  type_demande: 'Transport' | 'Messagerie'
  id_type_vehicule?: number
  nombre_tonne: number
  date_enlevement: string
  date_livraison_souhaitee?: string
  status?: Demande['status']
  notes?: string
  adresse_enlevement: string
  adresse_livraison: string
  id_ville_depart: number
  id_ville_arrivee: number
}

/**
 * Update Demande DTO
 */
export interface UpdateDemandeDTO extends Partial<CreateDemandeDTO> {
  status?: Demande['status']
}

/**
 * Demande filters
 */
export interface DemandeFilters {
  status?: Demande['status']
  type_demande?: 'Transport' | 'Messagerie'
  id_client?: number
  date_from?: string
  date_to?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

/**
 * Statistics response
 */
export interface DemandeStatistics {
  total: number
  by_status: Record<string, number>
  by_type: Record<string, number>
  total_weight: string
  total_packages: string
}

/**
 * Get all demandes with filters and pagination
 */
export async function getAllDemandes(filters?: DemandeFilters): Promise<PaginatedResponse<Demande>> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = `/demandes${queryString ? `?${queryString}` : ''}`

  const response = await api.get<PaginatedResponse<Demande>>(endpoint)
  return response.data
}

/**
 * Get single demande by ID
 */
export async function getDemandeById(id: number): Promise<ApiResponse<Demande>> {
  const response = await api.get<ApiResponse<Demande>>(`/demandes/${id}`)
  return response.data
}

/**
 * Create new demande
 */
export async function createDemande(data: CreateDemandeDTO): Promise<ApiResponse<Demande>> {
  const response = await api.post<ApiResponse<Demande>>('/demandes', data)
  return response.data
}

/**
 * Update existing demande
 */
export async function updateDemande(id: number, data: UpdateDemandeDTO): Promise<ApiResponse<Demande>> {
  const response = await api.put<ApiResponse<Demande>>(`/demandes/${id}`, data)
  return response.data
}

/**
 * Update demande status only
 */
export async function updateDemandeStatus(
  id: number,
  status: Demande['status']
): Promise<ApiResponse<Demande>> {
  const response = await api.patch<ApiResponse<Demande>>(`/demandes/${id}/status`, { status })
  return response.data
}

/**
 * Delete demande
 */
export async function deleteDemande(id: number): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/demandes/${id}`)
  return response.data
}

/**
 * Get demandes by client ID
 */
export async function getDemandesByClient(
  clientId: number,
  perPage?: number
): Promise<PaginatedResponse<Demande>> {
  const params = new URLSearchParams()
  if (perPage) params.append('per_page', String(perPage))

  const queryString = params.toString()
  const endpoint = `/demandes/client/${clientId}${queryString ? `?${queryString}` : ''}`

  const response = await api.get<PaginatedResponse<Demande>>(endpoint)
  return response.data
}

/**
 * Get demandes statistics
 */
export async function getDemandeStatistics(): Promise<ApiResponse<DemandeStatistics>> {
  const response = await api.get<ApiResponse<DemandeStatistics>>('/demandes/statistics')
  return response.data
}
