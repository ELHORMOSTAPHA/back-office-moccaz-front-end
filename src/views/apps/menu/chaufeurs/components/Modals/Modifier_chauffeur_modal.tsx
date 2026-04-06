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
    Button,
    Spinner
} from 'react-bootstrap'
import Select from 'react-select'
import { useState, useEffect, useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { updateChauffeur } from '@/services/chauffeur'
import { LoadEntreprises } from '@/services/entreprise'
import { TbPlus } from 'react-icons/tb'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Chauffeur } from '@/interface/gloable'
import AjouterEntrepriseModal from './Ajouter_Entreprise_modal'

type ModifierChauffeurModalProps = {
    show: boolean
    onHide: () => void
    selectedDriver: Chauffeur | null
    basicOptions: Array<{ value: string; label: string }>
    onSuccess?: () => void
}

const FormSchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    telephone: z.string().min(1, "Le téléphone est requis").regex(/^(\+212|0)[0-9]{9}$/, "Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)"),
    type_employeur: z.string().min(1, "Le type d'employeur est requis"),
    permis_conduit: z.string().min(1, "Le permis de conduire est requis"),
    status: z.enum(["actif", "inactif", "suspendu"]).optional(),
    password: z.string()
        .refine(val => !val || val.length >= 6, {
            message: "Le mot de passe doit contenir au moins 6 caractères"
        })
        .optional(),
})

type FormData = z.infer<typeof FormSchema>

const ModifierChauffeurModal = ({ show, onHide, selectedDriver, basicOptions, onSuccess }: ModifierChauffeurModalProps) => {
    useEffect(() => {
        console.log('Selected Driver:', selectedDriver);
    }, [selectedDriver]);
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        mode: "onChange",
        resolver: zodResolver(FormSchema),
        defaultValues: {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            type_employeur: 'interne',
            permis_conduit: '',
        }
    })

    const [selectedEmployeur, setSelectedEmployeur] = useState<string>(
        selectedDriver?.type_employeur === 'interne' ? 'interne' : 'externe'
    )
    const [selectedEntreprise, setSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)
    const [selectedPermis, setSelectedPermis] = useState<Array<{ value: string; label: string }> | null>(null)
    const [permisError, setPermisError] = useState<string>('')
    const [entrepriseError, setEntrepriseError] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('actif')
    const [activeModal, setActiveModal] = useState<'chauffeur' | 'entreprise'>('chauffeur')
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<FormData | null>(null)

    // Populate form when chauffeur data is passed
    useEffect(() => {
        if (selectedDriver && show) {
            console.log('Populating form for chauffeur:', selectedDriver)
            reset({
                nom: selectedDriver.nom || '',
                prenom: selectedDriver.prenom || '',
                email: selectedDriver.email || '',
                telephone: selectedDriver.telephone || '',
                type_employeur: selectedDriver.type_employeur || 'interne',
                permis_conduit: selectedDriver.permis_conduit || '',
                status: selectedDriver.status || 'actif',
            })

            setSelectedEmployeur(selectedDriver.type_employeur || 'interne')
            setSelectedStatus(selectedDriver.status || 'actif')

            // Parse permis_conduit from string format (e.g., "A1, C")
            if (selectedDriver.permis_conduit) {
                const permisArray = selectedDriver.permis_conduit.split(', ').map(p => ({ value: p.trim(), label: p.trim() }))
                setSelectedPermis(permisArray)
            } else {
                setSelectedPermis(null)
            }
        }
    }, [selectedDriver, show, reset])
    // Mutation for updating chauffeur
    const updateChauffeurMutation = useMutation({
        mutationFn: (data: any) => {
            if (!selectedDriver?.id) throw new Error('Driver ID is required');
            return updateChauffeur(selectedDriver.id, data);
        },
        onSuccess: () => {
            console.log('Chauffeur updated successfully')
            queryClient.invalidateQueries({ queryKey: ["chauffeurs"] })
            success.show('Chauffeur modifié avec succès!')
            onSuccess?.()
            setIsModalVisible(false)
            setTimeout(() => {
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            console.error('Error updating chauffeur:', errorResponse)
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de la modification du chauffeur'
            const fieldErrors = responseData?.errors || {}

            let errorMessage = message
            if (Object.keys(fieldErrors).length > 0) {
                const formattedErrors = Object.entries(fieldErrors)
                    .map(([, error]: [string, any]) => {
                        const errorText = Array.isArray(error) ? error[0] : error
                        return `• ${errorText}`
                    })
                    .join('\n')
                errorMessage = `${formattedErrors}`
            }

            setIsModalVisible(false)
            error.show(errorMessage)
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
    const entrepriseOptions = useMemo(() =>
        entreprisesResponse?.data?.map((entreprise: any) => ({
            value: entreprise.id.toString(),
            label: entreprise.nom_entreprise
        })) || []
        , [entreprisesResponse?.data])

    // Populate form when driver data is passed
    useEffect(() => {
        if (selectedDriver && show) {
            // Pre-select enterprise if chauffeur is externe and has an enterprise
            const entrepriseId = selectedDriver.entreprise?.id
            if (selectedDriver.type_employeur === 'externe' && entrepriseId && entrepriseOptions.length > 0) {
                const matchingEnterprise = entrepriseOptions.find(
                    option => option.value === entrepriseId.toString()
                )
                setSelectedEntreprise(matchingEnterprise || null)
            } else {
                setSelectedEntreprise(null)
            }
        }
    }, [selectedDriver, show, entrepriseOptions])

    const handleModalClose = () => {
        reset()
        setSavedFormData(null)
        setIsModalVisible(false)
        setActiveModal('chauffeur')
        onHide()
    }

    // const handleEntrepriseSuccess = (newEntreprise: any) => {
    //     console.log('New enterprise added:', newEntreprise)
    //     // queryClient.invalidateQueries({ queryKey: ['entreprises'] })
    //     // First, set the selected entreprise immediately
    //     const newOption = {
    //         value: newEntreprise.id.toString(),
    //         label: newEntreprise.nom_entreprise
    //     }

    //     setSelectedEntreprise(newOption)

    //     // Invalidate in background (don't refetch, just mark as stale)
    //     // queryClient.invalidateQueries({ queryKey: ['entreprises'] })

    //     // Switch back to chauffeur modal and make it visible
    //     setActiveModal('chauffeur')
    //     setIsModalVisible(true)
    // }
    const handleEntrepriseSuccess = async (newEntreprise: any) => {
        console.log('New enterprise added:', newEntreprise)

        // First, set the selected entreprise immediately
        const newOption = {
            value: newEntreprise.id.toString(),
            label: newEntreprise.nom_entreprise
        }
        setSelectedEntreprise(newOption)

        // Then refetch in the background
        // queryClient.refetchQueries({ queryKey: ['entreprises'] })

        // Switch back to chauffeur modal
        setActiveModal('chauffeur')
        setIsModalVisible(true)
    }

    const handleErrorModalClose = () => {
        error.hide()

        if (savedFormData) {
            reset(savedFormData)
            setIsModalVisible(true)
        } else {
            handleModalClose()
        }
    }

    const onSubmit: SubmitHandler<FormData> = async (formData) => {
        let isValid = true

        // Validate permis_conduit is selected
        if (!selectedPermis || selectedPermis.length === 0) {
            setPermisError('Le permis de conduire est requis')
            isValid = false
        } else {
            setPermisError('')
        }

        // Validate entreprise is selected if type_employeur is externe
        if (selectedEmployeur === 'externe' && !selectedEntreprise) {
            setEntrepriseError('Veuillez sélectionner une entreprise')
            isValid = false
        } else {
            setEntrepriseError('')
        }

        if (!isValid) {
            return
        }

        setSavedFormData(formData)

        // Build form data payload
        const payload = {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
            type_employeur: selectedEmployeur,
            status: selectedStatus,
            password: formData.password,
            permis_conduit: selectedPermis?.map(p => p.value).join(', ') || '',
            ...(selectedEmployeur === 'externe' && selectedEntreprise && { id_entreprise: selectedEntreprise.value })
        }

        updateChauffeurMutation.mutate(payload as any)
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
                autoCloseDelay={2000}
            />
            {activeModal === 'chauffeur' && (
                <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="editUserModal"
                    tabIndex={-1} aria-labelledby="editUserModalLabel" aria-hidden="true">
                    <ModalHeader>
                        <ModalTitle as={'h5'} id="editUserModalLabel">Modifier les informations du chauffeur</ModalTitle>
                        <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                            aria-label="Close" />
                    </ModalHeader>
                    <form id="editUserForm" onSubmit={handleSubmit(onSubmit)}>
                        <ModalBody>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Row className="g-2">
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserLastName">Nom</FormLabel>
                                            <FormControl
                                                type="text"
                                                id="editUserLastName"
                                                placeholder="Entrer le nom"
                                                className={errors.nom ? 'is-invalid' : ''}
                                                {...register('nom')}
                                            />
                                            {errors.nom && (
                                                <div className="invalid-feedback d-block">{errors.nom.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserFirstName">Prénom</FormLabel>
                                            <FormControl
                                                type="text"
                                                id="editUserFirstName"
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
                                            <FormLabel htmlFor="editUserPhone">Téléphone</FormLabel>
                                            <FormControl
                                                type="tel"
                                                id="editUserPhone"
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
                                            <FormLabel htmlFor="editUserEmail">Adresse d'email</FormLabel>
                                            <FormControl
                                                type="email"
                                                id="editUserEmail"
                                                placeholder="Entrer l'email"
                                                className={errors.email ? 'is-invalid' : ''}
                                                {...register('email')}
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback d-block">{errors.email.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserPermis">Permis <span className="text-danger">*</span></FormLabel>
                                            <Select
                                                className="react-select"
                                                classNamePrefix={'react-select'}
                                                placeholder="Sélectionner les permis"
                                                isMulti
                                                options={basicOptions}
                                                value={selectedPermis}
                                                onChange={(value) => {
                                                    setSelectedPermis(value as Array<{ value: string; label: string }>)
                                                    setPermisError('')
                                                }}
                                            />
                                            {permisError && (
                                                <div className="text-danger fs-xs mt-1">{permisError}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserStatus">Statut</FormLabel>
                                            <select
                                                className="form-select"
                                                id="editUserStatus"
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                            >
                                                <option value="actif">Actif</option>
                                                <option value="inactif">Inactif</option>
                                                <option value="suspendu">Suspendu</option>
                                            </select>
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserPassword">Password</FormLabel>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                placeholder="Entrer le mot de passe"
                                                {...register('password')}
                                            />
                                            {errors.password && (
                                                <div className="invalid-feedback d-block">{errors.password.message}</div>
                                            )}
                                            <div className="form-text">
                                                Laisser vide pour conserver le mot de passe actuel
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="editUserRole">Employeur</FormLabel>
                                            <select
                                                className="form-select"
                                                id="editUserRole"
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
                                                <FormLabel htmlFor="editUserEmployeur">Entreprise <span className="text-danger">*</span></FormLabel>
                                                <div className="d-flex gap-1">
                                                    <div className="flex-grow-1">
                                                        <Select
                                                            className="react-select"
                                                            classNamePrefix={'react-select'}
                                                            placeholder="-- Sélectionner --"
                                                            options={entrepriseOptions}
                                                            value={selectedEntreprise}
                                                            onChange={(value) => {
                                                                setSelectedEntreprise(value)
                                                                setEntrepriseError('')
                                                            }}
                                                            isClearable={false}
                                                        />
                                                        {entrepriseError && (
                                                            <div className="text-danger fs-xs mt-1">{entrepriseError}</div>
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
                                                        <TbPlus className="me-1" />
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
                                disabled={updateChauffeurMutation.isPending}
                                data-bs-dismiss="modal">Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateChauffeurMutation.isPending}
                            >
                                {updateChauffeurMutation.isPending ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Modification...
                                    </>
                                ) : (
                                    'Enregistrer les modifications'
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

export default ModifierChauffeurModal;
