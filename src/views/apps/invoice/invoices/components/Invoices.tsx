import {
    type ColumnFiltersState,
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type Row as TableRow,
    useReactTable,
} from '@tanstack/react-table'

import {Link} from "react-router";
import {useState, useMemo, useEffect} from 'react'
import {Button, Card, CardFooter, CardHeader, Modal, Table, Form, Row, Col, Spinner, Alert, Carousel, Badge} from 'react-bootstrap'
import {LuCircleCheck, LuSearch} from 'react-icons/lu'
import {TbTruck, TbFileInvoice, TbEye, TbEdit, TbRoute} from 'react-icons/tb'

import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import SuccessModal from '@/components/modals/SuccessModal'
import {getAllDemandes, updateDemandeStatus, type Demande} from '@/services/demandeService'
import {getTrajetsByDemande, type Trajet} from '@/services/trajetService'
import {getAllChauffeurs, type Chauffeur} from '@/services/chauffeurService'
import {getAllVehicules, type Vehicule} from '@/services/vehiculeService'
import {getSuivieTrajetByTrajet, type SuivieTrajet} from '@/services/suivieTrajetService'
import {getMotifsByTrajet, type TrajetMotif} from '@/services/trajetMotifService'

const columnHelper = createColumnHelper<Demande>()

const Invoices = () => {
    // State for API data
    const [demandes, setDemandes] = useState<Demande[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch demandes from API
    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getAllDemandes({ per_page: 100 })
                setDemandes(response.data)
            } catch (err) {
                setError('Erreur lors du chargement des demandes. Veuillez réessayer.')
                console.error('Error fetching demandes:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDemandes()
    }, [])

    // Fetch chauffeurs from API
    useEffect(() => {
        const fetchChauffeurs = async () => {
            try {
                setLoadingChauffeurs(true)
                const chauffeurs = await getAllChauffeurs()
                setAvailableChauffeurs(chauffeurs)
            } catch (err) {
                console.error('Error fetching chauffeurs:', err)
            } finally {
                setLoadingChauffeurs(false)
            }
        }

        fetchChauffeurs()
    }, [])

    // Fetch vehicules from API
    useEffect(() => {
        const fetchVehicules = async () => {
            try {
                setLoadingVehicules(true)
                const vehicules = await getAllVehicules()
                setAvailableVehicules(vehicules)
            } catch (err) {
                console.error('Error fetching vehicules:', err)
            } finally {
                setLoadingVehicules(false)
            }
        }

        fetchVehicules()
    }, [])

    // Helper function for status icon color
    const getStatusColor = (status: Demande['status']) => {
        switch (status) {
            case 'À planifier': return 'text-secondary'
            case 'Planifiée': return 'text-info'
            case 'Traitement en cours': return 'text-warning'
            case 'Livrée': return 'text-success'
            case 'Anomalie': return 'text-danger'
            case 'Clôturée': return 'text-dark'
            default: return 'text-secondary'
        }
    }

    // Helper function for status badge color
    const getStatusBadgeColor = (status: Demande['status']) => {
        switch (status) {
            case 'À planifier': return 'bg-secondary-subtle text-secondary'
            case 'Planifiée': return 'bg-info-subtle text-info'
            case 'Traitement en cours': return 'bg-warning-subtle text-warning'
            case 'Livrée': return 'bg-success-subtle text-success'
            case 'Anomalie': return 'bg-danger-subtle text-danger'
            case 'Clôturée': return 'bg-dark-subtle text-dark'
            default: return 'bg-secondary-subtle text-secondary'
        }
    }

    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ({row}) => (
                <h5 className="m-0 d-flex align-items-center gap-1">
                    <TbFileInvoice
                        className={`fs-lg ${getStatusColor(row.original.status)}`}
                    />
                    <Link to="" className="link-reset fw-semibold">
                        #{String(row.original.id).padStart(3, '')}
                    </Link>
                </h5>
            ),
        }),
        columnHelper.accessor('client', {
            header: 'Client',
            cell: ({row}) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    <div className="avatar-sm shrink-0">
                        <span className="avatar-title text-bg-primary fw-bold rounded-circle">
                            {row.original.client.prenom?.charAt(0) || row.original.client.raison_sociale?.charAt(0) || 'C'}
                        </span>
                    </div>
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <Link to="" className="link-reset">
                                {row.original.client.prenom || row.original.client.raison_sociale} {row.original.client.nom}
                            </Link>
                        </h5>
                        <p className="text-muted fs-xs mb-0">{row.original.client.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('type_demande', {
            header: 'Type de Demande',
            cell: ({row}) => (
                <span className={`badge ${row.original.type_demande === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} badge-label`}>
                    {row.original.type_demande}
                </span>
            ),
        }),
        columnHelper.accessor('type_vehicule', {
            header: 'Type Véhicule',
            cell: ({row}) => {
                if (row.original.type_demande === 'Messagerie') {
                    return <span className="text-muted">-</span>
                }
                return (
                    <span className="badge bg-secondary-subtle text-secondary badge-label">
                        {row.original.type_vehicule?.libelle || 'N/A'}
                    </span>
                )
            },
        }),
        columnHelper.accessor('nombre_tonne', {
            header: 'Tonnage',
            cell: ({row}) => {
                if (row.original.type_demande === 'Messagerie') {
                    return <span className="text-muted">-</span>
                }
                return `${row.original.nombre_tonne} T`
            },
        }),
        columnHelper.accessor('date_enlevement', {
            header: 'Date Enlèvement',
            cell: ({row}) => {
                const date = new Date(row.original.date_enlevement)
                return date.toLocaleDateString('fr-FR')
            },
        }),
        columnHelper.accessor('date_livraison_souhaitee', {
            header: 'Date Livraison',
            cell: ({row}) => {

                // For Transport: use the actual date_livraison_souhaitee (date only)
                if (row.original.date_livraison_souhaitee) {
                    const date = new Date(row.original.date_livraison_souhaitee)
                    return date.toLocaleDateString('fr-FR')
                }
                return 'N/A'
            },
        }),
        columnHelper.accessor('status', {
            header: 'Statut',
            cell: ({row}) => (
                <span className={`badge ${getStatusBadgeColor(row.original.status)} badge-label`}>
                    {row.original.status}
                </span>
            ),
        }),
        {
            header: 'Actions',
            cell: ({row}: { row: TableRow<Demande> }) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            // Show voyages related to this demande
                            handleShowVoyages(row.original.id)
                        }}
                    >
                        <TbEye className="fs-lg"/>
                    </Button>

                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            // Handle status modification
                            handleShowStatusModal(row.original.id, row.original.status)
                        }}
                    >
                        <TbEdit className="fs-lg"/>
                    </Button>
                </div>
            ),
        },
    ]

    // Filter out "À planifier" demandes from the list
    const filteredData = useMemo(() => {
        return demandes.filter(demande => demande.status !== 'À planifier')
    }, [demandes])

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})

    // Modal state for showing related voyages
    const [showVoyagesModal, setShowVoyagesModal] = useState(false)
    const [selectedDemandeId, setSelectedDemandeId] = useState<string>('')
    const [selectedDemandeType, setSelectedDemandeType] = useState<'Transport' | 'Messagerie'>('Transport')
    const [relatedVoyages, setRelatedVoyages] = useState<Trajet[]>([])
    const [loadingVoyages, setLoadingVoyages] = useState(false)

    // Modal state for suivie trajet
    const [showSuivieTrajetModal, setShowSuivieTrajetModal] = useState(false)
    const [selectedVoyageForSuivie, setSelectedVoyageForSuivie] = useState<Trajet | null>(null)
    const [suivieTrajetData, setSuivieTrajetData] = useState<SuivieTrajet | null>(null)
    const [loadingSuivieTrajet, setLoadingSuivieTrajet] = useState(false)
    
    // State for trajet motifs
    const [trajetMotifs, setTrajetMotifs] = useState<TrajetMotif[]>([])
    const [loadingMotifs, setLoadingMotifs] = useState(false)

    // State for image viewer modal
    const [showImageModal, setShowImageModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Modal state for affectation
    const [showAffectationModal, setShowAffectationModal] = useState(false)
    const [affectationFormData, setAffectationFormData] = useState({
        chauffeur: '',
        vehicule: ''
    })
    const [isSubmittingAffectation, setIsSubmittingAffectation] = useState(false)

    // Modal state for editing voyage date
    const [showEditDateModal, setShowEditDateModal] = useState(false)
    const [selectedVoyageId, setSelectedVoyageId] = useState<string>('')
    const [editDateFormData, setEditDateFormData] = useState({
        dateDepart: '',
        timeDepart: ''
    })
    const [isSubmittingDateEdit, setIsSubmittingDateEdit] = useState(false)

    // Modal state for editing status
    const [showEditStatusModal, setShowEditStatusModal] = useState(false)
    const [selectedStatusDemandeId, setSelectedStatusDemandeId] = useState<number | null>(null)
    const [newStatus, setNewStatus] = useState<string>('')
    const [isSubmittingStatusEdit, setIsSubmittingStatusEdit] = useState(false)

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Real data for chauffeurs and vehicules
    const [availableChauffeurs, setAvailableChauffeurs] = useState<Chauffeur[]>([])
    const [availableVehicules, setAvailableVehicules] = useState<Vehicule[]>([])
    const [loadingChauffeurs, setLoadingChauffeurs] = useState(false)
    const [loadingVehicules, setLoadingVehicules] = useState(false)

    // Available status options
    const availableStatuses: Demande['status'][] = [
        'À planifier',
        'Planifiée',
        'Traitement en cours',
        'Livrée',
        'Anomalie',
        'Clôturée'
    ]

    // // Responsive carousel - track window size
    // const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200)

    // // Calculate responsive cards per slide
    // const cardsPerSlide = useMemo(() => {
    //     if (windowWidth < 576) return 1  // Mobile: 1 card
    //     if (windowWidth < 768) return 1  // Small tablet: 1 card
    //     if (windowWidth < 992) return 2  // Medium tablet: 2 cards
    //     return 3                         // Desktop: 3 cards
    // }, [windowWidth])

    // // Handle window resize
    // useEffect(() => {
    //     const handleResize = () => setWindowWidth(window.innerWidth)
    //     window.addEventListener('resize', handleResize)
    //     return () => window.removeEventListener('resize', handleResize)
    // }, [])
    const useResponsiveCardsPerSlide = () => {
    const [cardsPerSlide, setCardsPerSlide] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 576) {
                // xs
                setCardsPerSlide(1);
            } else if (width >= 576 && width < 768) {
                // sm
                setCardsPerSlide(1);
            } else if (width >= 768 && width < 992) {
                // md
                setCardsPerSlide(2);
            } else if (width >= 992 && width < 1200) {
                // lg
                setCardsPerSlide(3);
            } else {
                // xl and above
                setCardsPerSlide(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return cardsPerSlide;
};
    const cardsPerSlide = useResponsiveCardsPerSlide();

    // Function to handle showing voyages for a demande
    const handleShowVoyages = async (demandeId: number) => {
        const demande = demandes.find(d => d.id === demandeId)
        setSelectedDemandeType(demande?.type_demande || 'Transport')
        setSelectedDemandeId(String(demandeId))
        setShowVoyagesModal(true)
        setLoadingVoyages(true)

        try {
            // Fetch regular trajets from API (trajets for this demande)
            const response = await getTrajetsByDemande(demandeId)
            setRelatedVoyages(response.data || [])
        } catch (error) {
            console.error('Error fetching trajets:', error)
            setRelatedVoyages([])
            alert('Erreur lors du chargement des trajets')
        } finally {
            setLoadingVoyages(false)
        }
    }

    const handleCloseVoyagesModal = () => {
        setShowVoyagesModal(false)
        setSelectedDemandeId('')
        setSelectedDemandeType('Transport')
        setRelatedVoyages([])
    }

    // Handler for showing suivie trajet modal
    const handleShowSuivieTrajet = async (voyage: Trajet) => {
        console.log('Selected voyage for suivie trajet:', voyage)
        setShowVoyagesModal(false)
        setSelectedVoyageForSuivie(voyage)
        setShowSuivieTrajetModal(true)
        setLoadingSuivieTrajet(true)
        setLoadingMotifs(true)

        try {
            // Fetch suivie trajet data
            const response = await getSuivieTrajetByTrajet(voyage.id)
            setSuivieTrajetData(response.data)
            
            // Fetch trajet motifs
            try {
                const motifsResponse = await getMotifsByTrajet(voyage.id)
                setTrajetMotifs(motifsResponse.data || [])
            } catch (motifError) {
                console.error('Error fetching motifs:', motifError)
                setTrajetMotifs([])
            }
        } catch (error) {
            console.error('Error fetching suivie trajet:', error)
            setSuivieTrajetData(null)
            alert('Erreur lors du chargement du suivi du trajet')
        } finally {
            setLoadingSuivieTrajet(false)
            setLoadingMotifs(false)
        }
    }

    const handleCloseSuivieTrajetModal = () => {
        setShowSuivieTrajetModal(false)
        setShowVoyagesModal(true)
        setSelectedVoyageForSuivie(null)
        setSuivieTrajetData(null)
        setTrajetMotifs([])
    }

    const handleCloseAffectationModal = () => {
        setShowAffectationModal(false)
        setSelectedDemandeId('')
        setRelatedVoyages([])
        setAffectationFormData({ chauffeur: '', vehicule: '' })
    }

    const handleAffectationInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setAffectationFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmitAffectation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!affectationFormData.chauffeur || !affectationFormData.vehicule) {
            alert('Veuillez sélectionner un chauffeur et un véhicule')
            return
        }

        setIsSubmittingAffectation(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // In a real app, you would update the voyages with the selected chauffeur and vehicle
            console.log('Affectation completed:', {
                demandeId: selectedDemandeId,
                chauffeur: affectationFormData.chauffeur,
                vehicule: affectationFormData.vehicule,
                voyagesAffected: relatedVoyages.length
            })

            const demande = demandes.find(d => d.id === Number(selectedDemandeId))
            const isPlanning = demande?.status === 'À planifier'

            // Get the selected chauffeur and vehicule names
            const selectedChauffeur = availableChauffeurs.find(c => c.id === Number(affectationFormData.chauffeur))
            const chauffeurName = selectedChauffeur ? `${selectedChauffeur.prenom} ${selectedChauffeur.nom}` : affectationFormData.chauffeur

            const message = isPlanning
                ? `Affectation réussie! ${relatedVoyages.length} voyage(s) ont été affectés à ${chauffeurName}`
                : `Modification réussie! Les voyages ont été réaffectés à ${chauffeurName}`

            alert(message)
            handleCloseAffectationModal()
        } catch (error) {
            console.error('Error during affectation:', error)
            alert('Erreur lors de l\'affectation')
        } finally {
            setIsSubmittingAffectation(false)
        }
    }

    // Function to handle showing edit date modal
    // Note: Currently not used as Actions column was removed from affectation modal
    // @ts-ignore - Kept for potential future use
    const handleShowEditDateModal = (voyageId: string, currentDate: string) => {
        const date = new Date(currentDate)
        const dateStr = date.toISOString().split('T')[0]
        const timeStr = date.toTimeString().split(' ')[0].substring(0, 5)

        setSelectedVoyageId(voyageId)
        setEditDateFormData({
            dateDepart: dateStr,
            timeDepart: timeStr
        })
        setShowEditDateModal(true)
    }

    const handleCloseEditDateModal = () => {
        setShowEditDateModal(false)
        setSelectedVoyageId('')
        setEditDateFormData({ dateDepart: '', timeDepart: '' })
    }

    const handleEditDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditDateFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmitDateEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editDateFormData.dateDepart || !editDateFormData.timeDepart) {
            alert('Veuillez sélectionner une date et une heure')
            return
        }

        setIsSubmittingDateEdit(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // In a real app, you would update the voyage date
            console.log('Date modification completed:', {
                voyageId: selectedVoyageId,
                newDate: editDateFormData.dateDepart,
                newTime: editDateFormData.timeDepart
            })

            // Update the voyage in the relatedVoyages array
            const updatedVoyages = relatedVoyages.map(v => {
                if (String(v.id) === selectedVoyageId) {
                    const newDateTime = `${editDateFormData.dateDepart} ${editDateFormData.timeDepart}:00`
                    return {
                        ...v,
                        date_depart: newDateTime,
                        date_depart_formatted: new Date(newDateTime).toLocaleString('fr-FR')
                    }
                }
                return v
            })
            setRelatedVoyages(updatedVoyages)

            alert('Date de départ modifiée avec succès!')
            handleCloseEditDateModal()
        } catch (error) {
            console.error('Error during date edit:', error)
            alert('Erreur lors de la modification de la date')
        } finally {
            setIsSubmittingDateEdit(false)
        }
    }

    // Function to handle showing status modal
    const handleShowStatusModal = (demandeId: number, currentStatus: Demande['status']) => {
        setSelectedStatusDemandeId(demandeId)
        setNewStatus(currentStatus)
        setShowEditStatusModal(true)
    }

    const handleCloseStatusModal = () => {
        setShowEditStatusModal(false)
        setSelectedStatusDemandeId(null)
        setNewStatus('')
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewStatus(e.target.value)
    }

    const handleSubmitStatusEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newStatus || !selectedStatusDemandeId) {
            alert('Veuillez sélectionner un statut')
            return
        }

        setIsSubmittingStatusEdit(true)

        try {
            // Call API to update status
            await updateDemandeStatus(selectedStatusDemandeId, newStatus as Demande['status'])

            // Show success modal
            setSuccessMessage('Statut modifié avec succès!')
            setShowSuccessModal(true)
            handleCloseStatusModal()

            // Refresh the demandes list
            const response = await getAllDemandes({ per_page: 100 })
            setDemandes(response.data)
        } catch (error) {
            console.error('Error during status edit:', error)
            alert('Erreur lors de la modification du statut')
        } finally {
            setIsSubmittingStatusEdit(false)
        }
    }

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {sorting, globalFilter, columnFilters, pagination},
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: 'includesString',
        enableColumnFilters: true,
    })

    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const totalItems = table.getFilteredRowModel().rows.length

    const start = pageIndex * pageSize + 1
    const end = Math.min(start + pageSize - 1, totalItems)

    // Helper function for voyage status colors (currently unused)
    // const getVoyageStatusColor = (status: VoyageType['status']) => {
    //     switch (status) {
    //         case 'En attente': return 'bg-secondary-subtle text-secondary'
    //         case 'En cours': return 'bg-info-subtle text-info'
    //         case 'En transit': return 'bg-warning-subtle text-warning'
    //         case 'Arrivé': return 'bg-primary-subtle text-primary'
    //         case 'Terminé': return 'bg-success-subtle text-success'
    //         case 'Annulé': return 'bg-danger-subtle text-danger'
    //         case 'Retardé': return 'bg-warning-subtle text-warning'
    //         default: return 'bg-secondary-subtle text-secondary'
    //     }
    // }

    return (
        <>
            {loading && (
                <Card>
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des demandes...</p>
                    </Card.Body>
                </Card>
            )}

            {error && !loading && (
                <Card>
                    <Card.Body>
                        <Alert variant="danger" className="mb-0">
                            <Alert.Heading>Erreur</Alert.Heading>
                            <p className="mb-0">{error}</p>
                            <hr />
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={async () => {
                                    setLoading(true)
                                    setError(null)
                                    try {
                                        const response = await getAllDemandes({ per_page: 100 })
                                        setDemandes(response.data)
                                    } catch (err) {
                                        setError('Erreur lors du chargement des demandes.')
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            >
                                Réessayer
                            </Button>
                        </Alert>
                    </Card.Body>
                </Card>
            )}

            {!loading && !error && (
            <Card>
            <CardHeader className="border-light justify-content-between">
                <div className="d-flex gap-2">
                    <div className="app-search">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search demandes..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                        <LuSearch className="app-search-icon text-muted"/>
                    </div>
                    {/* <Link to="/add-demande" className="btn btn-secondary"><TbPlus
                        className="fs-lg me-1"></TbPlus> Créer Demande</Link> */}
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span className="me-2 fw-semibold">Filter By:</span>

                    <div className="app-search">
                        <select
                            className="form-select form-control my-1 my-md-0 "
                            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'All'}
                            onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                            <option value="All">Statut</option>
                            <option value="À planifier">À planifier</option>
                            <option value="Planifiée">Planifiée</option>
                            <option value="Traitement en cours">Traitement en cours</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Anomalie">Anomalie</option>
                            <option value="Clôturée">Clôturée</option>
                        </select>
                        <LuCircleCheck className="app-search-icon text-muted"/>
                    </div>

                    <div>
                        <select
                            className="form-select form-control my-1 my-md-0"
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}>
                            {[5, 8, 10, 15, 20].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardHeader>

            <DataTable<Demande> table={table} emptyMessage="No records found"/>

            {table.getRowModel().rows.length > 0 && (
                <CardFooter className="border-0">
                    <TablePagination
                        totalItems={totalItems}
                        start={start}
                        end={end}
                        itemsName="demandes"
                        showInfo
                        previousPage={table.previousPage}
                        canPreviousPage={table.getCanPreviousPage()}
                        pageCount={table.getPageCount()}
                        pageIndex={table.getState().pagination.pageIndex}
                        setPageIndex={table.setPageIndex}
                        nextPage={table.nextPage}
                        canNextPage={table.getCanNextPage()}
                    />
                </CardFooter>
                )}
        </Card>
            )}

        {/* Modal for showing related voyages */}
        <Modal show={showVoyagesModal} onHide={handleCloseVoyagesModal} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    Trajets liés à la demande #{String(selectedDemandeId).padStart(3, '')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loadingVoyages ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des trajets...</p>
                    </div>
                ) : relatedVoyages.length > 0 ? (
                    // Show single table based on demande type
                    selectedDemandeType === 'Messagerie' ? (
                        // Messagerie table
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID Trajet</th>
                                    <th>Chauffeur</th>
                                    <th>Véhicule</th>
                                    <th>Départ</th>
                                    <th>Arrivée</th>
                                    <th>Date Enlèvement</th>
                                    <th>Nombre de Colis</th>
                                    <th>Taille</th>
                                    <th>Commentaire</th>
                                    <th>Retour</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatedVoyages.map((voyage) => (
                                    <tr key={voyage.id}>
                                        <td>
                                            <strong className="text-primary">#{String(voyage.id).padStart(3, '')}</strong>
                                        </td>
                                        <td>
                                            {voyage.chauffeur ? (
                                                <span>{voyage.chauffeur.prenom} {voyage.chauffeur.nom}</span>
                                            ) : (
                                                <span className="text-muted fst-italic">Non affecté</span>
                                            )}
                                        </td>
                                        <td>
                                            {voyage.vehicule ? (
                                                <span className="text-muted">
                                                    {voyage.vehicule.type_vehicule || 'N/A'} - {voyage.vehicule.immatriculation} - {voyage.vehicule.tonnage ? `${voyage.vehicule.tonnage}T` : 'N/A'}
                                                </span>
                                            ) : (
                                                <span className="text-muted fst-italic">Non affecté</span>
                                            )}
                                        </td>
                                        <td>{voyage.ville_depart?.nom || 'N/A'}</td>
                                        <td>{voyage.ville_arrivee?.nom || 'N/A'}</td>
                                        <td>{new Date(voyage.date_depart).toLocaleDateString('fr-FR')}</td>
                                        <td>{voyage.nombre_colies || '-'}</td>
                                        <td>{voyage.tailles_colies || '-'}</td>
                                        <td>{voyage.notes || '-'}</td>
                                        <td>
                                            <span className={`badge ${voyage.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                                {voyage.retour ? 'Oui' : 'Non'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                voyage.status === 'À planifier' ? 'bg-secondary-subtle text-secondary' :
                                                voyage.status === 'Planifiée' ? 'bg-info-subtle text-info' :
                                                voyage.status === 'Enlèvement en cours' ? 'bg-warning-subtle text-warning' :
                                                voyage.status === 'Enlevée' ? 'bg-primary-subtle text-primary' :
                                                voyage.status === 'En livraison' ? 'bg-warning-subtle text-warning' :
                                                voyage.status === 'Livrée' ? 'bg-success-subtle text-success' :
                                                voyage.status === 'Anomalie' ? 'bg-danger-subtle text-danger' :
                                                voyage.status === 'Clôturée' ? 'bg-dark-subtle text-dark' :
                                                'bg-secondary-subtle text-secondary'
                                            } badge-label`}>
                                                {voyage.status}
                                            </span>
                                        </td>
                                        <td>
                                            {/* View suivie trajet button */}
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon rounded-circle"
                                                onClick={() => handleShowSuivieTrajet(voyage)}
                                                title="Voir le suivi du trajet"
                                            >
                                                <TbRoute className="fs-lg"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        // Transport table
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID Trajet</th>
                                    <th>Chauffeur</th>
                                    <th>Véhicule</th>
                                    <th>Départ</th>
                                    <th>Arrivée</th>
                                    <th>Date Enlèvement</th>
                                    <th>Heure de Livraison</th>
                                    <th>Nombre de Cartons</th>
                                    <th>Manutention</th>
                                    <th>Retour</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatedVoyages.map((voyage) => (
                                <tr key={voyage.id}>
                                    <td>
                                        <strong className="text-primary">#{String(voyage.id).padStart(3, '')}</strong>
                                    </td>
                                    <td>
                                        {voyage.chauffeur ? (
                                            <span>{voyage.chauffeur.prenom} {voyage.chauffeur.nom}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>
                                        {voyage.vehicule ? (
                                            <span className="text-muted">
                                                {voyage.vehicule.type_vehicule || 'N/A'} - {voyage.vehicule.immatriculation} - {voyage.vehicule.tonnage ? `${voyage.vehicule.tonnage}T` : 'N/A'}
                                            </span>
                                        ) : (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>
                                        <div>
                                            <div>{voyage.depot_depart?.nom_depot || 'N/A'}</div>
                                            <small className="text-muted">{voyage.depot_depart?.ville_depot || ''}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>{voyage.depot_arrivee?.nom_depot || 'N/A'}</div>
                                            <small className="text-muted">{voyage.depot_arrivee?.ville_depot || ''}</small>
                                        </div>
                                    </td>
                                    <td>{new Date(voyage.date_depart).toLocaleDateString('fr-FR')}</td>
                                    <td>{voyage.heure_livraison || '-'}</td>
                                    <td>{voyage.nombre_colies || '-'}</td>
                                    <td>
                                        <span className={`badge ${voyage.manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                            {voyage.manutention ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${voyage.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                            {voyage.retour ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            voyage.status === 'À planifier' ? 'bg-secondary-subtle text-secondary' :
                                            voyage.status === 'Planifiée' ? 'bg-info-subtle text-info' :
                                            voyage.status === 'Enlèvement en cours' ? 'bg-warning-subtle text-warning' :
                                            voyage.status === 'Enlevée' ? 'bg-primary-subtle text-primary' :
                                            voyage.status === 'En livraison' ? 'bg-warning-subtle text-warning' :
                                            voyage.status === 'Livrée' ? 'bg-success-subtle text-success' :
                                            voyage.status === 'Anomalie' ? 'bg-danger-subtle text-danger' :
                                            voyage.status === 'Clôturée' ? 'bg-dark-subtle text-dark' :
                                            'bg-secondary-subtle text-secondary'
                                        } badge-label`}>
                                            {voyage.status}
                                        </span>
                                    </td>
                                    <td className='text-center'>
                                            {/* View suivie trajet button */}
                                           <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon rounded-circle"
                                                onClick={() => handleShowSuivieTrajet(voyage)}
                                                title="Voir le suivi du trajet"
                                            >
                                                <TbRoute className="fs-lg"/>
                                            </Button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    )
                ) : (
                    // Show empty state when no trajets
                    <div className="text-center py-4">
                        <TbTruck size={48} className="text-muted mb-3" />
                        <h6 className="text-muted">Aucun trajet associé à cette demande</h6>
                        <p className="text-muted small">
                            Les trajets seront affichés ici une fois qu'ils seront créés pour cette demande.
                        </p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className='btn-danger' onClick={handleCloseVoyagesModal}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Modal for affectation */}
        <Modal show={showAffectationModal} onHide={handleCloseAffectationModal} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {(() => {
                        const demande = demandes.find(d => d.id === Number(selectedDemandeId))
                        const isPlanning = demande?.status === 'À planifier'
                        return isPlanning
                            ? `Affecter Chauffeur et Véhicule - Demande #${String(selectedDemandeId).padStart(3, '')}`
                            : `Modifier Affectation - Demande #${String(selectedDemandeId).padStart(3, '')}`
                    })()}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitAffectation}>
                <Modal.Body>
                    <div className="mb-4">
                        <h6 className="text-muted mb-3">
                            <TbTruck className="me-2" />
                            {(() => {
                                const demande = demandes.find(d => d.id === Number(selectedDemandeId))
                                const isPlanning = demande?.status === 'À planifier'
                                return isPlanning
                                    ? `Voyages à affecter (${relatedVoyages.length})`
                                    : `Voyages affectés (${relatedVoyages.length})`
                            })()}
                        </h6>
                        {loadingVoyages ? (
                            <div className="text-center py-3">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="ms-2 text-muted">Chargement des trajets...</span>
                            </div>
                        ) : relatedVoyages.length > 0 ? (
                            <div className="table-responsive">
                                <Table striped hover className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>ID Trajet</th>
                                            <th>Départ</th>
                                            <th>Arrivée</th>
                                            <th>Date Enlèvement</th>
                                            <th>Véhicule</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedVoyages.map((voyage) => {
                                            const immatriculation = voyage.vehicule?.immatriculation || 'Non affecté'

                                            let vehicleDisplay = immatriculation

                                            // If vehicle is assigned, show its type and tonnage
                                            if (voyage.vehicule) {
                                                const vehicleType = voyage.vehicule.type_vehicule || 'N/A'
                                                const vehicleTonnage = voyage.vehicule.tonnage ? `${voyage.vehicule.tonnage}T` : 'N/A'
                                                vehicleDisplay = `${vehicleType} - ${immatriculation} - ${vehicleTonnage}`
                                            }

                                            return (
                                                <tr key={voyage.id}>
                                                    <td>
                                                        <strong className="text-primary">#{String(voyage.id).padStart(3, '')}</strong>
                                                    </td>

                                                    <td>{voyage.ville_depart?.nom || 'N/A'}</td>
                                                    <td>{voyage.ville_arrivee?.nom || 'N/A'}</td>
                                                    <td>
                                                        {new Date(voyage.date_depart).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">{vehicleDisplay}</span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-3 text-muted">
                                Aucun trajet trouvé pour cette demande
                            </div>
                        )}
                    </div>

                    {/* Display current affectation if exists */}
                    {(() => {
                        const demande = demandes.find(d => d.id === Number(selectedDemandeId))
                        const isModification = demande?.status !== 'À planifier'

                        if (isModification && relatedVoyages.length > 0 && relatedVoyages[0].chauffeur && relatedVoyages[0].vehicule) {
                            const vehicle = relatedVoyages[0].vehicule
                            const vehicleType = vehicle.type_vehicule || 'N/A'
                            const vehicleTonnage = vehicle.tonnage ? `${vehicle.tonnage}T` : 'N/A'
                            const vehicleDisplay = `${vehicleType} - ${vehicle.immatriculation} - ${vehicleTonnage}`

                            return (
                                <div className="alert alert-secondary mb-4">
                                    <h6 className="mb-2">
                                        <strong>Affectation actuelle:</strong>
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Chauffeur:</small>
                                            <strong>{relatedVoyages[0].chauffeur.prenom} {relatedVoyages[0].chauffeur.nom}</strong>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Véhicule:</small>
                                            <strong>{vehicleDisplay}</strong>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    })()}

                    <Row>
                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="chauffeur" className="form-label">
                                    Chauffeur <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    id="chauffeur"
                                    name="chauffeur"
                                    value={affectationFormData.chauffeur}
                                    onChange={handleAffectationInputChange}
                                    required
                                    disabled={loadingChauffeurs}
                                >
                                    <option value="">
                                        {loadingChauffeurs ? 'Chargement...' : 'Sélectionnez un chauffeur'}
                                    </option>
                                    {availableChauffeurs.map((chauffeur) => (
                                        <option key={chauffeur.id} value={chauffeur.id}>
                                            {chauffeur.prenom} {chauffeur.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="vehicule" className="form-label">
                                    Véhicule <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    id="vehicule"
                                    name="vehicule"
                                    value={affectationFormData.vehicule}
                                    onChange={handleAffectationInputChange}
                                    required
                                    disabled={loadingVehicules}
                                >
                                    <option value="">
                                        {loadingVehicules ? 'Chargement...' : 'Sélectionnez un véhicule'}
                                    </option>
                                    {availableVehicules.map((vehicule) => {
                                        const vehicleType = vehicule.type_vehicule?.libelle_type_vehicule || 'N/A'
                                        const vehicleTonnage = vehicule.tonnage ? `${vehicule.tonnage}T` : 'N/A'
                                        const vehicleDisplay = `${vehicleType} - ${vehicule.immatriculation} - ${vehicleTonnage}`

                                        return (
                                            <option key={vehicule.id} value={vehicule.id}>
                                                {vehicleDisplay}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleCloseAffectationModal}
                        disabled={isSubmittingAffectation}
                        className='btn-danger'
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmittingAffectation || !affectationFormData.chauffeur || !affectationFormData.vehicule}
                    >
                        {isSubmittingAffectation ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {(() => {
                                    const demande = demandes.find(d => d.id === Number(selectedDemandeId))
                                    const isPlanning = demande?.status === 'À planifier'
                                    return isPlanning ? 'Affectation...' : 'Modification...'
                                })()}
                            </>
                        ) : (
                            <>
                                <TbTruck className="me-2" />
                                {(() => {
                                    const demande = demandes.find(d => d.id === Number(selectedDemandeId))
                                    const isPlanning = demande?.status === 'À planifier'
                                    return isPlanning ? 'Confirmer l\'Affectation' : 'Confirmer la Modification'
                                })()}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Modal for editing voyage date */}
        <Modal show={showEditDateModal} onHide={handleCloseEditDateModal} centered style={{ '--bs-modal-bg': '#f8f9fa' } as React.CSSProperties}>
            <Modal.Header closeButton style={{ backgroundColor: '#f0f0f0' }}>
                <Modal.Title>
                    Modifier Date de Départ - Trajet #{selectedVoyageId}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitDateEdit}>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="dateDepart" className="form-label">
                                    Date de Départ <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="dateDepart"
                                    name="dateDepart"
                                    value={editDateFormData.dateDepart}
                                    onChange={handleEditDateInputChange}
                                    required
                                />
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="timeDepart" className="form-label">
                                    Heure de Départ <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    id="timeDepart"
                                    name="timeDepart"
                                    value={editDateFormData.timeDepart}
                                    onChange={handleEditDateInputChange}
                                    required
                                />
                            </div>
                        </Col>
                    </Row>

                    {editDateFormData.dateDepart && editDateFormData.timeDepart && (
                        <div className="alert alert-info mb-0">
                            <strong>Nouvelle date de départ:</strong><br />
                            {new Date(`${editDateFormData.dateDepart}T${editDateFormData.timeDepart}`).toLocaleString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={handleCloseEditDateModal}
                        disabled={isSubmittingDateEdit}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmittingDateEdit || !editDateFormData.dateDepart || !editDateFormData.timeDepart}
                    >
                        {isSubmittingDateEdit ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Modification...
                            </>
                        ) : (
                            <>
                                <TbEdit className="me-2" />
                                Confirmer la Modification
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Modal for editing status */}
        <Modal show={showEditStatusModal} onHide={handleCloseStatusModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Modifier Statut - Demande #{selectedStatusDemandeId}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitStatusEdit}>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="status" className="form-label">
                            Nouveau Statut <span className="text-danger">*</span>
                        </label>
                        <select
                            className="form-select"
                            id="status"
                            name="status"
                            value={newStatus}
                            onChange={handleStatusChange}
                            required
                        >
                            <option value="">Sélectionnez un statut</option>
                            {availableStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {newStatus && (
                        <div className="alert alert-info mb-0">
                            <strong>Nouveau statut:</strong><br />
                            <span className={`badge ${getStatusBadgeColor(newStatus as Demande['status'])} badge-label`}>
                                {newStatus}
                            </span>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleCloseStatusModal}
                        disabled={isSubmittingStatusEdit}
                        className='btn-danger'
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="secondary"
                        type="submit"
                        disabled={isSubmittingStatusEdit || !newStatus}
                        className='btn-danger'
                    >
                        {isSubmittingStatusEdit ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Modification...
                            </>
                        ) : (
                            <>
                                <TbEdit className="me-2 " />
                                Confirmer la Modification
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Modal for suivie trajet */}
        {/* Modal for suivie trajet */}
<Modal show={showSuivieTrajetModal} onHide={() =>{ setShowSuivieTrajetModal(false),setShowVoyagesModal(true)}} centered size="xl">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    Suivi Trajet #{selectedVoyageForSuivie ? String(selectedVoyageForSuivie.id).padStart(3, '0') : ''}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loadingSuivieTrajet ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement du suivi du trajet...</p>
                    </div>
                ) : (
                    <div>
                        {/* Suivie Trajet Table */}
                        <div className="mb-5">
                            <h6 className="mb-3 fw-bold">Informations de Suivi</h6>
                            <div className="table-responsive">
                                <Table striped bordered hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            {selectedDemandeType === 'Messagerie' ? (
                                                <>
                                                    <th className="text-nowrap small">Début Livraison</th>
                                                    <th className="text-nowrap small">Fin Livraison</th>
                                                    <th className="text-nowrap small">Retour Livraison</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="text-nowrap small">Début Chargement</th>
                                                    <th className="text-nowrap small">Fin Chargement</th>
                                                    <th className="text-nowrap small">Début Livraison</th>
                                                    <th className="text-nowrap small">Fin Livraison</th>
                                                    <th className="text-nowrap small">Début Déchargement</th>
                                                    <th className="text-nowrap small">Fin Déchargement</th>
                                                    <th className="text-nowrap small">Manutention Chargement</th>
                                                    <th className="text-nowrap small">Manutention Déchargement</th>
                                                    <th className="text-nowrap small">Retour Livraison</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {selectedDemandeType === 'Messagerie' ? (
                                                <>
                                                    <td className="small">{suivieTrajetData?.debut_livraison ? new Date(suivieTrajetData.debut_livraison).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.fin_livraison ? new Date(suivieTrajetData.fin_livraison).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.retour_livraison || '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="small">{suivieTrajetData?.debut_charge ? new Date(suivieTrajetData.debut_charge).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.fin_charge ? new Date(suivieTrajetData.fin_charge).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.debut_livraison ? new Date(suivieTrajetData.debut_livraison).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.fin_livraison ? new Date(suivieTrajetData.fin_livraison).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.debut_decharge ? new Date(suivieTrajetData.debut_decharge).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.fin_decharge ? new Date(suivieTrajetData.fin_decharge).toLocaleString('fr-FR') : '-'}</td>
                                                    <td className="small">{suivieTrajetData?.manutention_chargement ? 'Oui' : 'Non'}</td>
                                                    <td className="small">{suivieTrajetData?.manutention_dechargement ? 'Oui' : 'Non'}</td>
                                                    <td className="small">{suivieTrajetData?.retour_livraison || '-'}</td>
                                                </>
                                            )}
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>

                        {/* Trajet Motifs Section */}
                        <div className="mt-5 pt-4 border-top">
                            <h6 className="mb-4 fw-bold">Trajet Motifs</h6>
                            {loadingMotifs ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" size="sm" />
                                    <p className="mt-3 text-muted">Chargement des motifs...</p>
                                </div>
                            ) : trajetMotifs && trajetMotifs.length > 0 ? (
                                <div className='carousel-dark'>
                                    {/* Carousel */}
                                    <Carousel 
                                        interval={null} 
                                        className="bg-light rounded-3 p-3"
                                        indicators={trajetMotifs.length > cardsPerSlide}
                                        controls={trajetMotifs.length > cardsPerSlide}
                                       
                                    >
                                        {Array.from({ length: Math.ceil(trajetMotifs.length / cardsPerSlide) }).map((_, slideIndex) => {
                                            const startIdx = slideIndex * cardsPerSlide;
                                            const endIdx = Math.min(startIdx + cardsPerSlide, trajetMotifs.length);
                                            const slideMotifs = trajetMotifs.slice(startIdx, endIdx);

                                            return (
                                                <Carousel.Item key={slideIndex}>
                                                    <div className="py-4 px-2" style={{ minHeight: '450px' }}>
                                                        <Row className="g-3 justify-content-center">
                                                            {slideMotifs.map((motif, indexInSlide) => (
                                                                <Col 
                                                                    key={motif.id}
                                                                    xs={12}
                                                                    sm={12}
                                                                    md={cardsPerSlide === 2 ? 6 : 12}
                                                                    lg={cardsPerSlide === 3 ? 4 : cardsPerSlide === 4 ? 3 : 12}
                                                                    xl={cardsPerSlide === 4 ? 3 : cardsPerSlide === 3 ? 4 : 12}
                                                                >
                                                                    <Card className="h-100 shadow-sm border-0">
                                                                        {/* Image Section */}
                                                                        <div 
                                                                            className="bg-light d-flex align-items-center justify-content-center overflow-hidden"
                                                                            style={{ height: '200px', cursor: motif.file_url ? 'pointer' : 'default' }}
                                                                            onClick={() => motif.file_url && (setSelectedImage(motif.file_url), setShowImageModal(true),setShowSuivieTrajetModal(false)) }
                                                                        >
                                                                            {motif.file_url ? (
                                                                                <Card.Img
                                                                                    variant="top"
                                                                                    src={motif.file_url}
                                                                                    alt={`Motif ${motif.id}`}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div className="text-muted text-center p-4">
                                                                                    <svg 
                                                                                        width="48" 
                                                                                        height="48" 
                                                                                        fill="currentColor" 
                                                                                        className="bi bi-image mb-2"
                                                                                        viewBox="0 0 16 16"
                                                                                    >
                                                                                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                                                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                                                                    </svg>
                                                                                    <p className="mb-0 small">No image</p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Card Body */}
                                                                        <Card.Body className="d-flex flex-column">
                                                                            {/* Proof Type */}
                                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                <span className="text-muted text-uppercase small fw-semibold">
                                                                                    Proof Type
                                                                                </span>
                                                                                <Badge bg="primary" className="px-2 py-1">
                                                                                    {motif.proof_type || 'non spécifié'}
                                                                                </Badge>
                                                                            </div>

                                                                            {/* Notes */}
                                                                            {motif.notes && (
                                                                                <div className="flex-grow-1 d-flex justify-content-between">
                                                                                    <h6 className="text-muted text-uppercase small fw-semibold mb-2">
                                                                                        Notes
                                                                                    </h6>
                                                                                    <p 
                                                                                        className="text-dark small mb-0"
                                                                                        style={{
                                                                                            display: '-webkit-box',
                                                                                            WebkitLineClamp: 3,
                                                                                            WebkitBoxOrient: 'vertical',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            lineHeight: '1.5'
                                                                                        }}
                                                                                    >
                                                                                        {motif.notes || 'non spécifié'}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </Card.Body>

                                                                        {/* Card Footer */}
                                                                        <Card.Footer className="bg-light text-center border-top">
                                                                            <small className="text-muted fw-semibold">
                                                                                {startIdx + indexInSlide + 1} / {trajetMotifs.length}
                                                                            </small>
                                                                        </Card.Footer>
                                                                    </Card>
                                                                </Col>
                                                            ))}

                                                            {/* Empty placeholder cards */}
                                                            {slideMotifs.length < cardsPerSlide && Array.from({ length: cardsPerSlide - slideMotifs.length }).map((_, i) => (
                                                                <Col 
                                                                    key={`placeholder-${i}`}
                                                                    xs={12}
                                                                    sm={12}
                                                                    md={cardsPerSlide === 2 ? 6 : 12}
                                                                    lg={cardsPerSlide === 3 ? 4 : cardsPerSlide === 4 ? 3 : 12}
                                                                    xl={cardsPerSlide === 4 ? 3 : cardsPerSlide === 3 ? 4 : 12}
                                                                >
                                                                    <div 
                                                                        className="h-100 bg-light rounded-3 border border-2 border-dashed d-flex align-items-center justify-content-center"
                                                                        style={{ minHeight: '400px', borderColor: '#dee2e6 !important' }}
                                                                    >
                                                                        <span className="text-muted" style={{ fontSize: '2rem', opacity: 0.3 }}>
                                                                            —
                                                                        </span>
                                                                    </div>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    </div>
                                                </Carousel.Item>
                                            );
                                        })}
                                    </Carousel>

                                    {/* Slide counter */}
                                    {/* <div className="text-center mt-3">
                                        <small className="text-muted">
                                            {Math.ceil(trajetMotifs.length / cardsPerSlide)} slide(s) • {cardsPerSlide} card(s) per slide • {trajetMotifs.length} total motif(s)
                                        </small>
                                    </div> */}
                                </div>
                            ) : (
                                <div className="alert alert-info">
                                    <p className="mb-0">Aucun motif enregistré pour ce trajet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="danger" onClick={handleCloseSuivieTrajetModal}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Image Viewer Modal */}
        <Modal show={showImageModal} onHide={() => {
            setShowImageModal(false)
            setShowSuivieTrajetModal(true)
        }} centered size="lg" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title>Visionneuse d'image</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex align-items-center justify-content-center p-0" style={{ minHeight: '500px', backgroundColor: '#f8f9fa' }}>
                {selectedImage && (
                    <img 
                        src={selectedImage} 
                        alt="Motif" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain'
                        }} 
                    />
                )}
            </Modal.Body>
        </Modal>

        {/* Success Modal */}
        <SuccessModal
            show={showSuccessModal}
            message={successMessage}
            onHide={() => setShowSuccessModal(false)}
            title="Succès"
            autoClose={true}
            autoCloseDelay={2000}
        />
        </>
    )

}

export default Invoices
