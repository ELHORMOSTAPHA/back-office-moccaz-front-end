import type { MemberRoleType, UserType } from './types'
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

export const users: UserType[] = [
  {
    id: '#USR00123',
    name: 'Commerciale',
    email: 'commercial@eurofast.ma',
    avatar: user5,
    role: 'Commerciale',
    date: '18 Apr, 2025',
    time: '9:45 AM',
    status: 'inactive',
    libelle: 'Commerciale',
  },
  {
    id: '#USR00145',
    name: 'Administrateur',
    email: 'admin@eurofast.ma',
    avatar: user3,
    role: 'Administrateur',
    date: '21 Apr, 2025',
    time: '3:15 PM',
    status: 'active',
    libelle: 'Administrateur',
  },
  {
    id: '#USR00162',
    name: 'Exploitant/Planificateur',
    email: 'exploitant@eurofast.ma',
    avatar: user1,
    role: 'Exploitant/Planificateur',
    date: '19 Apr, 2025',
    time: '10:00 AM',
    status: 'active',
    libelle: 'Exploitant/Planificateur',
  },
]
