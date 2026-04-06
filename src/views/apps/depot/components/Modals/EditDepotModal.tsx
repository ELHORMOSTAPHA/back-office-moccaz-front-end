import { useEffect, useState } from 'react'
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
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDepot, type EditDepotPayload } from '@/services/depot'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import type { Depot } from '@/interface/gloable'

type EditDepotModalProps = {
    show: boolean
    onHide: () => void
    selectedDepot: Depot | null
    onSuccess?: () => void
}

const FormSchema = z.object({
    name: z.string().max(45).optional(),
    type: z.string().max(45).optional(),
})

type FormData = z.infer<typeof FormSchema>

const EditDepotModal = ({ show, onHide, selectedDepot, onSuccess }: EditDepotModalProps) => {
    const queryClient = useQueryClient()
    const { success, error } = useNotificationModal()
    const [isModalVisible, setIsModalVisible] = useState(show)
    const [savedFormData, setSavedFormData] = useState<FormData | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: { name: '', type: '' },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: EditDepotPayload }) =>
            editDepot(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['depot'] })
            queryClient.invalidateQueries({ queryKey: ['depots', 'all'] })
            success.show('Dépôt modifié avec succès.')
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
        if (selectedDepot && show) {
            reset({
                name: selectedDepot.name ?? '',
                type: selectedDepot.type ?? '',
            })
            setSavedFormData(null)
        }
    }, [selectedDepot, show, reset])

    const handleModalClose = () => {
        reset({ name: '', type: '' })
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
        if (!selectedDepot) return
        setSavedFormData(formData)
        const payload: EditDepotPayload = {
            name: trim(formData.name),
            type: trim(formData.type),
        }
        updateMutation.mutate({ id: selectedDepot.id, payload })
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
                show={Boolean(show && selectedDepot && isModalVisible)}
                onHide={handleModalClose}
                centered
                backdrop="static"
            >
                <ModalHeader closeButton>
                    <ModalTitle>Modifier le dépôt #{selectedDepot?.id}</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <FormLabel>Nom</FormLabel>
                                <FormControl
                                    {...register('name')}
                                    isInvalid={!!errors.name}
                                    disabled={!selectedDepot}
                                />
                            </Col>
                            <Col md={12}>
                                <FormLabel>Type</FormLabel>
                                <FormControl
                                    {...register('type')}
                                    placeholder="ex. stockage, showroom"
                                    isInvalid={!!errors.type}
                                    disabled={!selectedDepot}
                                />
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

export default EditDepotModal
