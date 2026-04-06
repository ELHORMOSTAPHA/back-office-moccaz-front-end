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
import { createDepot, type CreateDepotPayload } from '@/services/depot'
import { ErrorModal, SuccessModal } from '@/components/modals'
import { useNotificationModal } from '@/hooks/useNotificationModal'

type AddDepotModalProps = {
    show: boolean
    onHide: () => void
    onSuccess?: () => void
}

const FormSchema = z.object({
    name: z.string().min(1, 'Le nom est requis').max(45),
    type: z.string().max(45).optional(),
})

type FormData = z.infer<typeof FormSchema>

const defaultFormValues: FormData = {
    name: '',
    type: '',
}

const AddDepotModal = ({ show, onHide, onSuccess }: AddDepotModalProps) => {
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
        defaultValues: defaultFormValues,
    })

    const createMutation = useMutation({
        mutationFn: (payload: CreateDepotPayload) => createDepot(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['depot'] })
            queryClient.invalidateQueries({ queryKey: ['depots', 'all'] })
            success.show('Dépôt créé avec succès.')
            reset(defaultFormValues)
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
        setSavedFormData(null)
    }, [show, reset])

    const handleModalClose = () => {
        reset(defaultFormValues)
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
        setSavedFormData(formData)
        const payload: CreateDepotPayload = {
            name: trim(formData.name),
            type: trim(formData.type),
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
                backdrop="static"
            >
                <ModalHeader closeButton>
                    <ModalTitle>Nouveau dépôt</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <FormLabel>
                                    Nom <span className="text-danger">*</span>
                                </FormLabel>
                                <FormControl
                                    {...register('name')}
                                    placeholder="Nom du dépôt"
                                    isInvalid={!!errors.name}
                                />
                                {errors.name ? (
                                    <div className="invalid-feedback d-block">{errors.name.message}</div>
                                ) : null}
                            </Col>
                            <Col md={12}>
                                <FormLabel>Type</FormLabel>
                                <FormControl
                                    {...register('type')}
                                    placeholder="ex. stockage, showroom"
                                    isInvalid={!!errors.type}
                                />
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

export default AddDepotModal
