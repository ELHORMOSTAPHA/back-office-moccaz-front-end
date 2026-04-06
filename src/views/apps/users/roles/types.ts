import { type IconType } from 'react-icons'

export type MemberRoleType = {
  id: number
  title: string
  description: string
  icon: IconType
  color?: string
  features: string[]
  users: string[] | { avatar: string; name: string }[]
  updatedTime?: string
}

export type UserType = {
  id: string | number
  name: string
  email: string
  avatar: string
  role: string
  status: string
  createdAt?: string
  date?: string
  time?: string
}
