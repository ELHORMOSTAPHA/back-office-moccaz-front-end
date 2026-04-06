import type {
  DemandeReservation,
  DemandeReservationListParams,
  PaginatedResponse,
} from '@/interface/gloable'
import api from './api'

/** Body for POST /demande_reservation (StoreDemandeReservationRequest). */
export type CreateDemandeReservationPayload = {
  stock_id: number
  id_demande?: string | null
  nom_commercial?: string | null
  id_commercial?: number | null
  demande_infos?: string | null
  statut?: string | null
}

/** Body for PUT /demande_reservation/{id} (UpdateDemandeReservationRequest). */
export type EditDemandeReservationPayload = {
  stock_id?: number | null
  id_demande?: string | null
  nom_commercial?: string | null
  id_commercial?: number | null
  demande_infos?: string | null
  statut?: string | null
}

export const loadDemandeReservations = async (
  params: DemandeReservationListParams,
): Promise<PaginatedResponse<DemandeReservation>> => {
  try {
    const response = await api.get('/demande_reservation', { params })
    return response.data.data
  } catch (error) {
    console.error('Error loading demande_reservation:', error)
    throw error
  }
}

export const loadAllDemandeReservations = async (
  params?: Omit<DemandeReservationListParams, 'paginated'>,
): Promise<DemandeReservation[]> => {
  const response = await api.get('/demande_reservation', {
    params: { ...params, paginated: 0 },
  })
  const payload = response.data.data
  return Array.isArray(payload) ? (payload as DemandeReservation[]) : []
}

export const getDemandeReservation = async (
  id: number,
): Promise<DemandeReservation> => {
  const response = await api.get(`/demande_reservation/${id}`)
  return response.data.data as DemandeReservation
}

export const createDemandeReservation = async (
  payload: CreateDemandeReservationPayload,
): Promise<DemandeReservation> => {
  try {
    const response = await api.post('/demande_reservation', payload)
    return response.data.data as DemandeReservation
  } catch (error) {
    console.error('Error creating demande_reservation:', error)
    throw error
  }
}

export const editDemandeReservation = async (
  id: number,
  payload: EditDemandeReservationPayload,
): Promise<DemandeReservation> => {
  const response = await api.put(`/demande_reservation/${id}`, payload)
  return response.data.data as DemandeReservation
}

export const deleteDemandeReservation = async (id: number): Promise<void> => {
  await api.delete(`/demande_reservation/${id}`)
}
