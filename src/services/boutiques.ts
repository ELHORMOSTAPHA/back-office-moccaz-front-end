import type {
    BoutiqueBulkUpdateStatusPayload,
    BoutiqueListParams,
    BoutiqueType,
    PaginatedResponse,
} from '@/interface/gloable'
import api from './api'

export type UpdateBoutiquePayload = {
    user_id?: number
    name?: string
    address?: string
    city?: number
    created_by?: number
    pack_id?: number
    status?: number
}

export const loadBoutiques = async (params: BoutiqueListParams): Promise<PaginatedResponse<BoutiqueType>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<BoutiqueType> }>('/boutique', {
        params,
    })
    return response.data.data
}

export const updateBoutique = async (
    id: string | number,
    payload: UpdateBoutiquePayload,
): Promise<BoutiqueType> => {
    const response = await api.put<{ success: boolean; data: BoutiqueType }>(`/boutique/${id}`, payload)
    return response.data.data
}

export const bulkUpdateBoutiqueStatus = async (
    payload: BoutiqueBulkUpdateStatusPayload,
): Promise<{ updated: number }> => {
    const response = await api.post<{ success: boolean; data: { updated: number } }>(
        '/boutiques/bulk-update-status',
        payload,
    )
    return response.data.data
}
