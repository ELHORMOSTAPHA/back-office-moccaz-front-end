import { Col, Container, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import Invoices from './Invoices.tsx'

const Index = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Demandes" subtitle="Portail Client" />

    
      <Row>
        <Col cols={12}>
          <Invoices />
        </Col>
      </Row>
    </Container>
  )
}

export default Index
