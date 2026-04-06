
import type { IconType } from 'react-icons'

export type MemberRoleType = {
  id: number
  title: string
  description: string
  icon: IconType
  features: string[]
  users: string[]
  updatedTime: string
}

export type CarType = {
  id: string
  name: string
  email: string
  tonnage: string
  avatar: string
  capacite?: string
  role: string
  date: string
  time: string
  proprietaire: string | 'interne'
  selected?: boolean
  n_vehicule: string
  immatriculation: string
  type?: string
}
