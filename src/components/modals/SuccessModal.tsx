import { Modal, Button } from 'react-bootstrap'
import { TbCircleCheck } from 'react-icons/tb'

interface SuccessModalProps {
  show: boolean
  message: string | null
  onHide: () => void
  title?: string
  autoClose?: boolean
  autoCloseDelay?: number
}

const SuccessModal = ({
  show,
  message,
  onHide,
  title = 'Succès',
  autoClose = false,
  autoCloseDelay = 2000
}: SuccessModalProps) => {

  // Auto-close functionality
  if (autoClose && show) {
    setTimeout(() => {
      onHide()
    }, autoCloseDelay)
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-success">
          <TbCircleCheck size={24} className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="success" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SuccessModal
