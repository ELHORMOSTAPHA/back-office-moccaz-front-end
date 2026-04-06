import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import AnnouncesTableComponent from './components/AnnouncesTable'

const AnnouncesPage = () => {
    return (
        <>
            <PageBreadcrumb
                title="Annonces"
                subtitle="Gestion des annonces"
            />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <AnnouncesTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default AnnouncesPage
