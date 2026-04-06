import { userDropdownItems } from '@/layouts/components/data'

import {Link} from "react-router";
import { Fragment } from 'react'
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { TbChevronDown } from 'react-icons/tb'
import { useAuth } from '@/context/AuthProvider';

const UserProfile = () => {
  const { user } = useAuth()

  // Get user name and initial
  const userName =user? user?.profile.id==1 ? `${user.prenom} ${user.nom}` : `${user.client?.raison_sociale}` :'User'
    const userInitial =user? user?.profile.id==1 ? user.prenom.charAt(0).toUpperCase() : user.client?.raison_sociale?.charAt(0).toUpperCase() :'U'

  // const userInitial = user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'
  const userImage = null // Set to user.image when available

  return (
    <div className="topbar-item nav-user">
      <Dropdown align="end">
        <DropdownToggle as={'a'} className="topbar-link dropdown-toggle drop-arrow-none px-2">
          {userImage ? (
            <img src={userImage} width="32" height="32" className="rounded-circle me-lg-2 d-flex" alt="user-image" />
          ) : (
            <div
              className="rounded-circle me-lg-2 d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {userInitial}
            </div>
          )}
          <div className="d-lg-flex align-items-center gap-1 d-none">
            <h5 className="my-0">{userName}</h5>
            <TbChevronDown className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
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
  )
}

export default UserProfile
