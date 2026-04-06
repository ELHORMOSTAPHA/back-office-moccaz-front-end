import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthProvider'

interface RoleRouteProps {
  allowedRoles: string[]
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRolesRaw = (user as any)?.roles
  const userRoles = Array.isArray(userRolesRaw)
    ? userRolesRaw
    : userRolesRaw
    ? [userRolesRaw]
    : []

  const hasRole = userRoles.some((r: string) => allowedRoles.includes(r))

  if (!hasRole) {
    return <Navigate to="/error/403" replace />
  }

  return <Outlet />
}

export default RoleRoute
