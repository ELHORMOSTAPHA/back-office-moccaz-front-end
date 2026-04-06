/**
 * Custom React Hook for Demandes
 * Provides state management and API integration for demandes
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAllDemandes,
  getDemandeById,
  createDemande,
  updateDemande,
  updateDemandeStatus,
  deleteDemande,
  getDemandesByClient,
  getDemandeStatistics,
  type Demande,
  type CreateDemandeDTO,
  type UpdateDemandeDTO,
  type DemandeFilters,
  type DemandeStatistics,
} from '@/services/demandeService'
import type { PaginatedResponse } from '@/services/api'

/**
 * Hook for fetching all demandes
 */
export function useDemandes(filters?: DemandeFilters) {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Demande>, 'data'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDemandes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllDemandes(filters)
      setDemandes(response.data)
      const { data, ...paginationData } = response
      setPagination(paginationData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch demandes')
      console.error('Error fetching demandes:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchDemandes()
  }, [fetchDemandes])

  return {
    demandes,
    pagination,
    loading,
    error,
    refetch: fetchDemandes,
  }
}

/**
 * Hook for fetching a single demande
 */
export function useDemande(id: number | null) {
  const [demande, setDemande] = useState<Demande | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setDemande(null)
      setLoading(false)
      return
    }

    const fetchDemande = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getDemandeById(id)
        setDemande(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch demande')
        console.error('Error fetching demande:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDemande()
  }, [id])

  return { demande, loading, error }
}

/**
 * Hook for creating/updating demandes
 */
export function useDemandeActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: CreateDemandeDTO) => {
    try {
      setLoading(true)
      setError(null)
      const response = await createDemande(data)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create demande'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: number, data: UpdateDemandeDTO) => {
    try {
      setLoading(true)
      setError(null)
      const response = await updateDemande(id, data)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update demande'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: Demande['status']) => {
    try {
      setLoading(true)
      setError(null)
      const response = await updateDemandeStatus(id, status)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await deleteDemande(id)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete demande'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update,
    updateStatus,
    remove,
    loading,
    error,
  }
}

/**
 * Hook for demandes by client
 */
export function useClientDemandes(clientId: number | null, perPage?: number) {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Demande>, 'data'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) {
      setDemandes([])
      setLoading(false)
      return
    }

    const fetchClientDemandes = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getDemandesByClient(clientId, perPage)
        setDemandes(response.data)
        const { data, ...paginationData } = response
        setPagination(paginationData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client demandes')
        console.error('Error fetching client demandes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClientDemandes()
  }, [clientId, perPage])

  return { demandes, pagination, loading, error }
}

/**
 * Hook for demande statistics
 */
export function useDemandeStatistics() {
  const [statistics, setStatistics] = useState<DemandeStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getDemandeStatistics()
      setStatistics(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      console.error('Error fetching statistics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return { statistics, loading, error, refetch: fetchStatistics }
}
