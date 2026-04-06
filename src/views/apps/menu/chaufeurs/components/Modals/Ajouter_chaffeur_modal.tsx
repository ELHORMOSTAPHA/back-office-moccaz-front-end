import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Col,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Row,
    Spinner,
    Button
} from 'react-bootstrap'
import { TbPlus } from 'react-icons/tb'
import Select from 'react-select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadEntreprises } from '@/services/entreprise'
import { addChauffeur } from '@/services/chauffeur'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Entreprise, Chauffeur } from '@/interface/gloable'
import AjouterEntrepriseModal from './Ajouter_Entreprise_modal'

// Validation Schema
const ChauffeurFormSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(1, 'Le prénom est requis').min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: z.string().min(1, "L'email est requis").email('Format d\'email invalide'),
    telephone: z.string().min(1, "Le téléphone est requis").regex(/^(\+212|0)[0-9]{9}$/, "Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)"),
    password: z.string().min(1, 'Le mot de passe est requis').min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    type_employeur: z.string(),
    id_entreprise: z.string().optional().nullable(),
    status: z.enum(["actif", "inactif", "suspendu"]).optional(),
})

type ChauffeurFormData = z.infer<typeof ChauffeurFormSchema>

type AjouterChauffeurModalProps = {
    show: boolean
    onHide: () => void
    basicOptions: Array<{ value: string; label: string }>
    onSuccess?: (newChauffeur: Chauffeur) => void
}

const AjouterChauffeurModal = ({ show, onHide, basicOptions, onSuccess }: AjouterChauffeurModalProps) => {
    const { success, error } = useNotificationModal()
    const [selectedEmployeur, setSelectedEmployeur] = useState<string>('interne')
    const [selectedEntreprise, setSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)
    const [selectedPermis, setSelectedPermis] = useState<Array<{ value: string; label: string }> | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>('actif')
    const [activeModal, setActiveModal] = useState<'chauffeur' | 'entreprise'>('chauffeur')
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<ChauffeurFormData | null>(null)
    const [savedSelectedEmployeur, setSavedSelectedEmployeur] = useState<string>('interne')
    const [savedSelectedEntreprise, setSavedSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)
    const [savedSelectedPermis, setSavedSelectedPermis] = useState<Array<{ value: string; label: string }> | null>(null)

    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChauffeurFormData>({
        mode: 'onChange',
        resolver: zodResolver(ChauffeurFormSchema),
        defaultValues: {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            password: 'password',
            type_employeur: 'interne',
            id_entreprise: null,
            status: 'actif'
        }
    })

    // Sync modal visibility with parent show prop
    useEffect(() => {
        setIsModalVisible(show)
        if (show) {
            setActiveModal('chauffeur')
        }
    }, [show])

    // Load enterprises when modal is open
    const { data: entreprisesResponse } = useQuery({
        queryKey: ["entreprises"],
        queryFn: () => LoadEntreprises({ paginated: false }),
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: show
    })

    // Transform enterprises data to select options
    const entrepriseOptions = entreprisesResponse?.data?.map((entreprise: Entreprise) => ({
        value: entreprise.id.toString(),
        label: entreprise.nom_entreprise
    })) || []

    // Add chauffeur mutation
    const addChauffeurMutation = useMutation({
        mutationFn: addChauffeur,
        onSuccess: (data) => {
            console.log('Chauffeur added successfully:', data)
            success.show('Chauffeur ajouté avec succès!')
            reset()
            setSelectedEmployeur('interne')
            setSelectedEntreprise(null)
            setSelectedPermis(null)
            setSavedFormData(null)
            setIsModalVisible(false)

            // Invalidate chauffeurs query to refresh the table
            queryClient.invalidateQueries({ queryKey: ['chauffeurs'] })

            setTimeout(() => {
                onSuccess?.(data)
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de l\'ajout du chauffeur'
            const fieldErrors = responseData?.errors || {}

            // Format field-level errors
            let errorMessage = message
            if (Object.keys(fieldErrors).length > 0) {
                const formattedErrors = Object.entries(fieldErrors)
                    .map(([_field, err]: [string, any]) => {
                        const errorText = Array.isArray(err) ? err[0] : err
                        return `• ${errorText}`
                    })
                    .join('\n')
                errorMessage = `${formattedErrors}`
            }

            // Hide the modal before showing error
            setIsModalVisible(false)

            // Show error modal
            error.show(errorMessage)
        }
    })

    const handleFormSubmit: SubmitHandler<ChauffeurFormData> = async (data) => {
        // Save form data and state before submission in case of error
        setSavedFormData(data)
        setSavedSelectedEmployeur(selectedEmployeur)
        setSavedSelectedEntreprise(selectedEntreprise)
        setSavedSelectedPermis(selectedPermis)

        // Validate external employer has enterprise selected
        if (selectedEmployeur === 'externe' && !selectedEntreprise) {
            alert('Veuillez sélectionner une entreprise pour un employeur externe')
            return
        }

        // Build chauffeur data payload
        const payload = {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            password: data.password || 'defaultPassword123',
            type_employeur: selectedEmployeur,
            status: selectedStatus,
            permis_conduit: selectedPermis?.map(p => p.value).join(', ') || '',
            ...(selectedEmployeur === 'externe' && selectedEntreprise && { id_entreprise: selectedEntreprise.value })
        }

        addChauffeurMutation.mutate(payload as any)
    }

const handleEntrepriseSuccess = (newEntreprise: Entreprise) => {
    console.log('New enterprise added:', newEntreprise)
    
    // First, set the selected entreprise immediately
    const newOption = {
        value: newEntreprise.id.toString(),
        label: newEntreprise.nom_entreprise
    }
    setSelectedEntreprise(newOption)
    
    
    // Switch back to chauffeur modal
    setActiveModal('chauffeur')
    setIsModalVisible(true)
}

    const handleModalClose = () => {
        // Reset form and state when closing
        reset()
        setSelectedEmployeur('interne')
        setSelectedEntreprise(null)
        setSelectedPermis(null)
        setSavedFormData(null)
        setIsModalVisible(false)
        setActiveModal('chauffeur')
        onHide()
    }

    const handleErrorModalClose = () => {
        // Close error modal and reopen add chauffeur modal with saved data
        error.hide()

        // Restore form data and state if it was saved
        if (savedFormData) {
            reset(savedFormData)
            setSelectedEmployeur(savedSelectedEmployeur)
            setSelectedEntreprise(savedSelectedEntreprise)
            setSelectedPermis(savedSelectedPermis)
            setIsModalVisible(true)
            setActiveModal('chauffeur')
        } else {
            handleModalClose()
        }
    }

    return (
        <>
            <ErrorModal
                show={error.isOpen}
                message={error.message}
                onHide={handleErrorModalClose}
            />

            <SuccessModal
                show={success.isOpen}
                message={success.message}
                onHide={success.hide}
                autoClose={true}
                autoCloseDelay={1500}
            />

            {activeModal === 'chauffeur' && (
                <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="addUserModal"
                    tabIndex={-1} aria-labelledby="addUserModalLabel" aria-hidden="true">
            <ModalHeader>
                <ModalTitle as={'h5'} id="addUserModalLabel">Informations du chauffeur</ModalTitle>
                <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                    aria-label="Close" />
            </ModalHeader>
            <form id="addUserForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <ModalBody>
                    <Row className="g-3">
                        <Col md={12}>
                            <Row className="g-3">
                                        <Col md={6}>
                                            <FormLabel htmlFor="nom">Nom <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="nom"
                                                placeholder="Entrer le nom"
                                                className={errors.nom ? 'is-invalid' : ''}
                                                {...register('nom')}
                                            />
                                            {errors.nom && (
                                                <div className="invalid-feedback d-block">{errors.nom.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="prenom">Prénom <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="prenom"
                                                placeholder="Entrer le prénom"
                                                className={errors.prenom ? 'is-invalid' : ''}
                                                {...register('prenom')}
                                            />
                                            {errors.prenom && (
                                                <div className="invalid-feedback d-block">{errors.prenom.message}</div>
                                            )}
                                        </Col>
                                        {/* Rest of the form fields */}
                                        <Col md={6}>
                                            <FormLabel htmlFor="telephone">Téléphone <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="tel"
                                                id="telephone"
                                                placeholder="+212 661 234 567"
                                                className={errors.telephone ? 'is-invalid' : ''}
                                                {...register('telephone')}
                                            />
                                            {errors.telephone && (
                                                <div className="invalid-feedback d-block">{errors.telephone.message}</div>
                                            )}
                                            <small className="text-muted d-block mt-1">
                                                Format: +212 661 234 567 ou 0661234567
                                            </small>
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="email">Adresse d'email <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="email"
                                                id="email"
                                                placeholder="Entrer l'email"
                                                className={errors.email ? 'is-invalid' : ''}
                                                {...register('email')}
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback d-block">{errors.email.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="password">Mot de passe <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="password"
                                                placeholder="Entrer le mot de passe"
                                                className={errors.password ? 'is-invalid' : ''}
                                                {...register('password')}
                                            />
                                            {errors.password && (
                                                <div className="invalid-feedback d-block">{errors.password.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel>Permis</FormLabel>
                                            <Select
                                                className="react-select"
                                                classNamePrefix={'react-select'}
                                                placeholder="Sélectionner les permis"
                                                isMulti
                                                options={basicOptions}
                                                value={selectedPermis}
                                                onChange={(newValue) => setSelectedPermis(newValue as any)}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="status">Statut</FormLabel>
                                            <select
                                                className="form-select"
                                                id="status"
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                            >
                                                <option value="actif">Actif</option>
                                                <option value="inactif">Inactif</option>
                                                <option value="suspendu">Suspendu</option>
                                            </select>
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userRole">Employeur <span className="text-danger">*</span></FormLabel>
                                            <select
                                                className="form-select"
                                                id="userRole"
                                                value={selectedEmployeur}
                                                onChange={(e) => {
                                                    setSelectedEmployeur(e.target.value)
                                                    setSelectedEntreprise(null)
                                                }}
                                            >
                                                <option value="interne">Interne</option>
                                                <option value="externe">Externe</option>
                                            </select>
                                        </Col>
                                        {selectedEmployeur === 'externe' && (
                                            <Col md={6}>
                                                <FormLabel htmlFor="userEmployeur">Entreprise <span className="text-danger">*</span></FormLabel>
                                                <div className="d-flex gap-1">
                                                    <div className="flex-grow-1">
                                                        <Select
                                                            className={`react-select ${selectedEntreprise === null ? 'is-invalid' : ''}`}
                                                            classNamePrefix={'react-select'}
                                                            placeholder="-- Sélectionner --"
                                                            options={entrepriseOptions}
                                                            value={selectedEntreprise}
                                                            onChange={setSelectedEntreprise}
                                                        />
                                                        {selectedEntreprise === null && (
                                                            <div className="text-danger fs-xs mt-1">Veuillez sélectionner une entreprise</div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() => {
                                                            setActiveModal('entreprise')
                                                            setIsModalVisible(false)
                                                        }}
                                                        title="Ajouter une nouvelle entreprise"
                                                        className="align-self-start"
                                                    >
                                                        <TbPlus className="me-1"/>
                                                        Ajouter
                                                    </Button>
                                                </div>
                                            </Col>
                                        )}
                            </Row>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-light" onClick={handleModalClose}
                        data-bs-dismiss="modal" disabled={isSubmitting || addChauffeurMutation.isPending}>Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || addChauffeurMutation.isPending}>
                        {isSubmitting || addChauffeurMutation.isPending ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Enregistrement...
                            </>
                        ) : (
                            'Enregistrer et continuer'
                        )}
                    </button>
                </ModalFooter>
            </form>
                </Modal>
            )}

            {activeModal === 'entreprise' && (
                <AjouterEntrepriseModal
                    show={show}
                    onHide={() => {
                        console.log('Entreprise modal closed, returning to chauffeur modal')
                        setActiveModal('chauffeur')
                        setIsModalVisible(true)
                    }}
                    onSuccess={handleEntrepriseSuccess}
                />
            )}
        </>
    )
}

export default AjouterChauffeurModal
