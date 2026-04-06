import { Container, Row, Col } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import BoutiqueTableComponent from './components/BoutiqueTable'

const BoutiquesPage = () => {
    return (
        <>
            <PageBreadcrumb
                title="Boutiques"
                subtitle="Gestion des boutiques (magasins)"
            />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xxl={12}>
                        <BoutiqueTableComponent />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default BoutiquesPage
