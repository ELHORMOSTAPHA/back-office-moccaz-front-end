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
    editDemandeReservation,
    type EditDemandeReservationPayload,
} from '@/services/demandeReservation'
import { loadAllStocks } from '@/services/stock'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { DemandeReservation } from '@/interface/gloable'

type Props = {
    show: boolean
    onHide: () => void
    selected: DemandeReservation | null
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

const EditDemandeReservationModal = ({ show, onHide, selected, onSuccess }: Props) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<FormData | null>(null)
    const [stockOption, setStockOption] = useState<{ value: string; label: string } | null>(null)

    const { register, handleSubmit, reset } = useForm<FormData>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            id_demande: '',
            nom_commercial: '',
            id_commercial: '',
            demande_infos: '',
            statut: '',
        },
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

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: EditDemandeReservationPayload }) =>
            editDemandeReservation(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demande_reservation'] })
            success.show('Demande mise à jour.')
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
        if (!selected || !show) return
        reset({
            id_demande: selected.id_demande ?? '',
            nom_commercial: selected.nom_commercial ?? '',
            id_commercial:
                selected.id_commercial != null ? String(selected.id_commercial) : '',
            demande_infos: selected.demande_infos ?? '',
            statut: selected.statut ?? '',
        })
        setSavedFormData(null)
    }, [selected, show, reset])

    useEffect(() => {
        if (!selected || !show || stockOptions.length === 0) return
        const match = stockOptions.find((o) => o.value === String(selected.stock_id))
        setStockOption(match ?? { value: String(selected.stock_id), label: `Stock #${selected.stock_id}` })
    }, [selected, show, stockOptions])

    const handleModalClose = () => {
        reset({
            id_demande: '',
            nom_commercial: '',
            id_commercial: '',
            demande_infos: '',
            statut: '',
        })
        setStockOption(null)
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
        if (!selected) return
        setSavedFormData(formData)
        const idCommRaw = (formData.id_commercial ?? '').trim()
        const idCommNum = idCommRaw === '' ? NaN : Number(idCommRaw)
        const payload: EditDemandeReservationPayload = {
            stock_id: stockOption ? Number(stockOption.value) : selected.stock_id,
            id_demande: trim(formData.id_demande),
            nom_commercial: trim(formData.nom_commercial),
            id_commercial: Number.isNaN(idCommNum) ? null : idCommNum,
            demande_infos: trim(formData.demande_infos),
            statut: trim(formData.statut),
        }
        updateMutation.mutate({ id: selected.id, payload })
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
                show={Boolean(show && selected && isModalVisible)}
                onHide={handleModalClose}
                centered
                size="lg"
                backdrop="static"
            >
                <ModalHeader closeButton>
                    <ModalTitle>Modifier la demande #{selected?.id}</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <FormLabel>Véhicule (stock)</FormLabel>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    isLoading={stocksLoading}
                                    options={stockOptions}
                                    value={stockOption}
                                    onChange={(opt) => setStockOption(opt)}
                                />
                            </Col>
                            <Col md={6}>
                                <FormLabel>ID demande</FormLabel>
                                <FormControl {...register('id_demande')} />
                            </Col>
                            <Col md={6}>
                                <FormLabel>Nom commercial</FormLabel>
                                <FormControl {...register('nom_commercial')} />
                            </Col>
                            <Col md={6}>
                                <FormLabel>ID commercial</FormLabel>
                                <FormControl type="number" {...register('id_commercial')} />
                            </Col>
                            <Col md={6}>
                                <FormLabel>Statut</FormLabel>
                                <FormControl {...register('statut')} />
                            </Col>
                            <Col md={12}>
                                <FormLabel>Infos demande</FormLabel>
                                <FormControl {...register('demande_infos')} />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" type="button" onClick={handleModalClose}>
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
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

export default EditDemandeReservationModal
