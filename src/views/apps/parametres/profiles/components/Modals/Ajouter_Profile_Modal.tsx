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
import { addProfile } from '@/services/profile'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Profile } from '@/interface/gloable'

// Validation Schema
const ProfileFormSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    libelle: z.string().min(1, 'Le libellé est requis').min(2, 'Le libellé doit contenir au moins 2 caractères'),
    statut: z.string().refine((value) => ['actif', 'inactif'].includes(value), {
        message: 'Le statut doit être actif ou inactif'
    }),
})

type ProfileFormData = z.infer<typeof ProfileFormSchema>

type AjouterProfileModalProps = {
    show: boolean
    onHide: () => void
    onSuccess?: (newProfile: Profile) => void
}

const AjouterProfileModal = ({ show, onHide, onSuccess }: AjouterProfileModalProps) => {
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<ProfileFormData | null>(null)
    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
        mode: 'onChange',
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            nom: '',
            libelle: '',
            statut: 'actif',
        }
    })

    // Sync modal visibility with parent show prop
    useEffect(() => {
        setIsModalVisible(show)
    }, [show])

    // Add profile mutation
    const addProfileMutation = useMutation({
        mutationFn: addProfile,
        onSuccess: (data) => {
            console.log('Profile added successfully:', data)
            // Hide modal before showing success
            setIsModalVisible(false)
            success.show('Profile ajouté avec succès!')
            reset()
            setSavedFormData(null)
            // Refetch profiles list
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
            
            setTimeout(() => {
                onSuccess?.(data)
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de l\'ajout du profil'
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

    const handleFormSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        // Save form data before submission in case of error
        setSavedFormData(data)
        
        // Build profile data
        const profileData: Partial<Profile> = {
            nom: data.nom,
            libelle: data.libelle,
            statut: data.statut,
        }

        addProfileMutation.mutate(profileData)
    }

    const handleModalClose = () => {
        // Reset form and state when closing
        reset()
        setSavedFormData(null)
        setIsModalVisible(false)
        onHide()
    }

    const handleErrorModalClose = () => {
        // Close error modal and reopen add profile modal with saved data
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
                <ModalTitle as={'h5'} id="addUserModalLabel">Nouveau Profile</ModalTitle>
                <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                    aria-label="Close" />
            </ModalHeader>
            <form id="addUserForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <ModalBody>
                    <Row className="g-3">
                        <Col md={6}>
                            <FormLabel htmlFor="profileName">Nom <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                type="text" 
                                id="profileName" 
                                placeholder="Entrer le nom"
                                className={errors.nom ? 'is-invalid' : ''}
                                {...register('nom')}
                            />
                            {errors.nom && (
                                <div className="invalid-feedback d-block">{errors.nom.message}</div>
                            )}
                        </Col>
                        <Col md={6}>
                            <FormLabel htmlFor="profileLibelle">Libellé <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                type="text" 
                                id="profileLibelle" 
                                placeholder="Entrer le libellé"
                                className={errors.libelle ? 'is-invalid' : ''}
                                {...register('libelle')}
                            />
                            {errors.libelle && (
                                <div className="invalid-feedback d-block">{errors.libelle.message}</div>
                            )}
                        </Col>
                        <Col md={6}>
                            <FormLabel htmlFor="profileStatut">Statut <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                as="select" 
                                id="profileStatut" 
                                className={errors.statut ? 'is-invalid' : ''}
                                {...register('statut')}
                            >
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </FormControl>
                            {errors.statut && (
                                <div className="invalid-feedback d-block">{errors.statut.message}</div>
                            )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-light" onClick={handleModalClose}
                        data-bs-dismiss="modal" disabled={isSubmitting || addProfileMutation.isPending}>Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || addProfileMutation.isPending}>
                        {isSubmitting || addProfileMutation.isPending ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Enregistrement...
                            </>
                        ) : (
                            'Ajouter Profile'
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
        </>
    )
}

export default AjouterProfileModal
