import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/context/AuthProvider'
// import Loader from '@/components/Loader'

const AuthRoute: React.FC = () => {
  const { isAuthenticated } = useAuth()

  // // while auth state is loading, don't flash routes
  // if (loading) return <Loader height='100vh'/>

  // if user is already authenticated, redirect to app home
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // otherwise render the nested auth routes (login, signup...)
  return <Outlet />
}

export default AuthRoute
