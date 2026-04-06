import { useState } from 'react'
import { Modal, Button, Col, Form, FormControl, FormGroup, FormLabel, FormSelect, Row } from 'react-bootstrap'
import { TbPlus, TbTrash, TbSend } from 'react-icons/tb'
import Flatpickr from 'react-flatpickr'

interface Trajet {
  id: string
  villeDepart: string
  villeArrivee: string
}

interface CreateDemandeModalProps {
  show: boolean
  onHide: () => void
}

const CreateDemandeModal = ({ show, onHide }: CreateDemandeModalProps) => {
  const [trajets, setTrajets] = useState<Trajet[]>([
    {
      id: '1',
      villeDepart: '',
      villeArrivee: ''
    }
  ])

  const addTrajet = () => {
    const newTrajet: Trajet = {
      id: Date.now().toString(),
      villeDepart: '',
      villeArrivee: ''
    }
    setTrajets([...trajets, newTrajet])
  }

  const removeTrajet = (id: string) => {
    if (trajets.length > 1) {
      setTrajets(trajets.filter(trajet => trajet.id !== id))
    }
  }

  const updateTrajet = (id: string, field: keyof Trajet, value: string) => {
    setTrajets(trajets.map(trajet =>
      trajet.id === id ? { ...trajet, [field]: value } : trajet
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted', { trajets })
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Créer une Demande</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <h5 className="mb-4">Informations de la Demande</h5>

          <Row className="mb-4">
            <FormGroup as={Col} md={6}>
              <FormLabel>
                Type de Demande <span className="text-danger">*</span>
              </FormLabel>
              <FormSelect required>
                <option value="">Sélectionner un type</option>
                <option value="Transport">Transport</option>
                <option value="Messagerie">Messagerie</option>
                {/* <option value="Express">Express</option>
                <option value="Stockage">Stockage</option>
                <option value="Autre">Autre</option> */}
              </FormSelect>
            </FormGroup>

            <FormGroup as={Col} md={6}>
              <FormLabel>
                Nombre de cartons <span className="text-danger"></span>
              </FormLabel>
              <FormControl
                type="number"
                placeholder="Ex: 15"
                min="1"

              />
            </FormGroup>
          </Row>

          <Row className="mb-4">
            <FormGroup as={Col} md={4}>
              <FormLabel>
                Taille <span className="text-danger">*</span>
              </FormLabel>
              <FormSelect required>
                <option value="">Sélectionner</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </FormSelect>
            </FormGroup>

            <FormGroup as={Col} md={4}>
              <FormLabel>
                Tonnage <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="number"
                placeholder="Ex: 2.5"
                min="0"
                step="0.1"
                required
              />
              <small className="text-muted">Poids en tonnes (T)</small>
            </FormGroup>

            <FormGroup as={Col} md={4}>
              <FormLabel>
                Date d'Enlèvement <span className="text-danger">*</span>
              </FormLabel>
              <Flatpickr
                className="form-control"
                placeholder="JJ/MM/AAAA HH:MM"
                options={{
                  enableTime: true,
                  dateFormat: 'd/m/Y H:i',
                  time_24hr: true,
                  minDate: 'today'
                }}
                required
              />
            </FormGroup>
          </Row>

          <hr className="my-4" />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Trajets</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addTrajet}
              type="button"
            >
              <TbPlus className="me-1" /> Ajouter un trajet
            </Button>
          </div>

          {trajets.map((trajet, index) => (
            <div key={trajet.id} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Trajet {index + 1}</h6>
                {trajets.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeTrajet(trajet.id)}
                    type="button"
                  >
                    <TbTrash className="me-1" /> Supprimer
                  </Button>
                )}
              </div>

              <Row>
                <FormGroup as={Col} md={6}>
                  <FormLabel>
                    Ville de Départ <span className="text-danger">*</span>
                  </FormLabel>
                  <FormSelect
                    value={trajet.villeDepart}
                    onChange={(e) => updateTrajet(trajet.id, 'villeDepart', e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une ville</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Fès">Fès</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Meknès">Meknès</option>
                    <option value="Oujda">Oujda</option>
                    <option value="Kénitra">Kénitra</option>
                    <option value="Tétouan">Tétouan</option>
                    <option value="Témara">Témara</option>
                    <option value="Safi">Safi</option>
                    <option value="Mohammedia">Mohammedia</option>
                    <option value="Khouribga">Khouribga</option>
                    <option value="El Jadida">El Jadida</option>
                    <option value="Béni Mellal">Béni Mellal</option>
                    <option value="Nador">Nador</option>
                    <option value="Taza">Taza</option>
                    <option value="Settat">Settat</option>
                  </FormSelect>
                </FormGroup>

                <FormGroup as={Col} md={6}>
                  <FormLabel>
                    Ville d'Arrivée <span className="text-danger">*</span>
                  </FormLabel>
                  <FormSelect
                    value={trajet.villeArrivee}
                    onChange={(e) => updateTrajet(trajet.id, 'villeArrivee', e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une ville</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Fès">Fès</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Meknès">Meknès</option>
                    <option value="Oujda">Oujda</option>
                    <option value="Kénitra">Kénitra</option>
                    <option value="Tétouan">Tétouan</option>
                    <option value="Témara">Témara</option>
                    <option value="Safi">Safi</option>
                    <option value="Mohammedia">Mohammedia</option>
                    <option value="Khouribga">Khouribga</option>
                    <option value="El Jadida">El Jadida</option>
                    <option value="Béni Mellal">Béni Mellal</option>
                    <option value="Nador">Nador</option>
                    <option value="Taza">Taza</option>
                    <option value="Settat">Settat</option>
                  </FormSelect>
                </FormGroup>
              </Row>
            </div>
          ))}

          <hr className="my-4" />

          <h5 className="mb-3">État et Suivi</h5>
          <Row className="mb-4">
            <FormGroup as={Col} md={6}>
              <FormLabel>Manutention</FormLabel>
              <FormSelect>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </FormSelect>
            </FormGroup>

            <FormGroup as={Col} md={6}>
              <FormLabel>Retour</FormLabel>
              <FormSelect>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </FormSelect>
            </FormGroup>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            <TbSend className="me-1" /> Soumettre la demande
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateDemandeModal
