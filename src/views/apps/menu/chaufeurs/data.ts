import type { MemberRoleType, DriverTable } from '@/views/apps/menu/chaufeurs/types'
import { TbBriefcase, TbCode, TbHeadset, TbShieldLock } from 'react-icons/tb'

import user1 from '@/assets/images/users/user-1.jpg'
import user10 from '@/assets/images/users/user-10.jpg'
import user2 from '@/assets/images/users/user-2.jpg'
import user3 from '@/assets/images/users/user-3.jpg'
import user4 from '@/assets/images/users/user-4.jpg'
import user5 from '@/assets/images/users/user-5.jpg'
import user6 from '@/assets/images/users/user-6.jpg'
import user7 from '@/assets/images/users/user-7.jpg'
import user8 from '@/assets/images/users/user-8.jpg'
import user9 from '@/assets/images/users/user-9.jpg'

export const memberRoles: MemberRoleType[] = [
  {
    id: 1,
    title: 'Security Officer',
    description: 'Handles platform safety and protocol reviews.',
    icon: TbShieldLock,
    features: ['Daily Risk Assessment', 'Manage Security Logs', 'Control Access Rights', 'Emergency Protocols'],
    users: [user7, user8, user9, user10],
    updatedTime: '1 hour ago',
  },
  {
    id: 2,
    title: 'Project Manager',
    description: 'Coordinates planning and team delivery timelines.',
    icon: TbBriefcase,
    features: ['Timeline Tracking', 'Task Assignments', 'Budget Control', 'Stakeholder Reporting'],
    users: [user2, user5, user6, user1, user8],
    updatedTime: '2 hours ago',
  },
  {
    id: 3,
    title: 'Developer',
    description: 'Builds and maintains the platform core features.',
    icon: TbCode,
    features: ['Codebase Maintenance', 'API Integration', 'Unit Testing', 'Feature Deployment'],
    users: [user3, user4, user9, user10, user8, user1],
    updatedTime: '3 hours ago',
  },
  {
    id: 4,
    title: 'Support Lead',
    description: 'Oversees customer support and service quality.',
    icon: TbHeadset,
    features: ['Respond to Tickets', 'Live Chat Supervision', 'FAQ Updates', 'Support Metrics Review'],
    users: [user1, user5, user7],
    updatedTime: '30 min ago',
  },
]

export const users: DriverTable[] = [
  {
    employer: 'Societe externe',
    id: '#USR00123',
    name: 'ahmad mostafa',
    email: 'ahmad.mostafa@eurofast.ma',
    phone: '+212 612-345-678',
    avatar: user2,
    role: 'Project Manager',
    date: '18 Apr, 2025',
    time: '9:45 AM',
    status: 'inactif',
    permis: "A",
  },
  {
    id: '#USR00145',
    name: 'karim samir',
    email: 'karim.samir@eurofast.ma',
    phone: '+212 612-345-679',
    avatar: user2,
    role: 'Developer',
    date: '21 Apr, 2025',
    time: '3:15 PM',
    status: 'actif',
    employer: 'Eurofat',
    permis: 'B, C'
  },
  {
    id: '#USR00162',
    name: 'nadia elias',
    email: 'nadia.elias@eurofast.ma',
    phone: '+212 612-345-680',
    avatar: user4,
    role: 'Support Lead',
    date: '19 Apr, 2025',
    time: '10:00 AM',
    status: 'inactif',
    employer: 'Societe externe',
    permis: 'B'
  },
  {
    id: '#USR00178',
    name: 'yassin zahid',
    email: 'yassin.zahid@eurofast.ma',
    phone: '+212 612-345-681',
    avatar: user2,
    role: 'Developer',
    date: '22 Apr, 2025',
    time: '8:15 AM',
    status: 'actif',
    employer: 'Eurofat',
    permis: 'C, E(C)'
  },
  {
    id: '#USR00189',
    name: 'ahmad rami',
    email: 'ahmad.rami@eurofast.ma',
    phone: '+212 612-345-682',
    avatar: user2,
    role: 'Security Officer',
    date: '20 Apr, 2025',
    time: '2:45 PM',
    employer: 'Societe externe',
    status: 'actif',
    permis: 'D'
  },
  {
    id: '#USR00203',
    name: 'mohamed amine',
    email: 'mohamed.amine@eurofast.ma',
    phone: '+212 612-345-683',
    avatar: user2,
    role: 'Support Lead',
    date: '15 Apr, 2025',
    time: '11:20 AM',
    status: 'inactif',
    employer: 'Societe externe',
    permis: 'B, E(B)'
  },
  {
    id: '#USR00215',
    name: 'achraf elyazidi',
    email: 'achraf.elyazidi@eurofast.ma',
    phone: '+212 612-345-684',
    avatar: user2,
    role: 'Developer',
    date: '23 Apr, 2025',
    time: '4:25 PM',
    status: 'actif',
    employer: 'Eurofat',
    permis: 'C'
  },
  {
    id: '#USR00228',
    name: 'ilyas mansouri',
    email: 'ilyas.mansouri@eurofast.ma',
    phone: '+212 612-345-685',
    avatar: user2,
    role: 'Security Officer',
    date: '17 Apr, 2025',
    time: '6:10 PM',
    status: 'inactif',
    employer: 'Societe externe',
    permis: 'B, C, D'
  },
  {
    id: '#USR00239',
    name: 'youssef karim',
    email: 'youssef.karim@eurofast.ma',
    phone: '+212 612-345-686',
    avatar: user2,
    role: 'Project Manager',
    date: '11 Apr, 2025',
    time: '1:30 PM',
    status: 'suspendu',
    employer: 'Eurofat',
    permis: 'E(C), E(D)'
  },
]
