
import { useLayoutContext } from '@/context/useLayoutContext'
import MessageDropdown from '@/layouts/components/topbar/components/MessageDropdown'
import ThemeToggler from '@/layouts/components/topbar/components/ThemeToggler'
import UserProfile from '@/layouts/components/topbar/components/UserProfile'

import {Link} from "react-router";
import { Container } from 'react-bootstrap'
import { TbMenu4 } from 'react-icons/tb'

import logoSm from '@/assets/images/logo-sm.png'
import logoMoccaz from '@/assets/images/logo_moccaz.png'
import FullscreenToggle from '@/layouts/components/topbar/components/FullscreenToggle'
import MonochromeThemeModeToggler from '@/layouts/components/topbar/components/MonochromeThemeModeToggler'

const Topbar = () => {
  const { sidenav, changeSideNavSize, showBackdrop } = useLayoutContext()

  const toggleSideNav = () => {
    const html = document.documentElement
    const currentSize = html.getAttribute('data-sidenav-size')

    if (currentSize === 'offcanvas') {
      html.classList.toggle('sidebar-enable')
      showBackdrop()
    } else if (sidenav.size === 'compact') {
      changeSideNavSize(currentSize === 'compact' ? 'condensed' : 'compact', false)
    } else {
      changeSideNavSize(currentSize === 'condensed' ? 'default' : 'condensed')
    }
  }

  return (
    <header className="app-topbar app-topbar--moccaz-light">
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-topbar">
            <Link to="/" className="logo-light">
              <span className="logo-lg">
                <img src={logoMoccaz} alt="M-OCAZ" style={{ height: 40, width: 'auto' }} />
              </span>
              <span className="logo-sm">
                <img src={logoSm} alt="M-OCAZ" />
              </span>
            </Link>

            <Link to="/" className="logo-dark">
              <span className="logo-lg">
                <img src={logoMoccaz} alt="M-OCAZ" style={{ height: 40, width: 'auto' }} />
              </span>
              <span className="logo-sm">
                <img src={logoSm} alt="M-OCAZ" />
              </span>
            </Link>
          </div>

          <button onClick={toggleSideNav} className="sidenav-toggle-button btn btn-default btn-icon">
            <TbMenu4 className="fs-22" />
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
         

          {/* <MessageDropdown />

          <ThemeToggler />

          <FullscreenToggle />

          <MonochromeThemeModeToggler /> */}

          <UserProfile />
        </div>
      </Container>
    </header>
  )
}

export default Topbar
