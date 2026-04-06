import { Modal, Button } from 'react-bootstrap'
import { TbAlertTriangle } from 'react-icons/tb'

interface ErrorModalProps {
  show: boolean
  message: string | null
  onHide: () => void
  title?: string
}

const ErrorModal = ({ show, message, onHide, title = 'Erreur' }: ErrorModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-danger">
          <TbAlertTriangle size={24} className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="danger" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ErrorModal
