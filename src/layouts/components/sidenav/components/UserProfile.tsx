import { userDropdownItems } from '@/layouts/components/data'
import {Link} from "react-router";
import { Fragment } from 'react'
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { TbSettings } from 'react-icons/tb'
import { useCurrentUser } from '@/hooks/useCurrentUser'


const UserProfile = () => {
  const { data: user } = useCurrentUser()

  // Get user name, role, and initial
  const userName = user ? `${user.prenom} ${user.nom}` : 'User'
  const userRole = user?.profile?.type_profile || 'Client'
  const userInitial = user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'
  const userImage = null // Set to user.image when available

  return (
    <div className="sidenav-user">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Link to="/" className="link-reset">
            {userImage ? (
              <img src={userImage} alt="user-image" width="36" height="36" className="rounded-circle mb-2 avatar-md" />
            ) : (
              <div
                className="rounded-circle mb-2 avatar-md d-flex align-items-center justify-content-center text-white fw-bold mx-auto"
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {userInitial}
              </div>
            )}
            <span className="sidenav-user-name fw-bold">{userName}</span>
            <span className="fs-12 fw-semibold" data-lang="user-role">
              {userRole}
            </span>
          </Link>
        </div>
        <Dropdown>
          <DropdownToggle
            as={'a'}
            role="button"
            aria-label="profile dropdown"
            className="dropdown-toggle drop-arrow-none link-reset sidenav-user-set-icon">
            <TbSettings className="fs-24 align-middle ms-1" />
          </DropdownToggle>

          <DropdownMenu>
            {userDropdownItems.map((item, idx) => (
              <Fragment key={idx}>
                {item.isHeader ? (
                  <div className="dropdown-header noti-title">
                    <h6 className="text-overflow m-0">{item.label}</h6>
                  </div>
                ) : item.isDivider ? (
                  <DropdownDivider />
                ) : (
                  <DropdownItem as={Link} to={item.url ?? ''} className={item.class}>
                    {item.icon && <item.icon className="me-2 fs-17 align-middle" />}
                    <span className="align-middle">{item.label}</span>
                  </DropdownItem>
                )}
              </Fragment>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}

export default UserProfile
