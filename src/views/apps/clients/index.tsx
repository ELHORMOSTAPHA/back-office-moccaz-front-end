import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import ClientsTableComponent from './components/ClientsTable'

const Clients = () => {
    return (
        <>
            <PageBreadcrumb
                title="Clients"
                subtitle="Gestion des clients"
            />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <ClientsTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default Clients
