import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Row,
    Col,
    Spinner,
} from 'react-bootstrap'
import Select from 'react-select'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createDemandeReservation,
    type CreateDemandeReservationPayload,
} from '@/services/demandeReservation'
import { loadAllStocks } from '@/services/stock'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'

type Props = {
    show: boolean
    onHide: () => void
    onSuccess?: () => void
}

const FormSchema = z.object({
    id_demande: z.string().max(45).optional(),
    nom_commercial: z.string().max(45).optional(),
    id_commercial: z.string().max(45).optional(),
    demande_infos: z.string().max(45).optional(),
    statut: z.string().max(45).optional(),
})

type FormData = z.infer<typeof FormSchema>

const defaultFormValues: FormData = {
    id_demande: '',
    nom_commercial: '',
    id_commercial: '',
    demande_infos: '',
    statut: '',
}

const AddDemandeReservationModal = ({ show, onHide, onSuccess }: Props) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<FormData | null>(null)
    const [stockOption, setStockOption] = useState<{ value: string; label: string } | null>(null)
    const [stockError, setStockError] = useState('')

    const { register, handleSubmit, reset } = useForm<FormData>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: defaultFormValues,
    })

    const { data: stocks = [], isLoading: stocksLoading } = useQuery({
        queryKey: ['stocks', 'all'],
        queryFn: loadAllStocks,
        staleTime: 60_000,
        enabled: show,
    })

    const stockOptions = useMemo(
        () =>
            stocks.map((s) => ({
                value: String(s.id),
                label:
                    [s.marque, s.modele, s.vin].filter(Boolean).join(' · ') || `Stock #${s.id}`,
            })),
        [stocks],
    )

    const createMutation = useMutation({
        mutationFn: (payload: CreateDemandeReservationPayload) => createDemandeReservation(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demande_reservation'] })
            success.show('Demande de réservation créée.')
            reset(defaultFormValues)
            setStockOption(null)
            setStockError('')
            setSavedFormData(null)
            onSuccess?.()
            setIsModalVisible(false)
            setTimeout(() => onHide(), 1500)
        },
        onError: (errorResponse: unknown) => {
            const err = errorResponse as {
                response?: { data?: { message?: string; errors?: Record<string, string[]> } }
            }
            const responseData = err.response?.data
            const message = responseData?.message ?? 'Une erreur est survenue.'
            const fieldErrors = responseData?.errors ?? {}
            let errorMessage = message
            if (Object.keys(fieldErrors).length > 0) {
                errorMessage = Object.entries(fieldErrors)
                    .map(([, v]) => `• ${Array.isArray(v) ? v[0] : v}`)
                    .join('\n')
            }
            setIsModalVisible(false)
            error.show(errorMessage)
        },
    })

    useEffect(() => {
        setIsModalVisible(show)
    }, [show])

    useEffect(() => {
        if (!show) return
        reset(defaultFormValues)
        setStockOption(null)
        setStockError('')
        setSavedFormData(null)
    }, [show, reset])

    const handleModalClose = () => {
        reset(defaultFormValues)
        setStockOption(null)
        setStockError('')
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

    const trim = (s: string | undefined) => {
        const t = (s ?? '').trim()
        return t === '' ? null : t
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        if (!stockOption) {
            setStockError('Choisissez un véhicule (stock).')
            return
        }
        setStockError('')
        setSavedFormData(formData)
        const idCommRaw = (formData.id_commercial ?? '').trim()
        const idCommNum = idCommRaw === '' ? NaN : Number(idCommRaw)
        const payload: CreateDemandeReservationPayload = {
            stock_id: Number(stockOption.value),
            id_demande: trim(formData.id_demande),
            nom_commercial: trim(formData.nom_commercial),
            id_commercial: Number.isNaN(idCommNum) ? null : idCommNum,
            demande_infos: trim(formData.demande_infos),
            statut: trim(formData.statut),
        }
        createMutation.mutate(payload)
    }

    return (
        <>
            <ErrorModal show={error.isOpen} message={error.message} onHide={handleErrorModalClose} />
            <SuccessModal
                show={success.isOpen}
                message={success.message}
                onHide={success.hide}
                autoClose
                autoCloseDelay={2000}
            />

            <Modal
                show={show && isModalVisible}
                onHide={handleModalClose}
                centered
                size="lg"
                backdrop="static"
            >
                <ModalHeader closeButton>
                    <ModalTitle>Nouvelle demande de réservation</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <FormLabel>
                                    Véhicule (stock) <span className="text-danger">*</span>
                                </FormLabel>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder={stocksLoading ? 'Chargement…' : 'Sélectionner…'}
                                    isLoading={stocksLoading}
                                    options={stockOptions}
                                    value={stockOption}
                                    onChange={(opt) => {
                                        setStockOption(opt)
                                        setStockError('')
                                    }}
                                />
                                {stockError ? <div className="text-danger small mt-1">{stockError}</div> : null}
                            </Col>
                            <Col md={6}>
                                <FormLabel>ID demande</FormLabel>
                                <FormControl {...register('id_demande')} placeholder="Optionnel" />
                            </Col>
                            <Col md={6}>
                                <FormLabel>Nom commercial</FormLabel>
                                <FormControl {...register('nom_commercial')} placeholder="Optionnel" />
                            </Col>
                            <Col md={6}>
                                <FormLabel>ID commercial</FormLabel>
                                <FormControl
                                    type="number"
                                    {...register('id_commercial')}
                                    placeholder="Optionnel"
                                />
                            </Col>
                            <Col md={6}>
                                <FormLabel>Statut</FormLabel>
                                <FormControl {...register('statut')} placeholder="ex. en cours" />
                            </Col>
                            <Col md={12}>
                                <FormLabel>Infos demande</FormLabel>
                                <FormControl {...register('demande_infos')} placeholder="Optionnel" />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" type="button" onClick={handleModalClose}>
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Enregistrement…
                                </>
                            ) : (
                                'Enregistrer'
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    )
}

export default AddDemandeReservationModal
