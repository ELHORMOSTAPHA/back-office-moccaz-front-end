import type { Lot, LotListParams, PaginatedResponse } from '@/interface/gloable'
import api from './api'

export type CreateLotPayload = {
    numero_lot?: string | null
    numero_arrivage?: string | null
    statut?: string | null
    date_arrivage_prevu?: string | null
}

export type EditLotPayload = {
    numero_lot?: string | null
    numero_arrivage?: string | null
    statut?: string | null
    date_arrivage_prevu?: string | null
}

export const loadLots = async (params: LotListParams): Promise<PaginatedResponse<Lot>> => {
    const response = await api.get('/lot', { params })
    return response.data.data
}

export const loadAllLots = async (): Promise<Lot[]> => {
    const response = await api.get('/lot', { params: { paginated: 0 } })
    const payload = response.data.data
    return Array.isArray(payload) ? (payload as Lot[]) : []
}

export const createLot = async (payload: CreateLotPayload): Promise<Lot> => {
    const response = await api.post('/lot', payload)
    return response.data.data as Lot
}

export const editLot = async (id: number, payload: EditLotPayload): Promise<Lot> => {
    const response = await api.put(`/lot/${id}`, payload)
    return response.data.data as Lot
}
