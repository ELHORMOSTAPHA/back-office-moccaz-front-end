import PageBreadcrumb from '@/components/PageBreadcrumb'
import {Container} from 'react-bootstrap'
import Profile from './components/Profile.tsx'

const Page = () => {
    return (
        <Container fluid>
            <PageBreadcrumb title="Profile" subtitle="Utilisateur" />
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-8">
                    <Profile />
                </div>
            </div>
        </Container>
    )
}

export default Page