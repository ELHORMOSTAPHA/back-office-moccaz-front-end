import {useNavigate} from "react-router";
import {useState} from 'react'
import {Button, Card, CardBody, CardHeader, Form, Row, Col} from 'react-bootstrap'
import {TbArrowLeft, TbDeviceFloppy, TbPlus, TbTrash} from 'react-icons/tb'

import PageBreadcrumb from '@/components/PageBreadcrumb'
import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const AddClient = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        raisonSociale: '',
        typeClient: '',
        tel: '',
        email: '',
        status: 'Actif',
        depots: [] as string[]
    })

    // const [errors, setErrors] = useState<Record<string, string>>({})
    // const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddDepot = () => {
        setFormData(prev => ({
            ...prev,
            depots: [...prev.depots, '']
        }))
    }

    const handleDepotNameChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            depots: prev.depots.map((depot, i) => i === index ? value : depot)
        }))
    }

    const handleRemoveDepot = (index: number) => {
        setFormData(prev => ({
            ...prev,
            depots: prev.depots.filter((_, i) => i !== index)
        }))
    }


    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault()

    //     if (!validateForm()) {
    //         return
    //     }

    //     setIsSubmitting(true)

    //     try {
    //         // Simulate API call
    //         await new Promise(resolve => setTimeout(resolve, 1000))

    //         // Generate new client ID
    //         const newClient = {
    //             id: `CLI-${String(Date.now()).slice(-3).padStart(3, '0')}`,
    //             ...formData,
    //             dateInscription: new Date().toISOString().split('T')[0],
    //         }

    //         console.log('New client created:', newClient)

    //         // Show success message (you can replace with toast notification)
    //         alert('Client créé avec succès!')

    //         // Navigate back to clients list
    //         navigate('/clients')
    //     } catch (error) {
    //         console.error('Error creating client:', error)
    //         alert('Erreur lors de la création du client')
    //     } finally {
    //         setIsSubmitting(false)
    //     }
    // }

    const handleCancel = () => {
        navigate('/clients')
    }

    const FormSchema=z.object({
        nom:z.string().min(1,"Le nom est requisssss"),
        prenom:z.string().min(1,"Le prénom est requis"),
        raisonSociale:z.string().min(1,"La raison sociale est requise"),
        typeClient:z.string().min(1,"Le type de client est requis"),
        tel:z.string().min(1,"Le téléphone est requis").regex(/^(\+212|0)[0-9]{9}$/,"Format de téléphone invalide (ex: +212 661 234 567 ou 0661234567)"),
        email:z.string().min(1,"L'email est requis").email("Format d'email invalide"),
    })
      type FormData = z.infer<typeof FormSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(FormSchema)
  });
   const handlAddclient: SubmitHandler<FormData> = async (data) => {
    console.log('Form Data:');
    console.log(data);
  };
    return (
        <>
            <PageBreadcrumb
                title="Ajouter Client"
                subtitle="Clients"
            />
            <Card>
                <CardHeader className="border-light">
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleCancel}
                            className="btn-icon"
                        >
                            <TbArrowLeft className="fs-lg"/>
                        </Button>
                        <h5 className="mb-0">Informations du Client</h5>
                    </div>
                </CardHeader>

                <CardBody>
                    <Form onSubmit={handleSubmit(handlAddclient)}>
                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="prenom" className="form-label">
                                        Prénom <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.prenom ? 'is-invalid' : ''}`}
                                        id="prenom"
                                        value={formData.prenom}
                                        placeholder="Entrez le prénom"
                                        {...register("prenom")}
                                    />

                                    {errors.prenom && (
                                        <div className="invalid-feedback">{errors.prenom.message}</div>
                                    )}
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="nom" className="form-label">
                                        Nom <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                                        id="nom"
                                        value={formData.nom}
                                        placeholder="Entrez le nom"
                                        {...register("nom")}
                                    />
                                    {errors.nom && (
                                        <div className="invalid-feedback">{errors.nom.message}</div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="mb-3">
                            <label htmlFor="raisonSociale" className="form-label">
                                Raison Sociale <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.raisonSociale ? 'is-invalid' : ''}`}
                                id="raisonSociale"
                                value={formData.raisonSociale}
                                {...register("raisonSociale")}
                                placeholder="Ex: Société de Transport SARL, Auto-Entrepreneur, etc."
                            />
                            {errors.raisonSociale && (
                                <div className="invalid-feedback">{errors.raisonSociale.message}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="typeClient" className="form-label">
                                Type Client <span className="text-danger">*</span>
                            </label>
                            <select
                                className={`form-select ${errors.typeClient ? 'is-invalid' : ''}`}
                                id="typeClient"
                                value={formData.typeClient}
                                {...register("typeClient")}
                            >
                                <option value="">Sélectionnez un type</option>
                                <option value="Particulier">Particulier</option>
                                <option value="Société">Société</option>
                            </select>
                            {errors.typeClient && (
                                <div className="invalid-feedback">{errors.typeClient.message}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="depots" className="form-label">
                                Dépôts Assignés
                            </label>

                            {formData.depots.map((depot, index) => (
                                <div key={index} className="d-flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={depot}
                                        onChange={(e) => handleDepotNameChange(index, e.target.value)}
                                        placeholder="Nom du dépôt"
                                    />
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="btn-icon"
                                        onClick={() => handleRemoveDepot(index)}
                                    >
                                        <TbTrash className="fs-lg"/>
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleAddDepot}

                            >
                                <TbPlus className="fs-lg me-1"/>
                                Ajouter Dépôt
                            </Button>
                        </div>

                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="tel" className="form-label">
                                        Téléphone <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={`form-control ${errors.tel ? 'is-invalid' : ''}`}
                                        id="tel"
                                        value={formData.tel}
                                        {...register("tel")}
                                        placeholder="+212 661 234 567"
                                    />
                                    {errors.tel && (
                                        <div className="invalid-feedback">{errors.tel.message}</div>
                                    )}
                                    <div className="form-text">
                                        Format: +212 661 234 567 ou 0661234567
                                    </div>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        value={formData.email}
                                        placeholder="exemple@entreprise.com"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email.message}</div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <label htmlFor="status" className="form-label">
                                Statut
                            </label>
                            <select
                                className="form-select"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="Actif">Actif</option>
                                <option value="Inactif">Inactif</option>
                                <option value="En attente">En attente</option>
                                <option value="Suspendu">Suspendu</option>
                            </select>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button
                                variant="outline-secondary"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <TbDeviceFloppy className="fs-lg me-1"/>
                                        Créer le Client
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </>
    )
}

export default AddClient
