import { useState, useEffect, useMemo } from 'react'
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
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { updateVehicule } from '@/services/vehicule'
import { LoadEntreprises } from '@/services/entreprise'
import { getTypeVehicules } from '@/services/typeVehiculeService'
import { TbPlus } from 'react-icons/tb'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Vehicule } from '@/interface/gloable'
import AjouterEntrepriseModal from '../../../chaufeurs/components/Modals/Ajouter_Entreprise_modal'

type ModifierVehiculeModalProps = {
    show: boolean
    onHide: () => void
    selectedCar: Vehicule | null
    onSuccess?: () => void
}

const FormSchema = z.object({
    numero_vehicule: z.string().min(1, "Le numéro de véhicule est requis")
        .regex(/^EURO-\d+$/, 'Le numéro doit être au format EURO-{chiffres}'),
    immatriculation: z.string().min(1, "L'immatriculation est requise")
        .regex(/^\d{5}-[A-Z]-\d{1}$/, "Format invalide. Utilisez: 12345-A-1 (5 chiffres-1 lettre-1 chiffre)"),
    tonnage: z.string().min(1, "Le tonnage est requis"),
    id_type_vehicule: z.string().min(1, "Le type de véhicule est requis"),
    type_proprietaire: z.string().min(1, "Le type de propriétaire est requis"),
    statut: z.string().refine((value) => ['actif', 'inactif'].includes(value), "Le statut est invalide"),
})

type FormData = z.infer<typeof FormSchema>

const ModifierVehiculeModal = ({ show, onHide, selectedCar, onSuccess }: ModifierVehiculeModalProps) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        mode: "onChange",
        resolver: zodResolver(FormSchema),
        defaultValues: {
            numero_vehicule: '',
            immatriculation: '',
            tonnage: '',
            id_type_vehicule: '',
            type_proprietaire: 'interne',
            statut: 'actif',
        }
    })

    const [editOwner, setEditOwner] = useState("interne")
    const [editStatut, setEditStatut] = useState("actif")
    const [selectedTypeVehicule, setSelectedTypeVehicule] = useState<string>('')
    const [selectedEntreprise, setSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)
    const [entrepriseError, setEntrepriseError] = useState<string>('')
    const [activeModal, setActiveModal] = useState<'vehicule' | 'entreprise'>('vehicule')
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<FormData | null>(null)

    // Mutation for updating vehicule
    const updateVehiculeMutation = useMutation({
        mutationFn: (data: any) => {
            if (!selectedCar?.id) throw new Error('Vehicle ID is required');
            return updateVehicule(selectedCar.id, data);
        },
        onSuccess: () => {
            console.log('Véhicule updated successfully')
            queryClient.invalidateQueries({ queryKey: ["vehicules"] })
            success.show('Véhicule modifié avec succès!')
            onSuccess?.()
            setIsModalVisible(false)
            setTimeout(() => {
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            console.error('Error updating vehicule:', errorResponse)
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de la modification du véhicule'
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

    // Populate form when vehicule data is passed
    useEffect(() => {
        if (selectedCar && show) {
            console.log('Populating form for vehicule:', selectedCar)
            reset({
                numero_vehicule: selectedCar.numero_vehicule || '',
                immatriculation: selectedCar.immatriculation || '',
                tonnage: String(selectedCar.tonnage) || '',
                id_type_vehicule: String(selectedCar.type_vehicule?.id || '') || '',
                type_proprietaire: selectedCar.type_proprietaire || 'interne',
                statut: selectedCar.statut || 'actif',
            })
            
            setEditOwner(selectedCar.type_proprietaire || 'interne')
            setEditStatut(selectedCar.statut || 'actif')
            setSavedFormData(null)
        }
    }, [selectedCar, show, reset])
   // Load type vehicules when modal is open
    const { data: typeVehicules = [] } = useQuery({
        queryKey: ['typeVehicules'],
        queryFn: getTypeVehicules,
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: show
    })
    // Pre-select type vehicule after typeVehicules data loads (similar to enterprise selection)
    useEffect(() => {
        if (selectedCar && show) {
            const typeVehiculeId = selectedCar.type_vehicule?.id
            if (typeVehiculeId && typeVehicules.length > 0) {
                const matchingType = typeVehicules.find(
                    type => type.id === typeVehiculeId || type.id.toString() === typeVehiculeId.toString()
                )
                if (matchingType) {
                    setSelectedTypeVehicule(matchingType.id.toString())
                }
            }
        }
    }, [selectedCar, show, typeVehicules])

    // Format numero_vehicule to ensure EURO- prefix
    const handleNumeroVehiculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        // Remove EURO- if present, then add it back
        if (value.startsWith('EURO-')) {
            value = value.substring(5)
        }
        // Only allow digits after EURO-
        value = value.replace(/[^0-9]/g, '')
        const finalValue = value ? `EURO-${value}` : 'EURO-'
        // Update the field value
        e.target.value = finalValue
        register('numero_vehicule').onChange(e)
    }

    // Format immatriculation to: 5 digits-1 letter-1 digit with proper backspace support
    const handleImmatriculationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase()
        
        // Remove dashes to work with pure characters
        let cleanValue = value.replace(/[^0-9A-Z]/g, '')
        
        let formatted = ''
        
        // Extract digits, letters, and final digit
        let digitCount = 0
        let letterCount = 0
        let finalDigitCount = 0
        
        for (let i = 0; i < cleanValue.length; i++) {
            const char = cleanValue[i]
            
            // First 5 must be digits
            if (digitCount < 5 && /[0-9]/.test(char)) {
                formatted += char
                digitCount++
            }
            // Next 1 must be letter (only if we have 5 digits)
            else if (digitCount === 5 && letterCount === 0 && /[A-Z]/.test(char)) {
                formatted += '-' + char
                letterCount++
            }
            // Last 1 must be digit (only if we have letter)
            else if (digitCount === 5 && letterCount === 1 && finalDigitCount === 0 && /[0-9]/.test(char)) {
                formatted += '-' + char
                finalDigitCount++
            }
        }
        
        e.target.value = formatted
        register('immatriculation').onChange(e)
    }

    // Sync modal visibility with parent show prop
    useEffect(() => {
        setIsModalVisible(show)
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

    // Pre-select enterprise if vehicule is externe and has an enterprise
    useEffect(() => {
        if (selectedCar && show) {
            const entrepriseId = selectedCar.entreprise?.id
            if (selectedCar.type_proprietaire === 'externe' && entrepriseId && entrepriseOptions.length > 0) {
                const matchingEnterprise = entrepriseOptions.find(
                    option => option.value === entrepriseId.toString()
                )
                setSelectedEntreprise(matchingEnterprise || null)
            } else {
                setSelectedEntreprise(null)
            }
        }
    }, [selectedCar, show, entrepriseOptions])

    const handleModalClose = () => {
        reset()
        setSelectedEntreprise(null)
        setSavedFormData(null)
        setIsModalVisible(false)
        setActiveModal('vehicule')
        onHide()
    }

    const handleEntrepriseSuccess = (newEntreprise: any) => {
        console.log('New enterprise added:', newEntreprise)
        // Refetch enterprises
        queryClient.invalidateQueries({ queryKey: ['entreprises'] })
        // Auto-select the new enterprise
        setSelectedEntreprise({
            value: newEntreprise.id.toString(),
            label: newEntreprise.nom_entreprise
        })
        // Switch back to vehicule modal and make it visible
        setActiveModal('vehicule')
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

        // Validate entreprise is selected if type_proprietaire is externe
        if (editOwner === 'externe' && !selectedEntreprise) {
            setEntrepriseError('Veuillez sélectionner une entreprise')
            isValid = false
        } else {
            setEntrepriseError('')
        }

        if (!isValid) {
            return
        }

        setSavedFormData(formData)

        const payload = {
            ...formData,
            numero_vehicule: formData.numero_vehicule.startsWith('EURO-') ? formData.numero_vehicule : `EURO-${formData.numero_vehicule}`,
            id_type_vehicule: parseInt(selectedTypeVehicule),
            type_proprietaire: editOwner,
            statut: editStatut,
            id_entreprise: editOwner === 'externe' && selectedEntreprise ? parseInt(selectedEntreprise.value) : null
        }

        updateVehiculeMutation.mutate(payload)
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

            <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="editCarModal"
                tabIndex={-1} aria-labelledby="editCarModalLabel" aria-hidden="true">
                <ModalHeader>
                    <ModalTitle as={'h5'} id="editCarModalLabel">Modifier le véhicule</ModalTitle>
                    <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                        aria-label="Close" />
                </ModalHeader>
                <form id="editCarForm" onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={6}>
                                <FormLabel htmlFor="edit_num_vehicule">N° Véhicule <span className="text-danger">*</span></FormLabel>
                                <FormControl
                                    type="text"
                                    id="edit_num_vehicule"
                                    placeholder="EURO-"
                                    className={errors.numero_vehicule ? 'is-invalid' : ''}
                                    {...register('numero_vehicule', {
                                        onChange: handleNumeroVehiculeChange
                                    })}
                                />
                                {errors.numero_vehicule && (
                                    <div className="invalid-feedback d-block">{errors.numero_vehicule.message}</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <FormLabel htmlFor="edit_immatriculation">Immatriculation <span className="text-danger">*</span></FormLabel>
                                <FormControl
                                    type="text"
                                    id="edit_immatriculation"
                                    placeholder="12345-A-1"
                                    className={errors.immatriculation ? 'is-invalid' : ''}
                                    {...register('immatriculation', {
                                        onChange: handleImmatriculationChange
                                    })}
                                    maxLength={9}
                                />
                                {errors.immatriculation && (
                                    <div className="invalid-feedback d-block">{errors.immatriculation.message}</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <FormLabel htmlFor="edit_tonnage">Tonnage <span className="text-danger">*</span></FormLabel>
                                <FormControl
                                    type="text"
                                    id="edit_tonnage"
                                    placeholder="Entrer le tonnage"
                                    className={errors.tonnage ? 'is-invalid' : ''}
                                    {...register('tonnage')}
                                />
                                {errors.tonnage && (
                                    <div className="invalid-feedback d-block">{errors.tonnage.message}</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <FormLabel htmlFor="edit_type_vehicule">Type de véhicule <span className="text-danger">*</span></FormLabel>
                                <select
                                    className={`form-select ${errors.id_type_vehicule ? 'is-invalid' : ''}`}
                                    id="edit_type_vehicule"
                                    value={selectedTypeVehicule}
                                    {...register('id_type_vehicule', {
                                        onChange: (e) => setSelectedTypeVehicule(e.target.value)
                                    })}
                                >
                                    <option value="">Sélectionner un type</option>
                                    {typeVehicules.map((type) => (
                                        <option key={type.id} value={type.id.toString()}>
                                            {type.libelle_type_vehicule}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_type_vehicule && (
                                    <div className="invalid-feedback d-block">{errors.id_type_vehicule.message}</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <FormLabel htmlFor="edit_proprietaire">Propriétaire <span className="text-danger">*</span></FormLabel>
                                <select
                                    className="form-select"
                                    id="edit_proprietaire"
                                    value={editOwner}
                                    onChange={(e) => {
                                        setEditOwner(e.target.value)
                                        setEntrepriseError('')
                                    }}
                                >
                                    <option value="interne">Interne</option>
                                    <option value="externe">Externe</option>
                                </select>
                            </Col>
                            <Col md={6}>
                                <FormLabel htmlFor="edit_statut">Statut <span className="text-danger">*</span></FormLabel>
                                <select
                                    className="form-select"
                                    id="edit_statut"
                                    value={editStatut}
                                    onChange={(e) => setEditStatut(e.target.value)}
                                >
                                    <option value="actif">Actif</option>
                                    <option value="inactif">Inactif</option>
                                </select>
                            </Col>
                            {editOwner === "externe" && (
                                <Col md={6}>
                                    <FormLabel htmlFor="edit_entreprise">Entreprise <span className="text-danger">*</span></FormLabel>
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
                                            <TbPlus className="me-1"/>
                                            Ajouter
                                        </Button>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-light" onClick={handleModalClose}
                            disabled={updateVehiculeMutation.isPending}
                            data-bs-dismiss="modal">Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={updateVehiculeMutation.isPending}
                        >
                            {updateVehiculeMutation.isPending ? (
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

            {activeModal === 'entreprise' && (
                <AjouterEntrepriseModal
                    show={show}
                    onHide={() => {
                        console.log('Entreprise modal closed, returning to vehicule modal')
                        setActiveModal('vehicule')
                        setIsModalVisible(true)
                    }}
                    onSuccess={handleEntrepriseSuccess}
                />
            )}
        </>
    )
}

export default ModifierVehiculeModal
