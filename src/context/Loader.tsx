import Loader from "@/components/Loader";
import { useAuth } from "./AuthProvider";


function Loading({children}: {children?: React.ReactNode}) {
const loading=useAuth().loading;
  if (loading) {
    return (
      <Loader height="100vh"/>
    )
  }
  return <>{children}</>;
}

export default Loading