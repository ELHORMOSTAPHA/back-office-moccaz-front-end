import type { BasicLoadData, PaginatedResponse, Vehicule } from "@/interface/gloable";
import api from "./api";
//load vehicules function with pagination, sorting, filtering, search
export const loadvehicules = async (loaddata:BasicLoadData): Promise<PaginatedResponse<Vehicule>> => {
    const response = await api.get('/vehicules', {params: loaddata});
    console.log('Vehicules loaded');
    return response.data;
}
//add vehicule function
//exemple body to send
/*
{
  "tonnage": 5.5,
  "immatriculation": "AB-123-CD",
  "capacite_charge": 2500,
  "id_type_vehicule": 1,
  "type_proprietaire": "interne",
  "id_entreprise": null
}
  all fields are required
  if type_proprietaire is "externe", id_entreprise is required
 */
export const addVehicule = async (vehiculeData: Vehicule) => {
    const response = await api.post('/vehicules', vehiculeData);
    console.log('Vehicule added');
    return response.data;
}   
export const updateVehicule = async (id: string | number, vehiculeData: any) => {
    const response = await api.put(`/vehicules/${id}`, vehiculeData);
    console.log('Vehicule updated');
    return response.data;
}

export const updateVehiculesBulkStatus = async (payload: any) => {
    const response = await api.post('/vehicules/bulk-update-status', payload);
    console.log('Vehicules bulk status updated');
    return response.data;
}
//load tonnages
export const loadTonnages = async (payload: {id_type_vehicule?: number}): Promise<number[]> => {
    const response = await api.get('/vehicules/tonnages', { params: payload });
    console.log('Tonnages loaded');
    return response.data.data || response.data;
}
