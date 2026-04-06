import {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router'
import {Button, Card, CardBody, CardHeader, Col, Form, Row} from 'react-bootstrap'
import {TbArrowLeft, TbDeviceFloppy} from 'react-icons/tb'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import {clients} from '@/views/apps/invoice/invoices/data'

const EditClient = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        raisonSociale: '',
        tel: '',
        email: '',
        status: 'Actif'
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [clientNotFound, setClientNotFound] = useState(false)

    useEffect(() => {
        // Load client data
        const loadClient = () => {
            if (!id) {
                setClientNotFound(true)
                setIsLoading(false)
                return
            }

            const client = clients.find(c => c.id === id)
            if (client) {
                setFormData({
                    nom: client.nom,
                    prenom: client.prenom,
                    raisonSociale: client.raisonSociale,
                    tel: client.tel,
                    email: client.email,
                    status: client.status
                })
            } else {
                setClientNotFound(true)
            }
            setIsLoading(false)
        }

        loadClient()
    }, [id])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nom.trim()) {
            newErrors.nom = 'Le nom est requis'
        }

        if (!formData.prenom.trim()) {
            newErrors.prenom = 'Le prénom est requis'
        }

        if (!formData.raisonSociale.trim()) {
            newErrors.raisonSociale = 'La raison sociale est requise'
        }

        if (!formData.tel.trim()) {
            newErrors.tel = 'Le téléphone est requis'
        } else if (!/^(\+212|0)[0-9]{9}$/.test(formData.tel.replace(/\s/g, ''))) {
            newErrors.tel = 'Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updatedClient = {
                id,
                ...formData,
                dateInscription: clients.find(c => c.id === id)?.dateInscription || new Date().toISOString().split('T')[0],
            }

            console.log('Client updated:', updatedClient)
            
            // Show success message (you can replace with toast notification)
            alert('Client modifié avec succès!')
            
            // Navigate back to clients list
            navigate('/clients')
        } catch (error) {
            console.error('Error updating client:', error)
            alert('Erreur lors de la modification du client')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/clients')
    }

    if (isLoading) {
        return (
            <>
                <PageBreadcrumb
                    title="Modifier Client"
                    subtitle="Clients"
                />
                <Card>
                    <CardBody className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3 text-muted">Chargement des données du client...</p>
                    </CardBody>
                </Card>
            </>
        )
    }

    if (clientNotFound) {
        return (
            <>
                <PageBreadcrumb
                    title="Modifier Client"
                    subtitle="Clients"
                />
                <Card>
                    <CardBody className="text-center py-5">
                        <h5 className="text-danger">Client non trouvé</h5>
                        <p className="text-muted">Le client demandé n'existe pas ou a été supprimé.</p>
                        <Button variant="primary" onClick={handleCancel}>
                            Retour à la liste
                        </Button>
                    </CardBody>
                </Card>
            </>
        )
    }

    return (
        <>
            <PageBreadcrumb
                title="Modifier Client"
                subtitle="Clients"
            />

            <Card>
                <CardHeader className="border-light">
                    <div className="d-flex align-items-center gap-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={handleCancel}
                            className="btn-icon"
                        >
                            <TbArrowLeft className="fs-lg"/>
                        </Button>
                        <h5 className="mb-0">Modifier les informations du client #{id}</h5>
                    </div>
                </CardHeader>

                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="prenom" className="form-label">
                                        Prénom <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.prenom ? 'is-invalid' : ''}`}
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        placeholder="Entrez le prénom"
                                    />
                                    {errors.prenom && (
                                        <div className="invalid-feedback">{errors.prenom}</div>
                                    )}
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="nom" className="form-label">
                                        Nom <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        placeholder="Entrez le nom"
                                    />
                                    {errors.nom && (
                                        <div className="invalid-feedback">{errors.nom}</div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="mb-3">
                            <label htmlFor="raisonSociale" className="form-label">
                                Raison Sociale <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.raisonSociale ? 'is-invalid' : ''}`}
                                id="raisonSociale"
                                name="raisonSociale"
                                value={formData.raisonSociale}
                                onChange={handleInputChange}
                                placeholder="Ex: Société de Transport SARL, Auto-Entrepreneur, etc."
                            />
                            {errors.raisonSociale && (
                                <div className="invalid-feedback">{errors.raisonSociale}</div>
                            )}
                        </div>

                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="tel" className="form-label">
                                        Téléphone <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={`form-control ${errors.tel ? 'is-invalid' : ''}`}
                                        id="tel"
                                        name="tel"
                                        value={formData.tel}
                                        onChange={handleInputChange}
                                        placeholder="+212 661 234 567"
                                    />
                                    {errors.tel && (
                                        <div className="invalid-feedback">{errors.tel}</div>
                                    )}
                                    <div className="form-text">
                                        Format: +212 661 234 567 ou 0661234567
                                    </div>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="exemple@entreprise.com"
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <label htmlFor="status" className="form-label">
                                Statut
                            </label>
                            <select
                                className="form-select"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="Actif">Actif</option>
                                <option value="Inactif">Inactif</option>
                                <option value="En attente">En attente</option>
                                <option value="Suspendu">Suspendu</option>
                            </select>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Modification...
                                    </>
                                ) : (
                                    <>
                                        <TbDeviceFloppy className="fs-lg me-1"/>
                                        Modifier le Client
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </>
    )
}

export default EditClient
