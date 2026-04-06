// export interface Client {
//     prenom: string,
//     nom: string,
//     raison_sociale: string,
//     email: string,
//     telephone: string,
//     id_user: number,
//     type_client: string,
//     depots: Array<{
//         nom_depot: string,
//         adresse_depot: string,
//         ville_depot: string,
//     }>
// }
export type ClientType = {
  id: string
  nom: string
  prenom: string
  email: string
  raisonSociale: string
  typeClient: 'Particulier' | 'Société'
  tel: string
  created_at: string
  status: 'Actif' | 'Inactif' | 'Suspendu' | 'En attente'
  depots: string[]
  image?: string
}