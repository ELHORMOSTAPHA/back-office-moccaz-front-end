import api from './api'

// Type definitions for API responses
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    links: Array<{
      url: string | null
      label: string
      page: number | null
      active: boolean
    }>
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

// Trajet Type Definition
export interface Trajet {
  id: number
  type_voyage: 'Transport' | 'Messagerie'
  chauffeur: {
    id: number
    nom: string
    prenom: string
    telephone: string
    email: string
  } | null
  vehicule: {
    id: number
    immatriculation: string
    marque: string
    modele: string
    type_vehicule: string | null
    tonnage: number | null
  } | null
  date_depart: string
  date_depart_formatted: string
  date_arrivee: string
  date_arrivee_formatted: string
  date_reelle_arrivee: string | null
  date_reelle_arrivee_formatted: string | null
  ville_depart: {
    id: number
    nom: string
  } | null
  ville_arrivee: {
    id: number
    nom: string
  } | null
  status: 'À planifier' | 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
  client: {
    id: number
    nom: string
    prenom: string
    raison_sociale: string
    email: string
    telephone: string
  } | null
  depot: {
    id: number
    nom_depot: string
    adresse: string
  } | null
  depot_depart: {
    id: number
    nom_depot: string
    adresse_depot: string
    ville_depot: string
  } | null
  depot_arrivee: {
    id: number
    nom_depot: string
    adresse_depot: string
    ville_depot: string
  } | null
  demande: {
    id: number
    type_demande: string
    status: string
    manutention?: boolean
    retour?: boolean
  } | null
  nombre_colies: number | null
  tailles_colies: string | null
  manutention: boolean
  retour: boolean
  heure_livraison: string | null
  nombre_cartons: number | null
  notes: string | null
  distance_km: string | null
  parent: number | null
  created_at: string
  updated_at: string
}

// DTO for creating a trajet
export interface CreateTrajetDTO {
  type_voyage: 'Transport' | 'Messagerie'
  id_chauffeur?: number
  id_vehicule?: number
  date_depart: string
  date_arrivee: string
  id_ville_depart: number
  id_ville_arrivee: number
  id_depot_depart?: number
  id_depot_arrivee?: number
  status?: 'À planifier' | 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
  date_reelle_arrivee?: string
  id_client?: number
  id_depot?: number
  id_demande?: number
  nombre_colies?: number
  tailles_colies?: string
  manutention?: boolean
  retour?: boolean
  heure_livraison?: string
  notes?: string
  distance_km?: number
}

// DTO for updating a trajet
export interface UpdateTrajetDTO {
  type_voyage?: 'Transport' | 'Messagerie'
  id_chauffeur?: number
  id_vehicule?: number
  date_depart?: string
  date_arrivee?: string
  id_ville_depart?: number
  id_ville_arrivee?: number
  status?: 'À planifier' | 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
  date_reelle_arrivee?: string
  id_client?: number
  id_depot?: number
  id_demande?: number
  parent?: number | null
  nombre_colies?: number
  tailles_colies?: string
  manutention?: boolean
  retour?: boolean
  heure_livraison?: string
  notes?: string
  distance_km?: number
}

// Filter interface
export interface TrajetFilters {
  status?: string
  type_voyage?: string
  id_chauffeur?: number
  id_vehicule?: number
  id_demande?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

// Statistics interface
export interface TrajetStatistics {
  total: number
  en_attente: number
  en_cours: number
  en_transit: number
  arrives: number
  termines: number
  annules: number
  retardes: number
}

/**
 * Get all trajets with optional filters
 */
export const getAllTrajets = async (
  filters?: TrajetFilters
): Promise<PaginatedResponse<Trajet>> => {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = `/trajets${queryString ? `?${queryString}` : ''}`

  const response = await api.get(endpoint)
  return response.data
}

/**
 * Get a single trajet by ID
 */
export const getTrajetById = async (id: number): Promise<ApiResponse<Trajet>> => {
  const response = await api.get(`/trajets/${id}`)
  return response.data
}

/**
 * Create a new trajet
 */
export const createTrajet = async (data: CreateTrajetDTO): Promise<ApiResponse<Trajet>> => {
  const response = await api.post('/trajets', data)
  return response.data
}

/**
 * Update an existing trajet
 */
export const updateTrajet = async (
  id: number,
  data: UpdateTrajetDTO
): Promise<ApiResponse<Trajet>> => {
  const response = await api.put(`/trajets/${id}`, data)
  return response.data
}

/**
 * Update trajet status only
 */
export const updateTrajetStatus = async (
  id: number,
  status: Trajet['status']
): Promise<ApiResponse<Trajet>> => {
  const response = await api.patch(`/trajets/${id}/status`, {
    status,
  })
  return response.data
}

/**
 * Delete a trajet
 */
export const deleteTrajet = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/trajets/${id}`)
  return response.data
}

/**
 * Get trajets by demande ID
 */
export const getTrajetsByDemande = async (demandeId: number): Promise<{ data: Trajet[] }> => {
  const response = await api.get(`/trajets/demande/${demandeId}`)
  return response.data
}

/**
 * Get trajets by mission ID
 */
export const getTrajetsByMission = async (missionId: number): Promise<{ data: Trajet[] }> => {
  const response = await api.get(`/trajets/mission/${missionId}`)
  return response.data
}

/**
 * Get trajets by chauffeur ID
 */
export const getTrajetsByChauffeur = async (
  chauffeurId: number,
  filters?: Pick<TrajetFilters, 'status' | 'date_from'>
): Promise<{ data: Trajet[] }> => {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = `/trajets/chauffeur/${chauffeurId}${queryString ? `?${queryString}` : ''}`

  const response = await api.get(endpoint)
  return response.data
}

/**
 * Get trajets by vehicule ID
 */
export const getTrajetsByVehicule = async (
  vehiculeId: number,
  filters?: Pick<TrajetFilters, 'status' | 'type_voyage' | 'date_from' | 'date_to'>
): Promise<{ success: boolean; data: Trajet[]; meta: any }> => {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = `/trajets/vehicule/${vehiculeId}${queryString ? `?${queryString}` : ''}`

  const response = await api.get(endpoint)
  return response.data
}

/**
 * Get Messagerie trajets that have a specific demande as parent
 */
export const getTrajetsByParentDemande = async (parentDemandeId: number): Promise<{ data: Trajet[] }> => {
  const response = await api.get(`/trajets/parent/${parentDemandeId}`)
  return response.data
}

/**
 * Get trajet statistics
 */
export const getTrajetStatistics = async (): Promise<{ data: TrajetStatistics }> => {
  const response = await api.get('/trajets/statistics')
  return response.data
}
