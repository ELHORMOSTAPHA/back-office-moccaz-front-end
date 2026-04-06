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
import { updateProfile } from '@/services/profile'
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

type ModifierProfileModalProps = {
    show: boolean
    onHide: () => void
    selectedProfile: Profile | null
}

const ModifierProfileModal = ({ show, onHide, selectedProfile }: ModifierProfileModalProps) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<ProfileFormData | null>(null)

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProfileFormData>({
        mode: 'onChange',
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            nom: '',
            libelle: '',
            statut: 'actif',
        }
    })

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => {
            if (!selectedProfile?.id) throw new Error('Profile ID is required');
            return updateProfile(selectedProfile.id, data);
        },
        onSuccess: () => {
            console.log('Profile updated successfully')
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
            success.show('Profil modifié avec succès!')
            setIsModalVisible(false)
            setTimeout(() => {
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            console.error('Error updating profile:', errorResponse)
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de la modification du profil'
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
        if (show && selectedProfile) {
            console.log('Populating form for profile:', selectedProfile)
            setValue('nom', selectedProfile.nom || '')
            setValue('libelle', selectedProfile.libelle || '')
            setValue('statut', selectedProfile.statut || 'actif')
            setSavedFormData(null)
        }
    }, [show, selectedProfile, setValue])

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

    const handleFormSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        setSavedFormData(data)

        const profileData: any = {
            nom: data.nom,
            libelle: data.libelle,
            statut: data.statut,
        }

        updateProfileMutation.mutate(profileData)
    }

    if (!selectedProfile) {
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
                <ModalTitle as={'h5'} id="editUserModalLabel">Modifier Profile</ModalTitle>
                <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                    aria-label="Close" />
            </ModalHeader>
            <form id="editProfileForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <ModalBody>
                    <Row className="g-3">
                        <Col md={6}>
                            <FormLabel htmlFor="editProfileNom">Nom <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                type="text" 
                                id="editProfileNom" 
                                placeholder="Entrer le nom"
                                className={errors.nom ? 'is-invalid' : ''}
                                {...register('nom')}
                            />
                            {errors.nom && (
                                <div className="invalid-feedback d-block">{errors.nom.message}</div>
                            )}
                        </Col>
                        <Col md={6}>
                            <FormLabel htmlFor="editProfileLibelle">Libelle <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                type="text" 
                                id="editProfileLibelle" 
                                placeholder="Entrer le libelle"
                                className={errors.libelle ? 'is-invalid' : ''}
                                {...register('libelle')}
                            />
                            {errors.libelle && (
                                <div className="invalid-feedback d-block">{errors.libelle.message}</div>
                            )}
                        </Col>
                        <Col md={6}>
                            <FormLabel htmlFor="editProfileStatut">Statut <span className="text-danger">*</span></FormLabel>
                            <FormControl 
                                as="select" 
                                id="editProfileStatut" 
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
                        disabled={updateProfileMutation.isPending}
                        data-bs-dismiss="modal">Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? (
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

export default ModifierProfileModal
