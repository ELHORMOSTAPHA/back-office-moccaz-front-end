import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import Invoices from './components/Invoices.tsx'

const Index = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Liste des demandes" subtitle="Demandes" />

      <Row>
        <Col cols={12}>
          <Invoices />
        </Col>
      </Row>
    </Container>
  )
}

export default Index
