import type { PaginatedResponse, Profile } from '@/interface/gloable'
import api from './api'

type ProfileListParams = Record<string, unknown>

function emptyPagination(): PaginatedResponse<Profile>['pagination'] {
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

function unwrapProfileListPayload(body: unknown): PaginatedResponse<Profile> {
  const inner = (body as { data?: unknown })?.data
  if (Array.isArray(inner)) {
    return {
      data: inner as Profile[],
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
  const payload = inner as { data?: Profile[]; pagination?: PaginatedResponse<Profile>['pagination'] }
  return {
    data: payload?.data ?? [],
    pagination: payload?.pagination ?? emptyPagination(),
  }
}

export const loadprofiles = async (params: ProfileListParams): Promise<PaginatedResponse<Profile>> => {
  const response = await api.get('/profile', { params })
  return unwrapProfileListPayload(response.data)
}

export const addProfile = async (profileData: Partial<Profile>) => {
  const response = await api.post('/profile', profileData)
  return (response.data as { data?: Profile })?.data
}

export const updateProfile = async (id: string | number, profileData: Partial<Profile>) => {
  const response = await api.put(`/profile/${id}`, profileData)
  return (response.data as { data?: Profile })?.data
}

export const updateProfilesBulkStatus = async (payload: {
  select_all?: boolean
  excluded_ids?: (string | number)[]
  ids?: (string | number)[]
  filters?: {
    keyword?: string
    statut?: string
    from?: string
    to?: string
  }
  statut: string
}) => {
  const response = await api.post('/profile/bulk-update-status', {
    ...payload,
    ids: payload.ids?.map((id) => Number(id)),
    excluded_ids: payload.excluded_ids?.map((id) => Number(id)),
  })
  return response.data
}
