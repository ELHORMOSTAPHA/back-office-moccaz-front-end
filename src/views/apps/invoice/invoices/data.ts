import user10 from '@/assets/images/users/user-10.jpg'
import user2 from '@/assets/images/users/user-2.jpg'
import user3 from '@/assets/images/users/user-3.jpg'
import user4 from '@/assets/images/users/user-4.jpg'
import user7 from '@/assets/images/users/user-7.jpg'
import user8 from '@/assets/images/users/user-8.jpg'
import user9 from '@/assets/images/users/user-9.jpg'

export type InvoiceType = {
  id: string
  date: string
  name: string
  image?: string
  email: string
  purchase: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
}

export type DemandeType = {
  id: string
  client: string
  image?: string
  email: string
  typeDemande: 'Transport' | 'Messagerie'
  nombreColies: number
  taillesColies: string
  nombreTonne: number
  dateEnlevement: string
  Manutention: boolean
  retour: boolean
  status: 'À planifier' | 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
}

export type VoyageType = {
  id: string
  typeVoyage: 'Transport' | 'Messagerie'
  chauffeur: string
  chauffeurImage?: string
  vehicule: string
  dateDepart: string
  dateArrivee: string
  depart: string
  arrivee: string
  status: 'En attente' | 'En cours' | 'En transit' | 'Arrivé' | 'Terminé' | 'Annulé' | 'Retardé'
  dateReelle?: string | null
  client?: string
  depot?: string
}

export type ClientType = {
  id: string
  nom: string
  prenom: string
  email: string
  raisonSociale: string
  typeClient: 'Particulier' | 'Société'
  tel: string
  dateInscription: string
  status: 'Actif' | 'Inactif' | 'Suspendu' | 'En attente'
  depots: string[]
  image?: string
}

// Depot list
export const depots = [
    { id: 'DEP-001', nom: 'Dépôt Casablanca Centre', ville: 'Casablanca' },
    { id: 'DEP-002', nom: 'Dépôt Rabat', ville: 'Rabat' },
    { id: 'DEP-003', nom: 'Dépôt Tanger', ville: 'Tanger' },
    { id: 'DEP-004', nom: 'Dépôt Marrakech', ville: 'Marrakech' },
    { id: 'DEP-005', nom: 'Dépôt Fès', ville: 'Fès' },
    { id: 'DEP-006', nom: 'Dépôt Agadir', ville: 'Agadir' },
]

export const invoices: InvoiceType[] = [
  {
    id: 'INS-0120010',
    date: 'Feb 2 - Feb 10, 2025',
    name: 'Emily Parker',
    image: user7,
    email: 'emily@startupwave.io',
    purchase: 'EUROFAT - Extended License',
    amount: 999,
    status: 'paid',
  },
  {
    id: 'INS-0120009',
    date: 'Feb 5 - Feb 12, 2025',
    name: 'Michael Scott',
    email: 'michael@dundermifflin.com',
    purchase: 'CRM Dashboard - Regular License',
    amount: 249,
    status: 'pending',
  },
  {
    id: 'INS-0120008',
    date: 'Jan 10 - Jan 15, 2025',
    name: 'Samantha Reed',
    image: user3,
    email: 'samantha@alphatech.com',
    purchase: 'Landing Page - Agency Pack',
    amount: 349,
    status: 'overdue',
  },
  {
    id: 'INS-0120007',
    date: 'Mar 1 - Mar 5, 2025',
    name: 'Jonathan Lee',
    image: user2,
    email: 'jonathan@zenflow.io',
    purchase: 'Task Manager - SaaS Version',
    amount: 799,
    status: 'draft',
  },
  {
    id: 'INS-0120006',
    date: 'Mar 10 - Mar 15, 2025',
    name: 'Carlos Diaz',
    email: 'carlos@themeverse.com',
    purchase: 'Admin Panel - Developer License',
    amount: 199,
    status: 'paid',
  },
  {
    id: 'INS-0120005',
    date: 'Mar 20 - Mar 25, 2025',
    name: 'Lisa Brown',
    image: user4,
    email: 'lisa@digitize.io',
    purchase: 'Analytics Suite - Enterprise',
    amount: 499,
    status: 'pending',
  },
  {
    id: 'INS-0120004',
    date: 'Apr 1 - Apr 7, 2025',
    name: 'Ryan Mitchell',
    email: 'ryan@bizsol.com',
    purchase: 'Sales App - Regular License',
    amount: 499,
    status: 'draft',
  },
  {
    id: 'INS-0120003',
    date: 'Apr 8 - Apr 12, 2025',
    name: 'Nina Hughes',
    image: user8,
    email: 'nina@creativelabs.io',
    purchase: 'Marketing Kit - Extended License',
    amount: 899,
    status: 'paid',
  },
  {
    id: 'INS-0120002',
    date: 'Apr 10 - Apr 14, 2025',
    name: 'Oliver Grant',
    image: user9,
    email: 'oliver@nextgenapps.com',
    purchase: 'Mobile Kit - Standard Plan',
    amount: 599,
    status: 'pending',
  },
  {
    id: 'INS-0120001',
    date: 'Apr 15 - Apr 20, 2025',
    name: 'Sophia Kim',
    image: user10,
    email: 'sophia@pixelhub.io',
    purchase: 'UI Kit - Commercial License',
    amount: 749,
    status: 'overdue',
  },
]

export const demandes: DemandeType[] = [
  {
    id: 'DEM-001',
    client: 'Emily Parker',
    image: user7,
    email: 'emily@startupwave.io',
    typeDemande: 'Transport',
    nombreColies: 15,
    taillesColies: '-',
    nombreTonne: 2.5,
    dateEnlevement: '2025-02-15T08:00:00',
    Manutention: true,
    retour: false,
    status: 'Planifiée'
  },
  {
    id: 'DEM-002',
    client: 'Michael Scott',
    email: 'michael@dundermifflin.com',
    typeDemande: 'Messagerie',
    nombreColies: 8,
    taillesColies: 'L',
    nombreTonne: 1.2,
    dateEnlevement: '2025-02-18T09:30:00',
    Manutention: false,
    retour: true,
    status: 'À planifier'
  },
  {
    id: 'DEM-003',
    client: 'Samantha Reed',
    image: user3,
    email: 'samantha@alphatech.com',
    typeDemande: 'Transport',
    nombreColies: 25,
    taillesColies: '-',
    nombreTonne: 5.8,
    dateEnlevement: '2025-02-20T10:00:00',
    Manutention: true,
    retour: false,
    status: 'Enlèvement en cours'
  },
  {
    id: 'DEM-004',
    client: 'Jonathan Lee',
    image: user2,
    email: 'jonathan@zenflow.io',
    typeDemande: 'Transport',
    nombreColies: 12,
    taillesColies: '-',
    nombreTonne: 3.2,
    dateEnlevement: '2025-02-22T11:15:00',
    Manutention: false,
    retour: true,
    status: 'Enlevée'
  },
  {
    id: 'DEM-005',
    client: 'Carlos Diaz',
    email: 'carlos@themeverse.com',
    typeDemande: 'Messagerie',
    nombreColies: 6,
    taillesColies: 'L',
    nombreTonne: 0.8,
    dateEnlevement: '2025-02-25T14:30:00',
    Manutention: false,
    retour: false,
    status: 'En livraison'
  },
  {
    id: 'DEM-006',
    client: 'Lisa Brown',
    image: user4,
    email: 'lisa@digitize.io',
    typeDemande: 'Transport',
    nombreColies: 30,
    taillesColies: '-',
    nombreTonne: 7.5,
    dateEnlevement: '2025-02-28T07:45:00',
    Manutention: true,
    retour: true,
    status: 'Livrée'
  },
  {
    id: 'DEM-007',
    client: 'Ryan Mitchell',
    email: 'ryan@bizsol.com',
    typeDemande: 'Transport',
    nombreColies: 18,
    taillesColies: '-',
    nombreTonne: 4.1,
    dateEnlevement: '2025-03-02T13:00:00',
    Manutention: false,
    retour: false,
    status: 'Anomalie'
  },
  {
    id: 'DEM-008',
    client: 'Nina Hughes',
    image: user8,
    email: 'nina@creativelabs.io',
    typeDemande: 'Messagerie',
    nombreColies: 10,
    taillesColies: 'XL',
    nombreTonne: 2.0,
    dateEnlevement: '2025-03-05T15:20:00',
    Manutention: true,
    retour: false,
    status: 'Clôturée'
  },
  {
    id: 'DEM-009',
    client: 'Oliver Grant',
    image: user9,
    email: 'oliver@nextgenapps.com',
    typeDemande: 'Transport',
    nombreColies: 22,
    taillesColies: '-',
    nombreTonne: 6.3,
    dateEnlevement: '2025-03-08T08:30:00',
    Manutention: true,
    retour: true,
    status: 'Planifiée'
  },
  {
    id: 'DEM-010',
    client: 'Sophia Kim',
    image: user10,
    email: 'sophia@pixelhub.io',
    typeDemande: 'Transport',
    nombreColies: 14,
    taillesColies: '-',
    nombreTonne: 3.7,
    dateEnlevement: '2025-03-10T10:45:00',
    Manutention: false,
    retour: false,
    status: 'À planifier'
  },
]

export const voyages: VoyageType[] = [
  {
    id: 'TRJ-001',
    typeVoyage: 'Transport',
    chauffeur: 'Ahmed Ben Ali',
    chauffeurImage: user2,
    vehicule: 'Camion - MA 1234 CD',
    dateDepart: '2025-02-15T08:00:00',
    dateArrivee: '2025-02-15T14:30:00',
    depart: 'Casablanca',
    arrivee: 'Rabat',
    status: 'En cours',
    dateReelle: null,
    client: 'Ahmed Ben Ali',
    depot: 'DEP-001'
  },
  {
    id: 'TRJ-002',
    typeVoyage: 'Messagerie',
    chauffeur: 'Mohamed Rachid',
    vehicule: 'Fourgon - MA 5678 EF',
    dateDepart: '2025-02-16T09:15:00',
    dateArrivee: '2025-02-16T11:45:00',
    depart: 'Rabat',
    arrivee: 'Salé',
    status: 'Terminé',
    dateReelle: '2025-02-16T11:50:00',
    client: 'Fatima El Mansouri',
    depot: 'DEP-002'
  },
  {
    id: 'TRJ-003',
    typeVoyage: 'Transport',
    chauffeur: 'Omar Bennani',
    chauffeurImage: user3,
    vehicule: 'Remorque - MA 9012 GH',
    dateDepart: '2025-02-17T07:30:00',
    dateArrivee: '2025-02-17T16:00:00',
    depart: 'Casablanca',
    arrivee: 'Marrakech',
    status: 'En transit',
    dateReelle: null,
    client: 'Hassan Zeroual',
    depot: 'DEP-001'
  },
  {
    id: 'TRJ-004',
    typeVoyage: 'Messagerie',
    chauffeur: 'Youssef El Mansouri',
    chauffeurImage: user4,
    vehicule: 'Moto - MA 3456 IJ',
    dateDepart: '2025-02-18T10:00:00',
    dateArrivee: '2025-02-18T10:30:00',
    depart: 'Casablanca Centre',
    arrivee: 'Casablanca Maarif',
    status: 'Arrivé',
    dateReelle: null,
    client: 'Youssef Bennani',
    depot: 'DEP-001'
  },
  {
    id: 'TRJ-005',
    typeVoyage: 'Transport',
    chauffeur: 'Khalid Zeroual',
    vehicule: 'Camion - MA 7890 KL',
    dateDepart: '2025-02-19T06:00:00',
    dateArrivee: '2025-02-19T18:00:00',
    depart: 'Rabat',
    arrivee: 'Agadir',
    status: 'En attente',
    dateReelle: null,
    client: 'Khadija Alami',
    depot: 'DEP-006'
  },
  {
    id: 'TRJ-006',
    typeVoyage: 'Transport',
    chauffeur: 'Hassan Alami',
    chauffeurImage: user7,
    vehicule: 'Fourgon - MA 2468 MN',
    dateDepart: '2025-02-20T08:30:00',
    dateArrivee: '2025-02-20T12:00:00',
    depart: 'Fès',
    arrivee: 'Meknès',
    status: 'Retardé',
    dateReelle: null,
    client: 'Omar Fassi',
    depot: 'DEP-005'
  },
  {
    id: 'TRJ-007',
    typeVoyage: 'Messagerie',
    chauffeur: 'Abdellah Tazi',
    chauffeurImage: user8,
    vehicule: 'Scooter - MA 1357 OP',
    dateDepart: '2025-02-21T14:00:00',
    dateArrivee: '2025-02-21T15:00:00',
    depart: 'Rabat Agdal',
    arrivee: 'Rabat Hassan',
    status: 'En cours',
    dateReelle: null,
    client: 'Amina Tazi',
    depot: 'DEP-002'
  },
  {
    id: 'TRJ-008',
    typeVoyage: 'Transport',
    chauffeur: 'Noureddine Fassi',
    chauffeurImage: user9,
    vehicule: 'Camion - MA 8024 QR',
    dateDepart: '2025-02-22T05:45:00',
    dateArrivee: '2025-02-22T20:30:00',
    depart: 'Casablanca',
    arrivee: 'Oujda',
    status: 'En transit',
    dateReelle: null,
    client: 'Mohamed Benjelloun',
    depot: 'DEP-001'
  },
  {
    id: 'TRJ-009',
    typeVoyage: 'Messagerie',
    chauffeur: 'Rachid Benali',
    vehicule: 'Fourgon - MA 9753 ST',
    dateDepart: '2025-02-23T11:30:00',
    dateArrivee: '2025-02-23T12:15:00',
    depart: 'Salé',
    arrivee: 'Témara',
    status: 'Annulé',
    dateReelle: null,
    client: 'Rachid Fassi',
    depot: 'DEP-002'
  },
  {
    id: 'TRJ-010',
    typeVoyage: 'Transport',
    chauffeur: 'Said Benjelloun',
    chauffeurImage: user10,
    vehicule: 'Remorque - MA 4680 UV',
    dateDepart: '2025-02-24T07:00:00',
    dateArrivee: '2025-02-24T19:00:00',
    depart: 'Tanger',
    arrivee: 'Casablanca',
    status: 'En attente',
    dateReelle: null,
    client: 'Khadija Alami',
    depot: 'DEP-003'
  },
]

export const clients: ClientType[] = [
  {
    id: 'CLI-001',
    nom: 'Ben Ali',
    prenom: 'Ahmed',
    raisonSociale: 'Société de Transport Ben Ali SARL',
    tel: '+212 661 234 567',
    email: 'ahmed.benali@transport-ma.com',
    image: user2,
    dateInscription: '2024-01-15',
    status: 'Actif',
    typeClient: 'Société',
    depots: ['Dépôt Casablanca Centre', 'Dépôt Rabat']
  },
  {
    id: 'CLI-002',
    nom: 'El Mansouri',
    prenom: 'Fatima',
    raisonSociale: 'Logistics Express SA',
    tel: '+212 662 345 678',
    email: 'f.elmansouri@logisticsexpress.ma',
    image: user3,
    dateInscription: '2024-02-20',
    status: 'Actif',
    typeClient: 'Société',
    depots: ['Dépôt Tanger']
  },
  {
    id: 'CLI-003',
    nom: 'Zeroual',
    prenom: 'Hassan',
    raisonSociale: 'Atlas Distribution SARL',
    tel: '+212 663 456 789',
    email: 'hassan@atlasdistribution.com',
    image: user4,
    dateInscription: '2024-03-10',
    status: 'Inactif',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-004',
    nom: 'Bennani',
    prenom: 'Youssef',
    raisonSociale: 'Maroc Freight Solutions',
    tel: '+212 664 567 890',
    email: 'y.bennani@marocfreight.ma',
    dateInscription: '2024-04-05',
    status: 'En attente',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-005',
    nom: 'Alami',
    prenom: 'Khadija',
    raisonSociale: 'Fast Delivery Service SARL',
    tel: '+212 665 678 901',
    email: 'khadija.alami@fastdelivery.ma',
    image: user7,
    dateInscription: '2024-05-12',
    status: 'Actif',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-006',
    nom: 'Fassi',
    prenom: 'Omar',
    raisonSociale: 'Entreprise Individuelle Fassi',
    tel: '+212 666 789 012',
    email: 'omar.fassi@gmail.com',
    image: user8,
    dateInscription: '2024-06-18',
    status: 'Suspendu',
    typeClient: 'Particulier',
    depots: []
  },
  {
    id: 'CLI-007',
    nom: 'Tazi',
    prenom: 'Amina',
    raisonSociale: 'Messagerie Rapide du Nord SARL',
    tel: '+212 667 890 123',
    email: 'amina@messagerienord.ma',
    image: user9,
    dateInscription: '2024-07-22',
    status: 'Actif',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-008',
    nom: 'Benjelloun',
    prenom: 'Mohamed',
    raisonSociale: 'Transport International Benjelloun SA',
    tel: '+212 668 901 234',
    email: 'mohamed@transportintl.ma',
    image: user10,
    dateInscription: '2024-08-30',
    status: 'Actif',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-009',
    nom: 'El Khadir',
    prenom: 'Nadia',
    raisonSociale: 'Sud Express SARL',
    tel: '+212 669 012 345',
    email: 'nadia.elkhadir@sudexpress.com',
    dateInscription: '2024-09-14',
    status: 'En attente',
    typeClient: 'Société',
    depots: []
  },
  {
    id: 'CLI-010',
    nom: 'Rachid',
    prenom: 'Karim',
    raisonSociale: 'Auto-Entrepreneur Rachid',
    tel: '+212 660 123 456',
    email: 'karim.rachid@outlook.com',
    dateInscription: '2024-10-08',
    status: 'Actif',
    typeClient: 'Particulier',
    depots: []
  },
]
