import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/context/AuthProvider'
// import Loader from '@/components/Loader'

const ClientRoute: React.FC = () => {
  const { user } = useAuth()
useEffect(() => {
    console.log('client route - User:', user);
  }, [user]);
  // // while auth state is loading, don't flash routes
  // if (loading) return <Loader height='100vh'/>

  // if user is authenticated and is client (profile_id=2) allow access to client routes
  if (user?.profile.id === 2) {
    return <Outlet />
  }
  // if user is not client, redirect back to previous location or dashboard
  return <Navigate to={ "/dashboard"} replace />
}

export default ClientRoute
