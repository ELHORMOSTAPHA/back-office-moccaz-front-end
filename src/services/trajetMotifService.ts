import api from './api'

export interface TrajetMotif {
    id: number
    trajet_id: number
    proof_type: string
    notes: string
    file_url: string | null
    created_at?: string
    updated_at?: string
}

export const getMotifsByTrajet = async (trajetId: number): Promise<{ data: TrajetMotif[], success: boolean, message: string }> => {
    try {
        const response = await api.get<{ data: TrajetMotif[], success: boolean, message: string }>(`/trajets/${trajetId}/livraison-motif`)
        return response.data
    } catch (error) {
        console.error('Error fetching trajet motifs:', error)
        throw error
    }
}

export const createMotif = async (trajetId: number, data: FormData): Promise<{ data: TrajetMotif }> => {
    try {
        const response = await api.post<{ data: TrajetMotif }>(`/trajets/${trajetId}/livraison-motif`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error creating trajet motif:', error)
        throw error
    }
}

export const deleteMotif = async (motifId: number): Promise<any> => {
    try {
        const response = await api.post(`/trajets/livraison-motif/supprimer/${motifId}`)
        return response.data
    } catch (error) {
        console.error('Error deleting trajet motif:', error)
        throw error
    }
}

