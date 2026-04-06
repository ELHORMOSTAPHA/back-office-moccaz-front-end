import type { PaginatedResponse, Stock, StockListParams } from "@/interface/gloable";
import api from "./api";

/**
 * Body for PUT /stock/{id} (UpdateStockRequest).
 * Color codes are typically `#rrggbb` from the modal nuancier or manual hex field.
 */
export type EditStockPayload = {
    modele?: string | null
    version?: string | null
    marque?: string | null
    vin?: string | null
    color_ex?: string | null
    color_ex_code?: string | null
    color_int?: string | null
    color_int_code?: string | null
    reserved?: boolean
    depot_id?: number | null
    lot_id?: number
}

export type CreateStockPayload = {
    modele: string
    version: string
    marque: string
    vin?: string | null
    color_ex?: string | null
    color_ex_code?: string | null
    color_int?: string | null
    color_int_code?: string | null
    reserved?: boolean
    depot_id?: number | null
    lot_id: number
}

export const loadStock = async (loaddata: StockListParams): Promise<PaginatedResponse<Stock>> => {
    try {
        const response = await api.get('/stock', { params: loaddata });
        return response.data.data;
    } catch (error) {
        console.error('Error loading stock:', error);
        throw error;
    }
}

/** Plain list for selects — `paginated: 0` (Laravel boolean). */
export const loadAllStocks = async (): Promise<Stock[]> => {
    const response = await api.get('/stock', { params: { paginated: 0 } })
    const payload = response.data.data
    return Array.isArray(payload) ? (payload as Stock[]) : []
}

export const editStock = async (id: number, payload: EditStockPayload): Promise<Stock> => {
    const response = await api.put(`/stock/${id}`, payload);
    return response.data.data as Stock;
}

export const createStock = async (payload: CreateStockPayload): Promise<Stock> => {
    try {
        const response = await api.post('/stock', payload);
        return response.data.data as Stock;
    } catch (error) {
        console.error('Error creating stock:', error);
        throw error;
    }
}