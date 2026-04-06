import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthProvider'
// import Loader from '@/components/Loader'

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // while we are checking auth, avoid showing protected UI
  // if (loading) return <Loader/>

  // if not authenticated, redirect to login and keep attempted location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
