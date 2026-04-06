import type { BasicLoadData, Entreprise, PaginatedResponse } from "@/interface/gloable";
import api from "./api";

//load entreprises function with pagination, sorting, filtering, search
export const LoadEntreprises = async (loaddata:BasicLoadData): Promise<PaginatedResponse<Entreprise>> => {
    const response = await api.get('/entreprises', {params: loaddata});
    console.log('Entreprises loaded');
    return response.data;
}

//add entreprise function
export const addEntreprise = async (entrepriseData: any) => {
    console.log('Adding entreprise');
    const response = await api.post('/entreprises', entrepriseData);
    console.log('Entreprise added successfully:', response.data);
    return response.data;
}

//update entreprise function
export const updateEntreprise = async (id: number | string, entrepriseData: any) => {
    console.log('Updating entreprise:', id);
    const response = await api.post(`/entreprises/${id}`, entrepriseData);
    console.log('Entreprise updated successfully:', response.data);
    return response.data;
}

