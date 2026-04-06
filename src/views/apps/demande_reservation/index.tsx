import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import DemandeReservationTableComponent from './components/DemandeReservationTable'

const DemandeReservationPage = () => {
    return (
        <>
            <PageBreadcrumb title="Demandes de réservation" subtitle="Gestion" />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <DemandeReservationTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default DemandeReservationPage
