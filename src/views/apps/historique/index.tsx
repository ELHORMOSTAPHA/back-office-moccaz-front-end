import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import HistoriqueTableComponent from './components/HistoriqueTable'

const HistoriquePage = () => {
    return (
        <>
            <PageBreadcrumb title="Historique" subtitle="Journal des actions" />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <HistoriqueTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default HistoriquePage
