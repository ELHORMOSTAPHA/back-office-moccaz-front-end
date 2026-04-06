import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, type SubmitHandler, Controller } from 'react-hook-form'
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
    Button,
    Spinner
} from 'react-bootstrap'
import { TbPlus } from 'react-icons/tb'
import Select from 'react-select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadEntreprises } from '@/services/entreprise'
import { addVehicule } from '@/services/vehicule'
import { getTypeVehicules } from '@/services/typeVehiculeService'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Entreprise, Vehicule } from '@/interface/gloable'
import AjouterEntrepriseModal from '../../../chaufeurs/components/Modals/Ajouter_Entreprise_modal'

// Validation Schema
const VehiculeFormSchema = z.object({
    numero_vehicule: z.string().min(1, 'Le numéro de véhicule est requis')
        .regex(/^EURO-\d+$/, 'Le numéro doit être au format EURO-{chiffres}'),
    immatriculation: z.string().min(1, "L'immatriculation est requise")
        .regex(/^\d{5}-[A-Z]-\d{1}$/, "Format invalide. Utilisez: 12345-A-1 (5 chiffres-1 lettre-1 chiffre)"),
    tonnage: z.string().min(1, 'Le tonnage est requis'),
    id_type_vehicule: z.string().min(1, 'Le type de véhicule est requis'),
    capacite_charge: z.string().min(1, 'La capacité de charge est requise'),
    type_proprietaire: z.string(),
    statut: z.string().refine((value) => ['actif', 'inactif'].includes(value), "Le statut est invalide"),
    id_entreprise: z.string().optional().nullable(),
})

type VehiculeFormData = z.infer<typeof VehiculeFormSchema>

type AjouterVehiculeModalProps = {
    show: boolean
    onHide: () => void
    onSuccess?: (newVehicule: Vehicule) => void
}

const AjouterVehiculeModal = ({ show, onHide, onSuccess }: AjouterVehiculeModalProps) => {
    const { success, error } = useNotificationModal()
    const [selectedEntreprise, setSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)
    const [selectedTypeVehicule, setSelectedTypeVehicule] = useState<{ value: string; label: string } | null>(null)
    const [selectedTypeProprietaire, setSelectedTypeProprietaire] = useState<{ value: string; label: string } | null>(null)
    const [selectedStatut, setSelectedStatut] = useState<{ value: string; label: string } | null>(null)
    const [activeModal, setActiveModal] = useState<'vehicule' | 'entreprise'>('vehicule')
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<VehiculeFormData | null>(null)
    const [savedSelectedEntreprise, setSavedSelectedEntreprise] = useState<{ value: string; label: string } | null>(null)

    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, control } = useForm<VehiculeFormData>({
        mode: 'onChange',
        resolver: zodResolver(VehiculeFormSchema),
        defaultValues: {
            numero_vehicule: '',
            immatriculation: '',
            tonnage: '',
            id_type_vehicule: '',
            capacite_charge: '',
            type_proprietaire: 'interne',
            statut: 'actif',
            id_entreprise: null
        }
    })

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

    const proprietaire = watch('type_proprietaire')

    // Load type vehicules when modal is open
    const { data: typeVehicules = [] } = useQuery({
        queryKey: ['typeVehicules'],
        queryFn: getTypeVehicules,
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: show
    })

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

    // Transform type vehicules data to select options
    const typeVehiculeOptions = typeVehicules?.map((type) => ({
        value: type.id.toString(),
        label: type.libelle_type_vehicule
    })) || []

    // Type proprietaire options
    const typeProprietaireOptions = [
        { value: 'interne', label: 'Interne' },
        { value: 'externe', label: 'Externe' }
    ]

    // Statut options
    const statutOptions = [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' }
    ]

    const handleEntrepriseSuccess = (newEntreprise: Entreprise) => {
        console.log('New enterprise added:', newEntreprise)
        // Auto-select the new enterprise
        setSelectedEntreprise({
            value: newEntreprise.id.toString(),
            label: newEntreprise.nom_entreprise
        })
        // Switch back to vehicule modal
        setActiveModal('vehicule')
    }
    // Add vehicule mutation
    const addVehiculeMutation = useMutation({
        mutationFn: addVehicule,
        onSuccess: (data) => {
            console.log('Véhicule added successfully:', data)
            success.show('Véhicule ajouté avec succès!')
            reset()
            setSelectedEntreprise(null)
            setSavedFormData(null)
            setIsModalVisible(false)

            // Invalidate vehicules query to refresh the table
            queryClient.invalidateQueries({ queryKey: ['vehicules'] })

            setTimeout(() => {
                onSuccess?.(data)
                onHide()
            }, 1500)
        },
        onError: (errorResponse: any) => {
            const responseData = errorResponse.response?.data
            const message = responseData?.message || 'Une erreur est survenue lors de l\'ajout du véhicule'
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

    const handleFormSubmit: SubmitHandler<VehiculeFormData> = async (data) => {
        // Save form data and state before submission in case of error
        setSavedFormData(data)
        setSavedSelectedEntreprise(selectedEntreprise)

        // Validate external type_proprietaire has enterprise selected
        if (data.type_proprietaire === 'externe' && !selectedEntreprise) {
            alert('Veuillez sélectionner une entreprise pour un propriétaire externe')
            return
        }

        // Build vehicule data
        const vehiculeData: any = {
            numero_vehicule: data.numero_vehicule,
            immatriculation: data.immatriculation,
            tonnage: data.tonnage,
            id_type_vehicule: parseInt(data.id_type_vehicule),
            capacite_charge: data.capacite_charge,
            type_proprietaire: data.type_proprietaire,
            statut: data.statut,
            id_entreprise: data.type_proprietaire === 'externe' && selectedEntreprise ? parseInt(selectedEntreprise.value) : null
        }

        addVehiculeMutation.mutate(vehiculeData)
    }

    const handleModalClose = () => {
        // Reset form and state when closing
        reset()
        setSelectedEntreprise(null)
        setSelectedTypeVehicule(null)
        setSelectedTypeProprietaire(null)
        setSelectedStatut(null)
        setSavedFormData(null)
        setIsModalVisible(false)
        onHide()
    }

    const handleErrorModalClose = () => {
        // Close error modal and reopen add vehicule modal with saved data
        error.hide()

        // Restore form data and state if it was saved
        if (savedFormData) {
            reset(savedFormData)
            setSelectedEntreprise(savedSelectedEntreprise)
            // Restore selected type vehicule
            const typeOption = typeVehiculeOptions.find(opt => opt.value === savedFormData.id_type_vehicule)
            if (typeOption) {
                setSelectedTypeVehicule(typeOption)
            }
            // Restore selected type proprietaire
            const proprietaireOption = typeProprietaireOptions.find(opt => opt.value === savedFormData.type_proprietaire)
            if (proprietaireOption) {
                setSelectedTypeProprietaire(proprietaireOption)
            }
            // Restore selected statut
            const statutOption = statutOptions.find(opt => opt.value === savedFormData.statut)
            if (statutOption) {
                setSelectedStatut(statutOption)
            }
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

            {activeModal === 'vehicule' && (
                <Modal show={show && isModalVisible} onHide={handleModalClose} className="fade" dialogClassName='modal-lg' id="addUserModal"
                    tabIndex={-1} aria-labelledby="addUserModalLabel" aria-hidden="true">
                    <ModalHeader>
                        <ModalTitle as={'h5'} id="addUserModalLabel">Information du véhicule</ModalTitle>
                        <button onClick={handleModalClose} type="button" className="btn-close" data-bs-dismiss="modal"
                            aria-label="Close" />
                    </ModalHeader>
                    <form id="addUserForm" onSubmit={handleSubmit(handleFormSubmit)}>
                        <ModalBody>
                            <Row className="g-3">
                                <Col md={6}>
                                    <FormLabel htmlFor="numero_vehicule">N° Véhicule <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="numero_vehicule"
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
                                    <FormLabel htmlFor="immatriculation">Immatriculation <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="immatriculation"
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
                                    <FormLabel htmlFor="tonnage">Tonnage <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="tonnage"
                                        placeholder="Entrer le tonnage"
                                        className={errors.tonnage ? 'is-invalid' : ''}
                                        {...register('tonnage')}
                                    />
                                    {errors.tonnage && (
                                        <div className="invalid-feedback d-block">{errors.tonnage.message}</div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="capacite_charge">Capacité de charge <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        id="capacite_charge"
                                        placeholder="Entrer la capacité de charge"
                                        className={errors.capacite_charge ? 'is-invalid' : ''}
                                        {...register('capacite_charge')}
                                    />
                                    {errors.capacite_charge && (
                                        <div className="invalid-feedback d-block">{errors.capacite_charge.message}</div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="id_type_vehicule">Type de véhicule <span className="text-danger">*</span></FormLabel>
                                    <Controller
                                        name="id_type_vehicule"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Select
                                                    {...field}
                                                    className={`react-select ${errors.id_type_vehicule ? 'is-invalid' : ''}`}
                                                    classNamePrefix={'react-select'}
                                                    placeholder="-- Sélectionner un type --"
                                                    options={typeVehiculeOptions}
                                                    value={selectedTypeVehicule}
                                                    onChange={(option) => {
                                                        setSelectedTypeVehicule(option)
                                                        field.onChange(option?.value || '')
                                                    }}
                                                    isClearable={true}
                                                />
                                                {errors.id_type_vehicule && (
                                                    <div className="text-danger fs-xs mt-1">{errors.id_type_vehicule.message}</div>
                                                )}
                                            </>
                                        )}
                                    />
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="type_proprietaire">Propriétaire <span className="text-danger">*</span></FormLabel>
                                    <Controller
                                        name="type_proprietaire"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                className="react-select"
                                                classNamePrefix={'react-select'}
                                                placeholder="-- Sélectionner --"
                                                options={typeProprietaireOptions}
                                                value={selectedTypeProprietaire}
                                                onChange={(option) => {
                                                    setSelectedTypeProprietaire(option)
                                                    field.onChange(option?.value || '')
                                                }}
                                            />
                                        )}
                                    />
                                </Col>
                                <Col md={6}>
                                    <FormLabel htmlFor="statut">Statut <span className="text-danger">*</span></FormLabel>
                                    <Controller
                                        name="statut"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                className="react-select"
                                                classNamePrefix={'react-select'}
                                                placeholder="-- Sélectionner --"
                                                options={statutOptions}
                                                value={selectedStatut}
                                                onChange={(option) => {
                                                    setSelectedStatut(option)
                                                    field.onChange(option?.value || '')
                                                }}
                                            />
                                        )}
                                    />
                                </Col>
                                {proprietaire === 'externe' && (
                                    <Col md={6}>
                                        <FormLabel htmlFor="userEmployeur">Entreprise <span className="text-danger">*</span></FormLabel>
                                        <div className="d-flex gap-2">
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
                                                onClick={() => setActiveModal('entreprise')}
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
                                data-bs-dismiss="modal" disabled={isSubmitting || addVehiculeMutation.isPending}>Annuler
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || addVehiculeMutation.isPending}>
                                {isSubmitting || addVehiculeMutation.isPending ? (
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
                    onHide={() => setActiveModal('vehicule')}
                    onSuccess={handleEntrepriseSuccess}
                />
            )}
        </>
    )
}


export default AjouterVehiculeModal
