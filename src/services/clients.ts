import type {
    ClientBulkUpdateStatusPayload,
    ClientListParams,
    ClientType,
    PaginatedResponse,
} from '@/interface/gloable'
import api from './api'

export type CreateClientPayload = {
    full_name: string
    email: string
    phone: string
    website: string
    city: number
    address: string
    password: string
    type?: number
    status?: number
    activated?: number | null
    last_post_at?: string | null
}

export type UpdateClientPayload = {
    full_name?: string
    email?: string
    phone?: string
    website?: string
    city?: number
    address?: string
    password?: string
    type?: number
    status?: number
    activated?: number | null
    last_post_at?: string | null
}

export const loadClients = async (params: ClientListParams): Promise<PaginatedResponse<ClientType>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<ClientType> }>('/client', {
        params,
    })
    return response.data.data
}

export const loadClientById = async (clientId: string | number): Promise<ClientType> => {
    const response = await api.get<{ success: boolean; data: ClientType }>(`/client/${clientId}`)
    return response.data.data
}

export const addClient = async (payload: CreateClientPayload): Promise<ClientType> => {
    const response = await api.post<{ success: boolean; data: ClientType }>('/client', payload)
    return response.data.data
}

export const updateClient = async (
    clientId: string | number,
    payload: UpdateClientPayload,
): Promise<ClientType> => {
    const response = await api.put<{ success: boolean; data: ClientType }>(`/client/${clientId}`, payload)
    return response.data.data
}

export const deleteClient = async (clientId: string | number): Promise<void> => {
    await api.delete(`/client/${clientId}`)
}

/** POST /api/clients/bulk-update-status — see `routes/api.php`. */
export const bulkUpdateClientStatus = async (
    payload: ClientBulkUpdateStatusPayload,
): Promise<{ updated: number }> => {
    const response = await api.post<{ success: boolean; data: { updated: number } }>(
        '/clients/bulk-update-status',
        payload,
    )
    return response.data.data
}
