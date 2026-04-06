import apiService from './api'

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  raison_sociale?: string
  id_profile: number
  statut: string
  profile?: {
    id: number
    type_profile: string
    nom:string
  }
  client?: {
    id: number
    prenom: string
    nom: string
    raison_sociale: string
    email: string
    telephone: string
    id_user: number

    type_client: string
  }
  chauffeur?: any
}

export interface UserDetailsResponse {
  success: boolean
  user: {
    id: number
    prenom?: string
    nom?: string
    email: string
    telephone?: string
    raison_sociale?: string
    type_client?: string
    email_verified_at?: string | null
    created_at: string
    profile_id: number
    profile?: {
      id: number
      type_profile: string
    }
    client?: any
    chauffeur?: any
  }
}

export const getUserDetails = async (): Promise<User> => {
  const response = await apiService.get('/auth/user')
  const data = response.data as UserDetailsResponse

  const backendUser = data.user

  // Now the backend returns prenom and nom directly from client/chauffeur/user table
  const prenom = backendUser.prenom || 'User'
  const nom = backendUser.nom || ''

  return {
    id: backendUser.id,
    nom: nom,
    prenom: prenom,
    email: backendUser.email,
    telephone: backendUser.telephone || '',
    raison_sociale: backendUser.raison_sociale || '',
    id_profile: backendUser.profile_id,
    statut: 'active',
    profile: backendUser.profile ? {
      id: backendUser.profile.id,
      type_profile: backendUser.profile.type_profile,
      nom: backendUser.nom || ''
    } : {
      id: backendUser.profile_id,
      nom: backendUser.nom || '',
      type_profile: backendUser.profile_id === 1 ? 'admin' : backendUser.profile_id === 2 ? 'client' : 'chauffeur'
    },
    client: backendUser.client,
    chauffeur: backendUser.chauffeur
  }
}

export const updateUser = async (userId: number, userData: Partial<User>): Promise<User | undefined> => {
  const response = await apiService.put(`/utilisateur/${userId}`, userData)
  return (response.data as { data?: User })?.data
}