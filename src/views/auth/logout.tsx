import { useAuth } from '@/context/AuthProvider'

const Logout = () => {
 const {logout}=useAuth();
  logout();
 return null;
}

export default Logout
