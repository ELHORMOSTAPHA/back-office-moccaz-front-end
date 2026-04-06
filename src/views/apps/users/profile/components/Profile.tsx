import {Card, CardBody, Spinner} from 'react-bootstrap'
import {
    TbMail,
    TbMapPin,
    TbPhone,
    TbUser
} from 'react-icons/tb'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const Profile = () => {
    const { data: user, isLoading, error } = useCurrentUser()

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                </CardBody>
            </Card>
        )
    }

    // Error state
    if (error) {
        console.error('Error fetching user profile:', error)
        return (
            <Card>
                <CardBody>
                    <div className="text-center text-danger p-4">
                        <p>Unable to load profile data. Please try again.</p>
                    </div>
                </CardBody>
            </Card>
        )
    }

    if (!user) {
        return null
    }

    // Use real user data from API
    const userName = user?.profile?.id==1 ? `${user.prenom} ${user.nom}` : `${user.client?.raison_sociale}`
    const userRole = user.profile?.nom || 'Client'
    // const userCompany = user.raison_sociale || user.profile?.nom === 'admin' ? 'EUROFAST' : 'N/A'
    const userPhone = user.telephone || 'N/A'
    const userLocation = 'Casablanca, Maroc'
    const displayEmail = user.email
    const userInitial = user?.profile?.id==1 ? user.prenom.charAt(0).toUpperCase() : user.client?.raison_sociale?.charAt(0).toUpperCase() || 'U'
    const userImage = null // Set to user.image or user.avatar when available

    return (
        <Card>
            <CardBody>
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div className="me-3 position-relative">
                        {userImage ? (
                            <img src={userImage} alt="avatar" className="rounded-circle" width={72} height={72} />
                        ) : (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    fontSize: '28px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                {userInitial}
                            </div>
                        )}
                    </div>
                    <div>
                        <h5 className="mb-1">{userName}</h5>
                        <p className="text-muted mb-1">{userRole}</p>
                    </div>
                </div>
                <div>
                    <h5 className="mb-3 text-uppercase fs-sm">Informations Personnelles</h5>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
                            <TbUser className="fs-xl" />
                        </div>
                        <div>
                            <p className="text-muted fs-xs mb-0">Nom complet</p>
                            <p className="mb-0 fs-sm fw-semibold">{userName}</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
                            <TbMail className="fs-xl" />
                        </div>
                        <div>
                            <p className="text-muted fs-xs mb-0">Email</p>
                            <p className="mb-0 fs-sm fw-semibold">{displayEmail}</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
                            <TbPhone className="fs-xl" />
                        </div>
                        <div>
                            <p className="text-muted fs-xs mb-0">Téléphone</p>
                            <p className="mb-0 fs-sm fw-semibold">{userPhone}</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
                            <TbMapPin className="fs-xl" />
                        </div>
                        <div>
                            <p className="text-muted fs-xs mb-0">Localisation</p>
                            <p className="mb-0 fs-sm fw-semibold">{userLocation}</p>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default Profile
