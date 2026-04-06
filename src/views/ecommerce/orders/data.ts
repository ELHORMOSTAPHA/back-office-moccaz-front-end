
import type { IconType } from 'react-icons'
import { TbAlertTriangle, TbCalendarCheck, TbCalendarTime, TbCircleCheck, TbPackageExport, TbRepeat, TbShoppingCart, TbTruckDelivery, TbTruckLoading } from 'react-icons/tb'

import user1 from '@/assets/images/users/user-1.jpg'
import user10 from '@/assets/images/users/user-10.jpg'
import user2 from '@/assets/images/users/user-2.jpg'
import user3 from '@/assets/images/users/user-3.jpg'
import user4 from '@/assets/images/users/user-4.jpg'
import user5 from '@/assets/images/users/user-5.jpg'
import user6 from '@/assets/images/users/user-6.jpg'
import user7 from '@/assets/images/users/user-7.jpg'
import user9 from '@/assets/images/users/user-9.jpg'

import amex from '@/assets/images/cards/american-express.svg'
import bhim from '@/assets/images/cards/bhim.svg'
import discover from '@/assets/images/cards/discover-card.svg'
import googleWallet from '@/assets/images/cards/google-wallet.svg'
import mastercard from '@/assets/images/cards/mastercard.svg'
import payoneer from '@/assets/images/cards/payoneer.svg'
import paypal from '@/assets/images/cards/paypal.svg'
import stripe from '@/assets/images/cards/stripe.svg'
import unionpay from '@/assets/images/cards/unionpay.svg'
import visa from '@/assets/images/cards/visa.svg'

export type OrderStatisticsType = {
  title: string
  count: number
  change: string
  icon: IconType
  prefix?: string
  suffix?: string
  variant: string
}

export type OrderType = {
  id: string
  date: string
  time: string
  customer: {
    name: string
    avatar: string
    email: string
  }
  amount: number
    orderStatus: 'À planifier' | 'Planifiée' | 'Enlèvement en cours' | 'Enlevée' | 'En livraison' | 'Livrée' | 'Anomalie' | 'Clôturée'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  paymentMethod: {
    type: 'card' | 'upi' | 'other'
    image: string
    vendor?: 'mastercard' | 'visa' | 'paypal' | 'stripe' | 'american-express' | 'discover' | 'unionpay' | 'payoneer' | 'google-wallet' | 'bhim'
    email?: string
    upiId?: string
    cardNumber?: string
  }
}

export const orderStats: OrderStatisticsType[] = [
   {
    title: 'Tous les demandes',
    count: 557,
    change: '-1.12',
    icon: TbShoppingCart,
    variant: 'success',
  },
   {
    title: 'À planifier',
    count: 557,
    change: '-1.12',
    icon: TbCalendarTime,
    variant: 'warning',
  },
  {
    title: 'Planifiée',
    count: 312,
    change: '+0.85',
    icon: TbCalendarCheck,
    variant: 'info',
  },
  {
    title: 'Enlèvement en cours',
    count: 198,
    change: '+1.42',
    icon: TbTruckLoading,
    variant: 'warning',
  },
  {
    title: 'Enlevée',
    count: 430,
    change: '+2.11',
    icon: TbPackageExport,
    variant: 'primary',
  },
  {
    title: 'En livraison',
    count: 930,
    change: '+4.22',
    icon: TbTruckDelivery,
    variant: 'info',
  },
  {
    title: 'Livrée',
    count: 7541,
    change: '+5.64',
    icon: TbCircleCheck,
    variant: 'success',
  },
  {
    title: 'Anomalie',
    count: 269,
    change: '-0.75',
    icon: TbAlertTriangle,
    variant: 'danger',
  },
  {
    title: 'Clôturée',
    count: 8741,
    change: '+0.56',
    icon: TbRepeat,
    variant: 'primary',
  },

]

export const orders: OrderType[] = [
  {
    id: 'WB20100',
    date: '25 June, 2025',
    time: '10:10 AM',
    customer: {
      name: 'Mason Carter',
      avatar: user2,
      email: 'mason.carter@shopmail.com',
    },
    amount: 129.45,
    paymentStatus: 'paid',
    orderStatus: 'Livrée',
    paymentMethod: {
      type: 'card',
      image: visa,
      vendor: 'visa',
      cardNumber: 'xxxx 7832',
    },
  },
  {
    id: 'WB20101',
    date: '7 May, 2025',
    time: '11:45 AM',
    customer: {
      name: 'Ava Martin',
      avatar: user9,
      email: 'ava.martin@marketplace.com',
    },
    amount: 87.0,
    paymentStatus: 'pending',
    orderStatus: 'En livraison',
    paymentMethod: {
      type: 'card',
      image: mastercard,
      vendor: 'mastercard',
      cardNumber: 'xxxx 5487',
    },
  },
  {
    id: 'WB20102',
    date: '26 Apr, 2025',
    time: '1:20 PM',
    customer: {
      name: 'Noah Wilson',
      avatar: user1,
      email: 'noah.wilson@ecomsite.com',
    },
    amount: 59.9,
    paymentStatus: 'failed',
    orderStatus: 'Anomalie',
    paymentMethod: {
      type: 'other',
      image: paypal,
      vendor: 'paypal',
      email: 'xxx@email.com',
    },
  },
  {
    id: 'WB20103',
    date: '27 Apr, 2025',
    time: '3:30 PM',
    customer: {
      name: 'Isabella Moore',
      avatar: user10,
      email: 'isabella.moore@onlineshop.com',
    },
    amount: 215.2,
    paymentStatus: 'paid',
    orderStatus: 'Livrée',
    paymentMethod: {
      type: 'card',
      image: stripe,
      vendor: 'stripe',
      cardNumber: 'xxxx 9901',
    },
  },
  {
    id: 'WB20104',
    date: '28 Apr, 2025',
    time: '9:55 AM',
    customer: {
      name: 'Lucas Bennett',
      avatar: user5,
      email: 'lucas.bennett@shopzone.com',
    },
    amount: 345.75,
    paymentStatus: 'paid',
    orderStatus: 'Enlevée',
    paymentMethod: {
      type: 'card',
      image: amex,
      vendor: 'american-express',
      cardNumber: 'xxxx 4678',
    },
  },
  {
    id: 'WB30100',
    date: '20 Apr, 2025',
    time: '2:30 PM',
    customer: {
      name: 'Emma Johnson',
      avatar: user3,
      email: 'emma.johnson@storemail.com',
    },
    amount: 199.99,
    paymentStatus: 'paid',
    orderStatus: 'Planifiée',
    paymentMethod: {
      type: 'card',
      image: discover,
      vendor: 'discover',
      cardNumber: 'xxxx 1234',
    },
  },
  {
    id: 'WB30101',
    date: '21 Apr, 2025',
    time: '9:15 AM',
    customer: {
      name: 'Liam Thompson',
      avatar: user4,
      email: 'liam.thompson@buynow.com',
    },
    amount: 75.5,
    paymentStatus: 'pending',
    orderStatus: 'Enlèvement en cours',
    paymentMethod: {
      type: 'card',
      image: unionpay,
      vendor: 'unionpay',
      cardNumber: 'xxxx 9876',
    },
  },
  {
    id: 'WB30102',
    date: '22 Apr, 2025',
    time: '4:45 PM',
    customer: {
      name: 'Sophia Davis',
      avatar: user5,
      email: 'sophia.davis@shopsite.com',
    },
    amount: 45.25,
    paymentStatus: 'failed',
    orderStatus: 'À planifier',
    paymentMethod: {
      type: 'other',
      image: payoneer,
      vendor: 'payoneer',
      email: 'xxx@email.com',
    },
  },
  {
    id: 'WB30103',
    date: '10 May, 2025',
    time: '11:00 AM',
    customer: {
      name: 'Oliver Brown',
      avatar: user6,
      email: 'oliver.brown@webstore.com',
    },
    amount: 299.0,
    paymentStatus: 'paid',
    orderStatus: 'Clôturée',
    paymentMethod: {
      type: 'upi',
      image: googleWallet,
      vendor: 'google-wallet',
      upiId: 'xxx@google',
    },
  },
  {
    id: 'WB30104',
    date: '24 Apr, 2025',
    time: '8:20 AM',
    customer: {
      name: 'Charlotte Lee',
      avatar: user7,
      email: 'charlotte.lee@marketzone.com',
    },
    amount: 420.8,
    paymentStatus: 'paid',
    orderStatus: 'Enlevée',
    paymentMethod: {
      type: 'upi',
      image: bhim,
      vendor: 'bhim',
      upiId: 'xxxx@upi',
    },
  },
]

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
  dateLivraison?: string
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
}
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
    dateEnlevement: '2025-02-15',
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
    dateEnlevement: '2025-02-18',
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
    dateEnlevement: '2025-02-20',
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
    dateEnlevement: '2025-02-22',
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
    dateEnlevement: '2025-02-25',
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
    dateEnlevement: '2025-02-28',
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
    dateEnlevement: '2025-03-02',
    Manutention: false,
    retour: false,
    status: 'Anomalie'
  },
  {
    id: 'DEM-008',
    client: 'Nina Hughes',
    image: user2,
    email: 'nina@creativelabs.io',
    typeDemande: 'Messagerie',
    nombreColies: 10,
    taillesColies: 'XL',
    nombreTonne: 2.0,
    dateEnlevement: '2025-03-05',
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
    dateEnlevement: '2025-03-08',
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
    dateEnlevement: '2025-03-10',
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
    status: 'En cours'
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
    status: 'Terminé'
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
    status: 'En transit'
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
    status: 'Arrivé'
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
    status: 'En attente'
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
    status: 'Retardé'
  },
  {
    id: 'TRJ-007',
    typeVoyage: 'Messagerie',
    chauffeur: 'Abdellah Tazi',
    chauffeurImage: user1,
    vehicule: 'Scooter - MA 1357 OP',
    dateDepart: '2025-02-21T14:00:00',
    dateArrivee: '2025-02-21T15:00:00',
    depart: 'Rabat Agdal',
    arrivee: 'Rabat Hassan',
    status: 'En cours'
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
    status: 'En transit'
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
    status: 'Annulé'
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
    status: 'En attente'
  },
]