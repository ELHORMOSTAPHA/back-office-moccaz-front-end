import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Select from 'react-select'

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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addEntreprise } from '@/services/entreprise'
import { getAllVilles } from '@/services/villeService'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Entreprise } from '@/interface/gloable'

// Validation Schema
const EntrepriseFormSchema = z.object({
    nom_entreprise: z.string().min(1, 'Le nom de l\'entreprise est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    adresse_entreprise: z.string().min(1, 'L\'adresse est requise').min(5, 'L\'adresse doit contenir au moins 5 caractères'),
    id_ville: z.string().min(1, 'La ville est requise'),
})

type EntrepriseFormData = z.infer<typeof EntrepriseFormSchema>

type AjouterEntrepriseModalProps = {
    show: boolean
    onHide: () => void
    onSuccess?: (newEntreprise: Entreprise) => void
}

const AjouterEntrepriseModal = ({ show, onHide, onSuccess }: AjouterEntrepriseModalProps) => {
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<EntrepriseFormData | null>(null)
        const queryClient = useQueryClient()

    const { register, handleSubmit,control, formState: { errors, isSubmitting }, reset } = useForm<EntrepriseFormData>({
        mode: 'onChange',
        resolver: zodResolver(EntrepriseFormSchema),
        defaultValues: {
            nom_entreprise: '',
            adresse_entreprise: '',
            id_ville: ''
        }
    })

    // Sync modal visibility with parent show prop
    useEffect(() => {
        setIsModalVisible(show)
    }, [show])

    // Load villes using useQuery
    const { data: villes = [] } = useQuery({
        queryKey: ['villes'],
        queryFn: getAllVilles,
        enabled: show
    })

    // Add entreprise mutation
    const addEntrepriseMutation = useMutation({
        mutationFn: addEntreprise,
        onSuccess: (data) => {
            console.log('Entreprise added successfully:', data)
            queryClient.invalidateQueries({ queryKey: ['entreprises'] })
            // Hide enterprise modal before showing success
            setIsModalVisible(false)
            
            // Show success modal
            success.show('Entreprise ajoutée avec succès!')
            
            // Reset form and clear saved data
            reset()
            setSavedFormData(null)
            
            // Wait for success modal to auto-close, then trigger onSuccess callback
            setTimeout(() => {
                success.hide()
                // This will return to chauffeur modal with the new entreprise selected
                // Don't call onHide() here - just call onSuccess which switches the activeModal
                onSuccess?.(data.data)
            }, 1500)
        },
        onError: (errorResponse: any) => {
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de l\'ajout de l\'entreprise'
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

    const handleFormSubmit: SubmitHandler<EntrepriseFormData> = async (data) => {
        // Save form data before submission in case of error
        setSavedFormData(data)
        
        // Create payload object
        const payload = {
            nom_entreprise: data.nom_entreprise,
            adresse_entreprise: data.adresse_entreprise,
            id_ville: data.id_ville
        }
        
        addEntrepriseMutation.mutate(payload as any)
    }

    const handleModalClose = () => {
        // Reset form and state when closing
        reset()
        setSavedFormData(null)
        setIsModalVisible(false)
        onHide()
    }

    const handleErrorModalClose = () => {
        // Close error modal and reopen add entreprise modal with saved data
        error.hide()
        
        // Restore form data if it was saved
        if (savedFormData) {
            reset(savedFormData)
            setIsModalVisible(true)
        } else {
            handleModalClose()
        }
    }

    const handleSuccessModalClose = () => {
        // This shouldn't be called due to autoClose, but just in case
        success.hide()
        console.log('Success modal closed')
        onHide();
        // After success, we can close the add entreprise modal as well and show the  modal add chauffeur
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
                onHide={handleSuccessModalClose}
                autoClose={true}
                autoCloseDelay={1500}
            />
            
            <Modal 
                show={show && isModalVisible} 
                onHide={handleModalClose} 
                className="fade" 
                dialogClassName='modal-lg' 
                id="addEntrepriseModal"
                tabIndex={-1} 
                aria-labelledby="addEntrepriseModalLabel" 
                aria-hidden="true"
            >
                <ModalHeader>
                    <ModalTitle as={'h5'} id="addEntrepriseModalLabel">Ajouter une entreprise</ModalTitle>
                    <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                        aria-label="Close" />
                </ModalHeader>
                <form id="addEntrepriseForm" onSubmit={handleSubmit(handleFormSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <Row className="g-3">
                                            <Col md={12}>
                                                <FormLabel htmlFor="nom_entreprise">Nom de l'entreprise <span className="text-danger">*</span></FormLabel>
                                                <FormControl 
                                                    type="text" 
                                                    id="nom_entreprise" 
                                                    placeholder="Entrer le nom de l'entreprise"
                                                    className={errors.nom_entreprise ? 'is-invalid' : ''}
                                                    {...register('nom_entreprise')}
                                                />
                                                {errors.nom_entreprise && (
                                                    <div className="invalid-feedback d-block">{errors.nom_entreprise.message}</div>
                                                )}
                                            </Col>
                                            <Col md={12}>
                                                <FormLabel htmlFor="adresse_entreprise">Adresse <span className="text-danger">*</span></FormLabel>
                                                <FormControl 
                                                    type="text" 
                                                    id="adresse_entreprise" 
                                                    placeholder="Entrer l'adresse"
                                                    className={errors.adresse_entreprise ? 'is-invalid' : ''}
                                                    {...register('adresse_entreprise')}
                                                />
                                                {errors.adresse_entreprise && (
                                                    <div className="invalid-feedback d-block">{errors.adresse_entreprise.message}</div>
                                                )}
                                            </Col>
                                           <Col md={12}>
    <FormLabel htmlFor="id_ville">Ville <span className="text-danger">*</span></FormLabel>
    <Controller
        name="id_ville"
        control={control}
        render={({ field }) => (
            <Select
                {...field}
                className="react-select"
                classNamePrefix={'react-select'}
                placeholder="-- Sélectionner --"
                options={villes.map((ville) => ({
                    value: ville.id.toString(),
                    label: ville.nom_ville
                }))}
                isClearable={false}
                value={villes
                    .map((ville) => ({
                        value: ville.id.toString(),
                        label: ville.nom_ville
                    }))
                    .find(option => option.value === field.value) || null}
                onChange={(option) => field.onChange(option?.value || '')}
            />
        )}
    />
    {errors.id_ville && (
        <div className="invalid-feedback d-block">{errors.id_ville.message}</div>
    )}
</Col>
                                        </Row>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-light" onClick={handleModalClose}
                            data-bs-dismiss="modal" disabled={isSubmitting || addEntrepriseMutation.isPending}>Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting || addEntrepriseMutation.isPending}>
                            {isSubmitting || addEntrepriseMutation.isPending ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2"/>
                                    Enregistrement...
                                </>
                            ) : (
                                'Enregistrer'
                            )}
                        </button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    )
}

export default AjouterEntrepriseModal