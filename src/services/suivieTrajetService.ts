import api from "./api"

export interface SuivieTrajet {
    id: number
    trajet_id: number
    debut_charge: string | null
    fin_charge: string | null
    debut_livraison: string | null
    debut_decharge: string | null
    fin_decharge: string | null
    fin_livraison: string | null
    manutention_chargement: boolean
    manutention_dechargement: boolean
    retour_livraison: number
    created_at?: string
    updated_at?: string
}

export const getSuivieTrajetByTrajet = async (trajetId: number): Promise<{ data: SuivieTrajet }> => {
    try {
        const response = await api.get(`/suivie-trajets/${trajetId}`)
        return response.data
    } catch (error) {
        console.error('Error fetching suivie trajet:', error)
        throw error
    }
}

export const getAllSuivieTrajets = async (perPage: number = 15): Promise<{ data: SuivieTrajet[] }> => {
    try {
        const response = await api.get('/suivie-trajets', {
            params: { per_page: perPage }
        })
        return response.data
    } catch (error) {
        console.error('Error fetching suivie trajets:', error)
        throw error
    }
}

export const createSuivieTrajet = async (trajetId: number): Promise<{ data: SuivieTrajet }> => {
    try {
        const response = await api.post(`/suivie-trajets/${trajetId}`)
        return response.data
    } catch (error) {
        console.error('Error creating suivie trajet:', error)
        throw error
    }
}
