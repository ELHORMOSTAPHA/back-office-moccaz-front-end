
import logoSm from '@/assets/images/logo-sm.png'
import logo from '@/assets/images/logo_moccaz.png'
import { useLayoutContext } from '@/context/useLayoutContext'
import AppMenu from '@/layouts/components/sidenav/components/AppMenu'
import UserProfile from '@/layouts/components/sidenav/components/UserProfile'

import {Link} from "react-router";
import { TbMenu4, TbX } from 'react-icons/tb'
import SimpleBar from "simplebar-react";
import ClientMenu from './components/ClientMenu'
import { useAuth } from '@/context/AuthProvider'
import { appName } from '@/helpers'

const Sidenav = () => {
  const { sidenav, hideBackdrop, changeSideNavSize } = useLayoutContext()
  const {user}=useAuth();
  // Get user email from localStorage to determine which menu to display
  // const userEmail = localStorage.getItem('userEmail')
  // const isClient = userEmail === 'client@eurofat.com'
const role=user?.profile?.id;
  const toggleSidebar = () => {
    changeSideNavSize(sidenav.size === 'on-hover-active' ? 'on-hover' : 'on-hover-active')
  }

  const closeSidebar = () => {
    const html = document.documentElement
    html.classList.toggle('sidebar-enable')
    hideBackdrop()
  }

  return (
    <div className="sidenav-menu sidenav-menu--moccaz">
      <Link to="/" className="logo">
        <span className="logo logo-light">
          <span className="logo-lg text-center" style={{height: '70px', width: 'auto'}} >
            {/* <img src={logo} alt="logo" style={{ height: '50px', width: 'auto' }} /> */}
            <img src={logo} alt="logo" style={{ height: '50px', width: 'auto' }} />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="small logo" style={{ height: '40px', width: 'auto' }} />
          </span>
        </span>
        <span className="logo logo-dark">
          <span className="logo-lg">
            <img src={logo} alt="dark logo" style={{ height: '50px', width: 'auto' }} />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="small logo" style={{ height: '40px', width: 'auto' }} />
          </span>
        </span>
      </Link>
      <button className="button-on-hover">
        <TbMenu4 onClick={toggleSidebar} className="fs-22 align-middle" />
      </button>
      <button className="button-close-offcanvas">
        <TbX onClick={closeSidebar} className="align-middle" />
      </button>
      <SimpleBar id="sidenav" className="scrollbar">
        {sidenav.user && <UserProfile />}
        {/* Display ClientMenu for client@eurofat.com, otherwise display AppMenu for admin */}
        {/* {role!==2 ?  <AppMenu /> : <ClientMenu />} */}
        <AppMenu/>
      </SimpleBar>
    </div>
  )
}

export default Sidenav
