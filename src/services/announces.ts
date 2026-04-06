import type {
    AnnounceBulkUpdateStatusPayload,
    AnnounceListParams,
    AnnounceType,
    PaginatedResponse,
} from '@/interface/gloable'
import api from './api'

export type UpdateAnnouncePayload = {
    ref?: string
    title?: string
    description?: string | null
    prix?: number
    prix_type?: string
    city?: number | null
    store_id?: number | null
    status?: number
    year?: number
    user_id?: number
}

export const loadAnnounces = async (params: AnnounceListParams): Promise<PaginatedResponse<AnnounceType>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<AnnounceType> }>('/announce', {
        params,
    })
    return response.data.data
}

export const updateAnnounce = async (
    id: string | number,
    payload: UpdateAnnouncePayload,
): Promise<AnnounceType> => {
    const response = await api.put<{ success: boolean; data: AnnounceType }>(`/announce/${id}`, payload)
    return response.data.data
}

export const bulkUpdateAnnounceStatus = async (
    payload: AnnounceBulkUpdateStatusPayload,
): Promise<{ updated: number }> => {
    const response = await api.post<{ success: boolean; data: { updated: number } }>(
        '/announces/bulk-update-status',
        payload,
    )
    return response.data.data
}
