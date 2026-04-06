
import type { IconType } from 'react-icons'
import type { Chauffeur } from '@/interface/gloable'

export type MemberRoleType = {
  id: number
  title: string
  description: string
  icon: IconType
  features: string[]
  users: string[]
  updatedTime: string
}

export type DriverTable = {
  id: string
  name: string
  email: string
  avatar: string
  phone: string
  role: string
  date: string
  employer: string | "interne"
  time: string
  status: 'inactif' | 'actif' | 'suspendu'
  selected?: boolean
  permis: string
  _original?: Chauffeur
}
