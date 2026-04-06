import type { Depot, DepotListParams, PaginatedResponse } from '@/interface/gloable'
import api from './api'

export type CreateDepotPayload = {
    name?: string | null
    type?: string | null
}

export type EditDepotPayload = {
    name?: string | null
    type?: string | null
}

export const loadDepots = async (params: DepotListParams): Promise<PaginatedResponse<Depot>> => {
    const response = await api.get('/depot', { params })
    return response.data.data
}

/** All depots for selects — `paginated: 0` (Laravel boolean). */
export const loadAllDepots = async (): Promise<Depot[]> => {
    const response = await api.get('/depot', { params: { paginated: 0 } })
    const payload = response.data.data
    return Array.isArray(payload) ? (payload as Depot[]) : []
}

export const createDepot = async (payload: CreateDepotPayload): Promise<Depot> => {
    const response = await api.post('/depot', payload)
    return response.data.data as Depot
}

export const editDepot = async (id: number, payload: EditDepotPayload): Promise<Depot> => {
    const response = await api.put(`/depot/${id}`, payload)
    return response.data.data as Depot
}
