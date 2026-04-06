import { Modal, Button, Row, Col } from 'react-bootstrap'
import type { DepotViewClient } from '@/interface/gloable'

type ViewDepotModalProps = {
    show: boolean
    onHide: () => void
    selectedDepotClient: DepotViewClient | null
}

const ViewDepotModal = ({ show, onHide, selectedDepotClient }: ViewDepotModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Dépôts assignés - {selectedDepotClient?.prenom} {selectedDepotClient?.nom}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedDepotClient && selectedDepotClient.depots && selectedDepotClient.depots.length > 0 ? (
                    <div>
                        <h6 className="mb-3 fw-semibold">Informations Client</h6>
                        <Row className="mb-4">
                            <Col md={6}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-muted">
                                        Nom
                                    </label>
                                    <p className="fs-base">{selectedDepotClient.prenom} {selectedDepotClient.nom}</p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-muted">
                                        Type
                                    </label>
                                    <p className="fs-base">
                                        <span className={`badge ${selectedDepotClient.type_client === 'Société' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                                            {selectedDepotClient.type_client}
                                        </span>
                                    </p>
                                </div>
                            </Col>
                        </Row>

                        <h6 className="mb-3 fw-semibold">Dépôts Assignés</h6>
                        <div className="list-group">
                            {selectedDepotClient.depots.map((depot, idx) => {
                                return (
                                    <div key={idx} className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 className="mb-1">{depot?.nom_depot || "depotName"}</h6>
                                                <p className="text-muted mb-0 fs-xs">
                                                    <i className="bi bi-geo-alt"></i> {depot?.ville_depot || 'Ville non spécifiée'}
                                                </p>
                                            </div>
                                            <span className="badge bg-success-subtle text-success">{depot?.id}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning mb-0">
                        <strong>Aucun dépôt assigné</strong>
                        <p className="mb-0 mt-2">Ce client n'a pas de dépôt assigné.</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    className='btn-danger'
                >
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ViewDepotModal
