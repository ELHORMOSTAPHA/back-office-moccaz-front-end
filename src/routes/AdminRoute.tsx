import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/context/AuthProvider'
// import Loader from '@/components/Loader'

const AdminRoute: React.FC = () => {

  const { user} = useAuth()
useEffect(() => {
    console.log('AdminRoute - User:', user);
  }, [user]);
  // while auth state is loading, don't flash routes
  // if (loading) return <Loader height='100vh'/>
//if user is authentifcated and is admin(profile_id=1) allow access to admin routes
if( user?.profile.id!==3 &&user?.profile.id!==2){
  return <Outlet />
}
  // if user is not client, redirect back to previous location or dashboard
  return <Navigate to={ "/tableau-de-bord"} replace />
}
export default AdminRoute
