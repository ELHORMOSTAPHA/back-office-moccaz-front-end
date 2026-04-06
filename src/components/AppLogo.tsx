
import {Link} from "react-router";

import logo from '@/assets/images/transport_log.png'

const AppLogo = ({ height }: { height?: number }) => {
  return (
    <>
      <Link to="/" className="logo-dark">
        <img src={logo}alt="dark logo" height={height ?? 28} />
      </Link>
      <Link to="/" className="logo-light">
        <img src={logo} alt="logo" height={height ?? 28} />
      </Link>
    </>
  )
}

export default AppLogo
