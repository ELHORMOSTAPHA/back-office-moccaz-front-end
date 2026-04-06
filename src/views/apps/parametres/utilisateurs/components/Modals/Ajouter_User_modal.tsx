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
    Spinner
} from 'react-bootstrap'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addutilisateur } from '@/services/ustilisateur'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Profile, User } from '@/interface/gloable'

// Validation Schema
const UserFormSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(1, 'Le prénom est requis').min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: z.string().min(1, "L'email est requis").email('Format d\'email invalide'),
    telephone: z.string().min(1, "Le téléphone est requis").regex(/^(\+212|0)[0-9]{9}$/, "Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)"),
    password: z.string().min(1, 'Le mot de passe est requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    id_profile: z.number().min(1, 'Veuillez sélectionner un profil'),
    statut: z.string(),
})

type UserFormData = z.infer<typeof UserFormSchema>

type AjouterUserModalProps = {
    show: boolean
    onHide: () => void
    profiles: Profile[]
    isLoadingProfiles: boolean
    onSuccess?: (newUser: User) => void
}

const AjouterUserModal = ({ show, onHide, profiles, isLoadingProfiles, onSuccess }: AjouterUserModalProps) => {
    const { success, error } = useNotificationModal()
    const queryClient = useQueryClient()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<UserFormData | null>(null)

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<UserFormData>({
        mode: 'onChange',
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            password: 'password123',
            id_profile: 0,
            statut: 'actif',
        }
    })

    // Sync modal visibility with parent show prop
    useEffect(() => {
        setIsModalVisible(show)
    }, [show])

    // Add user mutation
    const addUserMutation = useMutation({
        mutationFn: addutilisateur,
        onSuccess: (data) => {
            console.log('Utilisateur added successfully:', data)
            // Hide modal before showing success
            setIsModalVisible(false)
            success.show('Utilisateur ajouté avec succès!')
            reset()
            setSavedFormData(null)
            // Refetch utilisateurs list
            queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })

            setTimeout(() => {
                onSuccess?.(data)
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur'
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

    const handleFormSubmit: SubmitHandler<UserFormData> = async (data) => {
        // Save form data before submission in case of error
        setSavedFormData(data)

        // Build payload object
        const payload = {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone || '',
            password: data.password,
            id_profile: data.id_profile,
            statut: data.statut || 'actif'
        }

        addUserMutation.mutate(payload as any)
    }

    const handleModalClose = () => {
        // Reset form and state when closing
        reset()
        setSavedFormData(null)
        setIsModalVisible(false)
        onHide()
    }

    const handleErrorModalClose = () => {
        // Close error modal and reopen add user modal with saved data
        error.hide()

        // Restore form data if it was saved
        if (savedFormData) {
            reset(savedFormData)
            setIsModalVisible(true)
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

            <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="addUserModal"
                tabIndex={-1} aria-labelledby="addUserModalLabel" aria-hidden="true">
            <ModalHeader>
                <ModalTitle as={'h5'} id="addUserModalLabel">Information Utilisateur</ModalTitle>
                <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                    aria-label="Close" />
            </ModalHeader>
            <form id="addUserForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <ModalBody>
                    <Row className="g-3">
                        <Col md={12}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <FormLabel htmlFor="userLastName">Nom <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="userLastName"
                                                placeholder="Entrer le nom"
                                                className={errors.nom ? 'is-invalid' : ''}
                                                {...register('nom')}
                                            />
                                            {errors.nom && (
                                                <div className="invalid-feedback d-block">{errors.nom.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userFirstName">Prénom <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="userFirstName"
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
                                            <FormLabel htmlFor="userPhone">Téléphone<span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="tel"
                                                id="userPhone"
                                                placeholder="Entrer le téléphone"
                                                className={errors.telephone ? 'is-invalid' : ''}
                                                {...register('telephone')}
                                            />
                                            {errors.telephone && (
                                                <div className="invalid-feedback d-block">{errors.telephone.message}</div>
                                            )}
                                            <div className="form-text">
                                                Format: +212 661 234 567 ou 0661234567
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userEmail">Adresse d'email <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="email"
                                                id="userEmail"
                                                placeholder="Entrer l'email"
                                                className={errors.email ? 'is-invalid' : ''}
                                                {...register('email')}
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback d-block">{errors.email.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userPassword">Mot de passe <span className="text-danger">*</span></FormLabel>
                                            <FormControl
                                                type="text"
                                                id="userPassword"
                                                placeholder="Entrer le mot de passe"
                                                className={errors.password ? 'is-invalid' : ''}
                                                {...register('password')}
                                            />
                                            {errors.password && (
                                                <div className="invalid-feedback d-block">{errors.password.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userProfile">Profile <span className="text-danger">*</span></FormLabel>
                                            <select
                                                className={`form-select ${errors.id_profile ? 'is-invalid' : ''}`}
                                                id="userProfile"
                                                disabled={isLoadingProfiles}
                                                {...register('id_profile', { valueAsNumber: true })}
                                                defaultValue={0}
                                            >
                                                <option value={0}>Sélectionner un profile</option>
                                                {profiles
                                                    .filter((profile) => profile.id !== 2 && profile.id !== 3)
                                                    .map((profile) => (
                                                    <option key={profile.id} value={profile.id}>
                                                        {profile.nom}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.id_profile && (
                                                <div className="invalid-feedback d-block">{errors.id_profile.message}</div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <FormLabel htmlFor="userStatus">Statut <span className="text-danger">*</span></FormLabel>
                                            <select
                                                className="form-select"
                                                id="userStatus"
                                                {...register('statut')}
                                            >
                                                <option value="actif">Actif</option>
                                                <option value="inactif">Inactif</option>
                                                <option value="suspendu">Suspendu</option>
                                            </select>
                                        </Col>
                                    </Row>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-light" onClick={handleModalClose}
                        data-bs-dismiss="modal" disabled={isSubmitting || addUserMutation.isPending}>Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || addUserMutation.isPending}>
                        {isSubmitting || addUserMutation.isPending ? (
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
        </>
    )
}

export default AjouterUserModal
