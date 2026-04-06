import type {
  Historique,
  HistoriqueListParams,
  PaginatedResponse,
} from '@/interface/gloable'
import api from './api'

/** Body for POST /historique (StoreHistoriqueRequest). */
export type CreateHistoriquePayload = {
  user_id?: string | null
  action?: string | null
  table_name?: string | null
  record_id?: number | null
  old_value?: string | null
  new_value?: string | null
}

/** Body for PUT /historique/{id} (UpdateHistoriqueRequest). */
export type EditHistoriquePayload = {
  user_id?: string | null
  action?: string | null
  table_name?: string | null
  record_id?: number | null
  old_value?: string | null
  new_value?: string | null
}

export const loadHistorique = async (
  params: HistoriqueListParams,
): Promise<PaginatedResponse<Historique>> => {
  try {
    const response = await api.get('/historique', { params })
    return response.data.data
  } catch (error) {
    console.error('Error loading historique:', error)
    throw error
  }
}

/** Plain list — `paginated: 0` matches Laravel boolean handling (see StockListParams). */
export const loadAllHistorique = async (
  params?: Omit<HistoriqueListParams, 'paginated'>,
): Promise<Historique[]> => {
  const response = await api.get('/historique', {
    params: { ...params, paginated: 0 },
  })
  const payload = response.data.data
  return Array.isArray(payload) ? (payload as Historique[]) : []
}

export const getHistorique = async (id: number): Promise<Historique> => {
  const response = await api.get(`/historique/${id}`)
  return response.data.data as Historique
}

export const createHistorique = async (
  payload: CreateHistoriquePayload,
): Promise<Historique> => {
  try {
    const response = await api.post('/historique', payload)
    return response.data.data as Historique
  } catch (error) {
    console.error('Error creating historique:', error)
    throw error
  }
}

export const editHistorique = async (
  id: number,
  payload: EditHistoriquePayload,
): Promise<Historique> => {
  const response = await api.put(`/historique/${id}`, payload)
  return response.data.data as Historique
}

export const deleteHistorique = async (id: number): Promise<void> => {
  await api.delete(`/historique/${id}`)
}
