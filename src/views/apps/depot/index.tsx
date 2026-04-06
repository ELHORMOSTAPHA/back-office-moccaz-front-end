import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import DepotTableComponent from './components/DepotTable'

const DepotPage = () => {
    return (
        <>
            <PageBreadcrumb title="Dépôts" subtitle="Gestion" />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <DepotTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default DepotPage
