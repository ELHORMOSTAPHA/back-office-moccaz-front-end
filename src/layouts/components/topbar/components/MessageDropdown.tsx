import {Dropdown, DropdownToggle} from 'react-bootstrap'
import { LuBell } from 'react-icons/lu'

const MessageDropdown = () => {
  return (
    <div className="topbar-item">
      <Dropdown align="end">
        <DropdownToggle as={'button'} className="topbar-link dropdown-toggle drop-arrow-none">
          <LuBell className="fs-xxl" />
          <span className="badge text-bg-danger badge-circle topbar-badge">7</span>
        </DropdownToggle>

        {/* <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
          <div className="px-3 py-2 border-bottom">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-md fw-semibold">Notifications</h6>
              </Col>
              <Col className="text-end">
                <Link to="" className="badge badge-soft-success badge-label py-1">
                  07 Notifications
                </Link>
              </Col>
            </Row>
          </div>

          <SimpleBar style={{ maxHeight: '300px' }}>
            {messages.map((message) => (
              <DropdownItem className={`notification-item py-2 text-wrap ${message.active ? 'active' : ''}`} id={message.id} key={message.id}>
                <span className="d-flex gap-3 align-items-center">
                  {message.user.icon && (
                    <span className="avatar-md flex-shrink-0 position-relative">
                      <span className={`avatar-title rounded-circle fs-22 ${message.user.bgClass}`}>
                        <message.user.icon className={`fs-4 fill-white text-${message.badge.variant}`} />
                      </span>
                      <span className={`position-absolute rounded-pill bg-${message.badge.variant} notification-badge`}>
                        <message.badge.icon className="align-middle"></message.badge.icon>
                        <span className="visually-hidden">unread notification</span>
                      </span>
                    </span>
                  )}
                  {message.user.avatar && (
                    <span className="flex-shrink-0 position-relative">
                      <img src={message.user.avatar} height={36} width={36} className="avatar-md rounded-circle" alt="User Avatar" />
                      <span className={`position-absolute rounded-pill bg-${message.badge.variant} notification-badge`}>
                        <message.badge.icon className="align-middle"></message.badge.icon>
                        <span className="visually-hidden">unread notification</span>
                      </span>
                    </span>
                  )}
                  <span className="flex-grow-1 text-muted">
                    <span className="fw-medium text-body">{message.user.name}</span> {message.action}
                    <span className="fw-medium text-body"> {message.context}</span>
                    <br />
                    <span className="fs-xs">{message.timestamp}</span>
                  </span>
                  <Button variant="link" type="button" className="flex-shrink-0 text-muted  p-0 position-absolute end-0 me-2 d-none noti-close-btn">
                    <TbXboxXFilled className="fs-xxl" />
                  </Button>
                </span>
              </DropdownItem>
            ))}
          </SimpleBar>

          <Link
            to=""
            className="dropdown-item text-center text-reset text-decoration-underline link-offset-2 fw-bold notify-item border-top border-light py-2">
            Read All Messages
          </Link>
        </DropdownMenu> */}
      </Dropdown>
    </div>
  )
}

export default MessageDropdown
