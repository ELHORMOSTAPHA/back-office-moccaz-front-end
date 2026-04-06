import type { BasicLoadData, Chauffeur, PaginatedResponse } from "@/interface/gloable";
import api from "./api";
//chaffeur service functions
//load chaffeurs function with pagination, sorting, filtering, search
export const loadChaffeurs = async (loaddata: BasicLoadData): Promise<PaginatedResponse<Chauffeur>> => {
    const response = await api.get('/chauffeurs', {params: loaddata});
    console.log('Chaffeurs loaded');
    return response.data;
}
//add chauffeur function
// mini documentation
// body parameters for adding a chauffeur:
// ```json
// {
//   "prenom": "string",
//   "nom": "string",
//   "email": "string (email format)",
//   "telephone": "string (optional)",
//   "type_employeur": "string",
//   "permis_conduit": "string",
//   "id_entreprise": "integer (optional)"
// }
// ```

// ---

// ## Field Requirements

// | Field | Type | Required | Description | Notes |
// |-------|------|----------|-------------|-------|
// | `prenom` | String | Yes | First name | Max 255 characters |
// | `nom` | String | Yes | Last name | Max 255 characters |
// | `email` | String | Yes | Email address | Must be unique in the system. Email format validation. Max 255 characters |
// | `telephone` | String | No | Phone number | Max 20 characters |
// | `type_employeur` | String | Yes | Employment type | Must be specified: e.g., "interne" (internal) or "externe" (external) |
// | `permis_conduit` | String | Yes | Driver's license | License information/number |
// | `id_entreprise` | Integer | No | Company ID | Only required if `type_employeur` is "externe". Must reference existing company in database |

//documentation to add a chauffeur
// body example:
// {
//   "prenom": "Jean",
//   "nom": "Dupont",
//   "email": "jean.dupont@example.com",
//   "telephone": "+33612345678",
//   "type_employeur": "interne",
//   "permis_conduit": "FR123456789",
//   "id_entreprise": null
// }
// id_entreprise is null because type_employeur is interne
// if type_employeur were externe, id_entreprise would be the integer ID of the company
export const addChauffeur = async (chauffeurData: any) => {
    console.log('Adding chauffeur:', chauffeurData);  
    const response = await api.post('/chauffeurs', chauffeurData, {
        headers: {
            'Content-Type': chauffeurData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    });
    console.log('Chauffeur added successfully:', response.data); 
    return response.data;
}
//documentation for updateChauffeur function
//update chauffeur function
export const updateChauffeur = async (chauffeurId: string | number, chauffeurData: any) => {
    console.log('Updating chauffeur:', chauffeurId, chauffeurData);  
    const response = await api.put(`/chauffeurs/${chauffeurId}`, chauffeurData, {
        headers: {
            'Content-Type': chauffeurData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    });
    console.log('Chauffeur updated successfully:', response.data); 
    return response.data;
}

// Bulk update status for selected chauffeurs
export const updateChauffeursBulkStatus = async (payload: {
    select_all?: boolean;
    excluded_ids?: (string | number)[];
    ids?: (string | number)[];
    filters?: {
        keyword?: string;
        status?: string;
        type_employeur?: string;
    };
    statut: string;
}) => {
    try {
        console.log('Updating bulk chauffeur statut:', payload);
        const response = await api.post('/chauffeurs/bulk-update-status', payload);
        console.log('Bulk status update successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating bulk chauffeur statut:', error);
        throw error;
    }
}