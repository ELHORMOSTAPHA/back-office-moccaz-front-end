import {Card, Col, Container, Row} from 'react-bootstrap'
// import {TbSend} from 'react-icons/tb'

import PageBreadcrumb from '@/components/PageBreadcrumb'
import DemandeForm from './components/DemandeForm'

const Index = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Créer une Demande" subtitle="Portail Client" />

      <Row className="justify-content-center">
        <Col xxl={12}>
          <Card>
            <DemandeForm />
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Index
