export type DepotType = {
  id: string
  nom_depot: string
  adresse_depot: string
  ville_depot: string
  id_ville?: number
}

/** City row from `cities` when API eager-loads `ville`. */
export type ClientCityRef = {
  id: number
  name: string
}

/** Matches `App\Models\Client` / `ClientResource` (API). type: 1 particulier, 2 partenaire; status: 0 disabled, 1 active. */
export type ClientType = {
  id: number
  full_name: string
  email: string
  phone: string
  website: string | null
  /** FK to `cities.id` */
  city: number | null
  /** Present when API loads relation `ville` */
  ville?: ClientCityRef | null
  address: string | null
  type: number
  status: number
  activated?: number | null
  last_post_at?: string | null
  created_at: string
  updated_at?: string | null
}

/** Legacy shape for depot “client + depots” view modals only (not the API Client model). */
export type DepotViewClient = {
  nom: string
  prenom: string
  type_client: string
  depots: DepotType[]
}

/** Query params for GET /client (ListClientDto / IndexClientRequest). */
export interface ClientListParams {
  paginated?: 0 | 1
  per_page?: number
  page?: number
  keyword?: string
  type?: number
  status?: number
  /** Partial match on `cities.name` (replaces former city id filter). */
  city_name?: string
  from?: string
  to?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/** Filters sent with POST /clients/bulk-update-status when `select_all` is true (same semantics as list). */
export interface ClientBulkStatusFilters {
  keyword?: string
  type?: number
  status?: number
  city_name?: string
  from?: string
  to?: string
}

/** Body for POST /api/clients/bulk-update-status (BulkUpdateClientStatusRequest). */
export interface ClientBulkUpdateStatusPayload {
  status: 0 | 1
  select_all: boolean
  ids?: number[]
  excluded_ids?: number[]
  filters?: ClientBulkStatusFilters
}

export type BoutiquePackType = {
  id: number
  name: string
  description: string | null
  status: number
}

export type BoutiqueUserType = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  avatar?: string
}
/** Table `crm_vehicules_images` — `App\Models\AnnounceVehiculeImage`. `vehicule_id` → `annonces.vid`. */
export type AnnounceVehiculeImageType = {
  id: number
  vehicule_id: number
  vehicule_vin: string
  /** Relative storage path or absolute `http(s)` URL; the announces table resolves relatives against the API public origin. */
  path: string
  added_by: number
  carcutter_date_update: string | null
  carcutter: number
  position: number | null
  created_at: string
  updated_at?: string | null
}
/** Table `stores` — `BoutiqueResource`. status: 0 désactivé, 1 en attente, 2 validé, 3 rejeté */
export type BoutiqueType = {
  id: number
  user_id: number
  name: string
  address: string
  city: number
  boutique_pack?: BoutiquePackType | null
  client?: BoutiqueUserType | null
  ville?: ClientCityRef | null
  created_at: string
  created_by: number
  status: number
  pack_id: number | null
}

export interface BoutiqueListParams {
  paginated?: 0 | 1
  per_page?: number
  page?: number
  keyword?: string
  status?: number
  city_name?: string
  from?: string
  to?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface BoutiqueBulkStatusFilters {
  keyword?: string
  status?: number
  city_name?: string
  from?: string
  to?: string
}

export interface BoutiqueBulkUpdateStatusPayload {
  status: 0 | 1 | 2 | 3
  select_all: boolean
  ids?: number[]
  excluded_ids?: number[]
  filters?: BoutiqueBulkStatusFilters
}

export type MarqueType = {
  id: number
  name: string
}
export type ModeleType = {
  id: number
  name: string
}
export type FinitionType = {
  id: number
  name: string
}
/** Table `annonces` — `AnnounceResource`. status: 0 non approuvé, 1 approuvé, 4 désactivé */
export type AnnounceType = {
  id: number
  ref: string
  /** FK `annonces.user_id` — exposed as `client_id` in the API */
  client_id: number
  client?: ClientType | null
  marque?: MarqueType | null
  modele?: ModeleType | null
  finition?: FinitionType | null
  boutique?: BoutiqueType | null
  /** Vehicle photos (`crm_vehicules_images`), usually ordered by `position` when the API eager-loads them. */
  vehiculeImages?: AnnounceVehiculeImageType[]
  title: string
  description: string
  prix: number
  prix_type: string
  year: number
  city: number | null
  ville?: ClientCityRef | null
  store_id: number | null
  status: number | null
  created_at: string
  updated_at?: string | null
}

export interface AnnounceListParams {
  paginated?: 0 | 1
  per_page?: number
  page?: number
  keyword?: string
  status?: number
  city_name?: string
  from?: string
  to?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface AnnounceBulkStatusFilters {
  keyword?: string
  status?: number
  city_name?: string
  from?: string
  to?: string
}

export interface AnnounceBulkUpdateStatusPayload {
  status: 0 | 1 | 4
  select_all: boolean
  ids?: number[]
  excluded_ids?: number[]
  filters?: AnnounceBulkStatusFilters
}

export type Entreprise = {
  id: number;
  nom_entreprise: string;
  adresse_entreprise: string;
  id_ville?: number;
  ville_entreprise?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
};


export interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  permis_conduit: string;
  type_employeur: "interne" | "externe";
  created_at: string;
  updated_at: string;
  entreprise?: Entreprise;
  avatar?: string;
  status?: "inactif" | "actif" | "suspendu";
}
//export inteface basic search {per_page?: number, page: number, orderBy?: string, order?: string, search?: string, status?: string}
export interface BasicLoadData {
  per_page?: number;
  page?: number;
  orderBy?: string;
  order?: string;
  search?: string;
  status?: string;
  keyword?: string;
  active_only?: boolean;
  type_proprietaire?: string;
  paginated?: boolean;
}

/** Query params for GET /stocks (ListStockDto / IndexStockRequest). */
export interface StockListParams {
  /** Omit for default (paginated). Use 1/0 in query strings — Laravel rejects "true"/"false". */
  paginated?: 0 | 1;
  per_page?: number;
  page?: number;
  name?: string;
  from?: string;
  to?: string;
  marque?: string;
  modele?: string;
  vin?: string;
  /** Use 0 | 1 for GET queries — axios sends booleans as "true"/"false", which fail Laravel `boolean` rules. */
  reserved?: 0 | 1;
  depot_id?: number;
  lot_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
    has_more_pages: boolean
  }
}
export type TypeVehicule = {
  id: number;
  libelle_type_vehicule: string;
};

export interface Vehicule {
  id: number;
  tonnage: number;
  immatriculation: string;
  numero_vehicule: string;
  capacite_charge: number;
  type_proprietaire: string;
  type_vehicule?: TypeVehicule;
  entreprise?: Entreprise;
  statut: string;
  created_at: string;
  updated_at: string;
}
export interface Profile  {
  id: number;
  nom: string;
  libelle: string;
  statut: string;
  created_at: string;
  updated_at: string;
};

export interface User {
  id: number;
  nom: string;
  avatar?: string;
  prenom: string;
  email: string;
  telephone: string;
  id_profile?: number;
  profile?: Profile;
  statut: string;
  created_at: string;
  updated_at: string;
  _original?: User;
}
/** Query params for GET /depot (ListDepotDto / IndexDepotRequest). */
export interface DepotListParams {
  paginated?: 0 | 1;
  per_page?: number;
  page?: number;
  name?: string;
  type?: string;
  from?: string;
  to?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  deleted_by?: number;
  deleted_at?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface Depot {
  id: number;
  name: string | null;
  type: string | null;
  created_by: string | number | null;
  created_at: string;
  updated_at: string;
  deleted_by?: number | null;
  deleted_at?: string | null;
}
/** Query params for GET /lot (ListLotDto / IndexLotRequest). */
export interface LotListParams {
  paginated?: 0 | 1;
  per_page?: number;
  page?: number;
  numero_lot?: string;
  numero_arrivage?: string;
  statut?: string;
  from?: string;
  to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface Lot {
  id: number;
  numero_lot: string | null;
  numero_arrivage: string | null;
  statut: string | null;
  date_arrivage_prevu: string | null;
  created_by: string | number | null;
  updated_by: number | null;
  deleted_by?: number | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Stock {
  id: number;
  modele: string | null;
  version: string | null;
  marque: string | null;
  vin: string | null;
  expose: number;
  color_ex: string | null;
  color_ex_code: string | null;
  color_int: string | null;
  color_int_code: string | null;
  reserved: boolean | null;
  depot_id: number | null;
  lot_id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  depot: Depot;
  lot: Lot;
}

/** Query params for GET /historique (ListHistoriqueDto / IndexHistoriqueRequest). */
export interface HistoriqueListParams {
  paginated?: 0 | 1;
  per_page?: number;
  page?: number;
  user_id?: string;
  action?: string;
  table_name?: string;
  record_id?: number;
  keyword?: string;
  from?: string;
  to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/** Row from `historiques` (audit log). */
export interface Historique {
  id: number;
  user_id: string | null;
  action: string | null;
  table_name: string | null;
  record_id: number | null;
  old_value: string | null;
  new_value: string | null;
  created_by: number | null;
  created_at: string | null;
  deleted_at?: string | null;
  deleted_by?: number | null;
}

/** Query params for GET /demande_reservation (IndexDemandeReservationRequest). */
export interface DemandeReservationListParams {
  paginated?: 0 | 1;
  per_page?: number;
  page?: number;
  stock_id?: number;
  statut?: string;
  id_demande?: string;
  nom_commercial?: string;
  keyword?: string;
  from?: string;
  to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/** Row from `demandes_reservations`; `stock` is present when the API eager-loads it. */
export interface DemandeReservation {
  id: number;
  stock_id: number;
  id_demande: string | null;
  nom_commercial: string | null;
  id_commercial: number | null;
  demande_infos: string | null;
  statut: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: number | null;
  stock?: Stock;
}