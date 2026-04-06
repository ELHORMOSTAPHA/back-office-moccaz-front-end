import type { PaginatedResponse, User } from '@/interface/gloable'
import api from './api'

type UtilisateurListParams = Record<string, unknown>

function emptyPagination(): PaginatedResponse<User>['pagination'] {
  return {
    current_page: 1,
    last_page: 1,
    per_page: 0,
    total: 0,
    from: 0,
    to: 0,
    has_more_pages: false,
  }
}

function unwrapUserListPayload(body: unknown): PaginatedResponse<User> {
  const inner = (body as { data?: unknown })?.data
  if (Array.isArray(inner)) {
    return {
      data: inner as User[],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: inner.length,
        total: inner.length,
        from: inner.length ? 1 : 0,
        to: inner.length,
        has_more_pages: false,
      },
    }
  }
  const payload = inner as { data?: User[]; pagination?: PaginatedResponse<User>['pagination'] }
  return {
    data: payload?.data ?? [],
    pagination: payload?.pagination ?? emptyPagination(),
  }
}

export const loadutilisateurs = async (params: UtilisateurListParams): Promise<PaginatedResponse<User>> => {
  const response = await api.get('/utilisateur', { params })
  return unwrapUserListPayload(response.data)
}

export const addutilisateur = async (userData: Partial<User> & Record<string, unknown>) => {
  const response = await api.post('/utilisateur', userData)
  return (response.data as { data?: User })?.data
}

export const updateutilisateur = async (userId: string | number, userData: Record<string, unknown>) => {
  const response = await api.put(`/utilisateur/${userId}`, userData)
  return (response.data as { data?: User })?.data
}

export const updateUsersBulkStatus = async (payload: {
  select_all?: boolean
  excluded_ids?: (string | number)[]
  ids?: (string | number)[]
  filters?: {
    keyword?: string
    id_profile?: number
    statut?: string
    from?: string
    to?: string
  }
  statut: string
}) => {
  const response = await api.post('/utilisateur/bulk-update-status', {
    ...payload,
    ids: payload.ids?.map((id) => Number(id)),
    excluded_ids: payload.excluded_ids?.map((id) => Number(id)),
  })
  return response.data
}
