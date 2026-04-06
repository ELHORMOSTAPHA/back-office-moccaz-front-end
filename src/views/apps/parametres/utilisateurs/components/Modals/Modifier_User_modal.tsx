import { useEffect, useState } from 'react'
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
import { updateutilisateur } from '@/services/ustilisateur'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Profile, User } from '@/interface/gloable'

// Validation Schema
const UserFormSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(1, 'Le prénom est requis').min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: z.string().min(1, "L'email est requis").email('Format d\'email invalide'),
    telephone: z.string().min(1, "Le téléphone est requis").regex(/^(\+212|0)[0-9]{9}$/, "Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)"),
    id_profile: z.number().min(1, 'Veuillez sélectionner un profil'),
    statut: z.string().min(1, 'Le statut est requis').default('actif'),
    password: z.string()
        .refine(val => !val || val.length >= 6, {
            message: "Le mot de passe doit contenir au moins 6 caractères"
        })
        .optional(),
})

type UserFormData = z.infer<typeof UserFormSchema>

type ModifierUserModalProps = {
    show: boolean
    onHide: () => void
    selectedUser: User | null
    profiles: Profile[]
    isLoadingProfiles: boolean
}

const ModifierUserModal = ({ show, onHide, selectedUser, profiles, isLoadingProfiles }: ModifierUserModalProps) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<UserFormData | null>(null)

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        mode: 'onChange',
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            id_profile: 0,
            statut: 'actif',
            password: '',
        }
    } as any)

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => {
            if (!selectedUser?.id) throw new Error('User ID is required');
            return updateutilisateur(selectedUser.id, data);
        },
        onSuccess: () => {
            console.log('Utilisateur updated successfully')
            queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })
            success.show('Utilisateur modifié avec succès!')
            setIsModalVisible(false)
            setTimeout(() => {
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            console.error('Error updating utilisateur:', errorResponse)
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de la modification de l\'utilisateur'
            const fieldErrors = responseData?.errors || {}
            
            let errorMessage = message
            if (Object.keys(fieldErrors).length > 0) {
                const formattedErrors = Object.entries(fieldErrors)
                    .map(([, err]: [string, any]) => {
                        const errorText = Array.isArray(err) ? err[0] : err
                        return `• ${errorText}`
                    })
                    .join('\n')
                errorMessage = `${formattedErrors}`
            }
            
            setIsModalVisible(false)
            error.show(errorMessage)
        }
    })

    useEffect(() => {
        if (show && selectedUser) {
            console.log('Populating form for user:', selectedUser)
            setValue('nom', selectedUser.nom || '')
            setValue('prenom', selectedUser.prenom || '')
            setValue('email', selectedUser.email || '')
            setValue('telephone', selectedUser.telephone || '')
            
            // Pre-select user's current profile
            if (selectedUser.profile) {
                const profileId = typeof selectedUser.profile === 'object' ? selectedUser.profile.id : parseInt(selectedUser.profile as any)
                setValue('id_profile', profileId || 0)
            }
            
            setValue('statut', selectedUser.statut || 'actif')
            setSavedFormData(null)
        }
    }, [show, selectedUser, setValue])

    // Sync modal visibility
    useEffect(() => {
        setIsModalVisible(show)
    }, [show])

    const handleModalClose = () => {
        reset()
        setSavedFormData(null)
        setIsModalVisible(false)
        onHide()
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

    const handleFormSubmit: SubmitHandler<any> = async (data) => {
        setSavedFormData(data)

        const payload: Record<string, unknown> = {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone || '',
            id_profile: data.id_profile,
            statut: data.statut || 'actif',
        }
        if (data.password && String(data.password).trim() !== '') {
            payload.password = data.password
        }

        updateUserMutation.mutate(payload)
    }

    if (!selectedUser) {
        return null
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

            <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="editUserModal"
                tabIndex={-1} aria-labelledby="editUserModalLabel" aria-hidden="true">
            <ModalHeader>
                <ModalTitle as={'h5'} id="editUserModalLabel">Modifier Utilisateur</ModalTitle>
                <button onClick={onHide} type="button" className="btn-close" data-bs-dismiss="modal"
                    aria-label="Close" />
            </ModalHeader>
            <form id="editUserForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <ModalBody>
                    <Row className="g-3">
                        {/* Form Fields Section */}
                        <Col md={12}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserLastName">Nom <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="editUserLastName"
                                        placeholder="Entrer le nom"
                                        className={errors.nom ? 'is-invalid' : ''}
                                        {...register('nom')}
                                    />
                                    {errors.nom && (
                                        <div className="invalid-feedback d-block">{errors.nom.message as string}</div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserFirstName">Prénom <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="editUserFirstName"
                                        placeholder="Entrer le prénom"
                                        className={errors.prenom ? 'is-invalid' : ''}
                                        {...register('prenom')}
                                    />
                                    {errors.prenom && (
                                        <div className="invalid-feedback d-block">{errors.prenom.message as string}</div>
                                    )}
                                </Col>
                                 <Col md={6}>
                                    <FormLabel htmlFor="editUserPhone">Téléphone<span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="tel"
                                        id="editUserPhone"
                                        placeholder="Entrer le téléphone"
                                        className={errors.telephone ? 'is-invalid' : ''}
                                        {...register('telephone')}
                                    />
                                    {errors.telephone && (
                                        <div className="invalid-feedback d-block">{errors.telephone.message as string}</div>
                                    )}
                                    <div className="form-text">
                                                Format: +212 661 234 567 ou 0661234567
                                            </div>
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserEmail">Adresse d'email <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="email"
                                        id="editUserEmail"
                                        placeholder="Entrer l'email"
                                        className={errors.email ? 'is-invalid' : ''}
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback d-block">{errors.email.message as string}</div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserProfile">Profile <span className="text-danger">*</span></FormLabel>
                                    <select
                                        className={`form-select ${errors.id_profile ? 'is-invalid' : ''}`}
                                        id="editUserProfile"
                                        disabled={isLoadingProfiles}
                                        {...register('id_profile', { valueAsNumber: true })}
                                    >
                                        <option value="">Sélectionner un profile</option>
                                        {profiles.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.libelle}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_profile && (
                                        <div className="invalid-feedback d-block">{errors.id_profile.message as string}</div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserStatus">Statut <span className="text-danger">*</span></FormLabel>
                                    <select
                                        className="form-select"
                                        id="editUserStatus"
                                        {...register('statut')}
                                    >
                                        <option value="actif">Actif</option>
                                        <option value="inactif">Inactif</option>
                                        <option value="suspendu">Suspendu</option>
                                    </select>
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="editUserPassword">Mot de passe</FormLabel>
                                    <FormControl
                                        type="password"
                                        id="editUserPassword"
                                        placeholder="Entrer le mot de passe"
                                        className={errors.password ? 'is-invalid' : ''}
                                        {...register('password')}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">{errors.password.message as string}</div>
                                    )}
                                    <div className="form-text">
                                        Laisser vide pour conserver le mot de passe actuel
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-light" onClick={handleModalClose}
                        disabled={updateUserMutation.isPending}
                        data-bs-dismiss="modal">Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending ? (
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
        </>
    )
}

export default ModifierUserModal
