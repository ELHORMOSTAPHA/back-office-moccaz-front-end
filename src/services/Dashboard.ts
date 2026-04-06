import api from "./api";

export interface DashboardStatistics {
    active_drivers: number
    active_vehicles: number
    active_clients: number
    total_users: number
    total_missions: number
    total_demandes: number
}
export interface ResponseApi<T> {
    data: T;
    message: string;
    status: string;
}
export const loadDashboardData = async (): Promise<DashboardStatistics> => {
    try {
        console.log('Loading dashboard statistics');   
        const response = await api.get('/dashboard'); 
        console.log('Dashboard statistics loaded:', response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        throw error;
    }   
}