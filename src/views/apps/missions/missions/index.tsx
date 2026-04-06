import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import Missions from './components/Missions.tsx'

const Index = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Liste des missions" subtitle="Demandes" />

      <Row>
        <Col cols={12}>
          <Missions />
        </Col>
      </Row>
    </Container>
  )
}

export default Index
