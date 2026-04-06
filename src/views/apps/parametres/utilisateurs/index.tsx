
import UserTable from './components/UserTable'
import { Col, Container, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
// import MemberRoleCard from '@/views/apps/users/roles/components/MemberRoleCard'
import PageBreadcrumb from '@/components/PageBreadcrumb'

const Index = () => {
  const [show, toggle] = useToggle(false)
  return (
    <Container fluid>
      <PageBreadcrumb title="Gestion des utilisateurs" subtitle="paramètres" />

      <Row className="justify-content-center">
        <Col xxl={12}>
          <Row>
            <Col xs={12}>
              <UserTable />
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal show={show} onHide={toggle} className="fade" dialogClassName='modal-lg' id="editRoleModal" tabIndex={-1} aria-labelledby="editRoleModalLabel" aria-hidden="true">
        <ModalHeader>
          <h5 className="modal-title" id="editRoleModalLabel">Modifier le rôle</h5>
          <button type="button" onClick={toggle} className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </ModalHeader>
        <form id="editRoleForm">
          <ModalBody>
            <Row className="g-3">
              <Col md={6}>
                <FormLabel htmlFor="editRoleName">Nom du rôle</FormLabel>
                <FormControl type="text" id="editRoleName" defaultValue="Développeur" required />
              </Col>
              <Col md={6}>
                <FormLabel htmlFor="editRoleDescription">Description</FormLabel>
                <FormControl type="text" id="editRoleDescription" defaultValue="Construit et maintient les fonctionnalités principales de la plateforme." required />
              </Col>
              <Col xs={12}>
                <FormLabel htmlFor="editRoleResponsibilities">Responsabilités principales</FormLabel>
                <FormControl as={'textarea'} id="editRoleResponsibilities" rows={4} required defaultValue={"Maintenance du code\nIntégration API\nTests unitaires\nDéploiement de fonctionnalités"} />
                <small className="text-muted">Séparez chaque élément par une virgule ou une ligne</small>
              </Col>
              <Col md={6}>
                <FormLabel htmlFor="editRoleUsers">Assigner des utilisateurs</FormLabel>
                <select className="form-select" id="editRoleUsers" multiple>
                  <option value={1} >Leah Kim</option>
                  <option value={2} >David Tran</option>
                  <option value={3}>Michael Brown</option>
                  <option value={4}>Emma Wilson</option>
                </select>
                <small className="text-muted">Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs utilisateurs</small>
              </Col>
              <Col md={6}>
                <FormLabel htmlFor="editRoleIcon">Icône du rôle</FormLabel>
                <FormControl type="text" id="editRoleIcon" defaultValue="ti ti-code" />
                <small className="text-muted">Utilisez la classe d'icône de votre bibliothèque d'icônes</small>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={toggle} data-bs-dismiss="modal">Annuler</button>
            <button type="submit" className="btn btn-primary">Enregistrer les modifications</button>
          </ModalFooter>
        </form>
      </Modal>

    </Container>
  )
}

export default Index
