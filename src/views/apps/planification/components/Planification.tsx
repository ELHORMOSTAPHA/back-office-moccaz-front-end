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
import {useState, useEffect} from 'react'
import {Button, Card, CardFooter, CardHeader, Modal, Table, Form, Row, Col, Spinner, Alert, Nav} from 'react-bootstrap'
import {LuSearch} from 'react-icons/lu'
import {TbTruck, TbFileInvoice, TbEye, TbPackage} from 'react-icons/tb'

import {getAllDemandes, updateDemandeStatus, type Demande} from '@/services/demandeService'
import {getTrajetsByDemande, updateTrajet, getAllTrajets, type Trajet} from '@/services/trajetService'
import {getAllChauffeurs, type Chauffeur} from '@/services/chauffeurService'
import {getAllVehicules, type Vehicule} from '@/services/vehiculeService'
import {createMission, getMissionsByVehicule, addTrajetsToMission, updateMission, type CreateMissionData, type Mission} from '@/services/missionService'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import PageBreadcrumb from '@/components/PageBreadcrumb'

const columnHelper = createColumnHelper<Demande>()
const trajetColumnHelper = createColumnHelper<Trajet>()

const Planification = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState<'transport' | 'messagerie'>('transport')

    // State for API data - Transport
    const [demandes, setDemandes] = useState<Demande[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // State for API data - Messagerie
    const [trajets, setTrajets] = useState<Trajet[]>([])
    const [loadingTrajets, setLoadingTrajets] = useState(true)
    const [errorTrajets, setErrorTrajets] = useState<string | null>(null)

    // State for chauffeurs and vehicules
    const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([])
    const [vehicules, setVehicules] = useState<Vehicule[]>([])
    const [loadingChauffeurs, setLoadingChauffeurs] = useState(false)
    const [loadingVehicules, setLoadingVehicules] = useState(false)

    // Fetch demandes from API with "À planifier" status - Transport only
    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getAllDemandes({
                    status: 'À planifier',
                    type_demande: 'Transport',
                    per_page: 100
                })
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

    // Fetch trajets for Messagerie with "À planifier" status
    useEffect(() => {
        const fetchTrajets = async () => {
            try {
                setLoadingTrajets(true)
                setErrorTrajets(null)

                // Fetch all Messagerie trajets with "À planifier" status directly
                const response = await getAllTrajets({
                    status: 'À planifier',
                    type_voyage: 'Messagerie',
                    per_page: 100
                })

                setTrajets(response.data)
            } catch (err) {
                setErrorTrajets('Erreur lors du chargement des trajets. Veuillez réessayer.')
                console.error('Error fetching trajets:', err)
            } finally {
                setLoadingTrajets(false)
            }
        }

        fetchTrajets()
    }, [])

    // Fetch chauffeurs and vehicules when component mounts
    useEffect(() => {
        const fetchChauffeursAndVehicules = async () => {
            try {
                setLoadingChauffeurs(true)
                setLoadingVehicules(true)

                const [chauffeursData, vehiculesData] = await Promise.all([
                    getAllChauffeurs(),
                    getAllVehicules()
                ])

                setChauffeurs(chauffeursData)
                setVehicules(vehiculesData)
            } catch (err) {
                console.error('Error fetching chauffeurs or vehicules:', err)
            } finally {
                setLoadingChauffeurs(false)
                setLoadingVehicules(false)
            }
        }

        fetchChauffeursAndVehicules()
    }, [])

    // Helper function for status icon color
    const getStatusColor = (status: Demande['status']) => {
        switch (status) {
            case 'À planifier': return 'text-secondary'
            case 'Planifiée': return 'text-info'
            case 'Traitement en cours': return 'text-info'
            case 'Livrée': return 'text-success'
            case 'Anomalie': return 'text-danger'
            case 'Clôturée': return 'text-muted'
            default: return 'text-secondary'
        }
    }

    // Helper function for status badge color
    const getStatusBadgeColor = (status: Demande['status']) => {
        switch (status) {
            case 'À planifier': return 'bg-secondary-subtle text-secondary'
            case 'Planifiée': return 'bg-info-subtle text-info'
            case 'Traitement en cours': return 'bg-info-subtle text-info'
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
                                {row.original.client.prenom ? (
                                    <>
                                        {row.original.client.prenom} {row.original.client.nom}
                                    </>
                                ) : (
                                    <> {row.original.client.raison_sociale}</>
                                )}
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
        columnHelper.accessor('nombre_tonne', {
            header: 'Tonnage',
            cell: ({row}) => `${row.original.nombre_tonne} T`,
        }),
        columnHelper.accessor('date_enlevement_formatted', {
            header: 'Date Enlèvement',
            cell: ({row}) => {
                const dateStr = row.original.date_enlevement_formatted || row.original.date_enlevement
                // Remove time part if present (formats like "20/12/2025 00:00" -> "20/12/2025")
                return dateStr.split(' ')[0]
            },
        }),
        columnHelper.accessor('date_livraison_souhaitee', {
            header: 'Date Livraison',
            cell: ({row}) => row.original.date_livraison_souhaitee
                ? new Date(row.original.date_livraison_souhaitee).toLocaleDateString('fr-FR')
                : '-',
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
                            handleShowVoyages(row.original.id)
                        }}
                    >
                        <TbEye className="fs-lg"/>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            handleShowAffectationModal(row.original.id)
                        }}
                    >
                        <TbTruck className="fs-lg"/>
                    </Button>
                </div>
            ),
        },
    ]

    // Columns for Messagerie Trajets
    const trajetColumns = [
        trajetColumnHelper.display({
            id: 'select',
            header: () => (
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectAll}
                    onChange={(e) => {
                        setSelectAll(e.target.checked)
                        if (e.target.checked) {
                            setSelectedTrajets(trajets.map(t => t.id))
                        } else {
                            setSelectedTrajets([])
                        }
                    }}
                />
            ),
            cell: ({row}) => (
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedTrajets.includes(row.original.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedTrajets([...selectedTrajets, row.original.id])
                        } else {
                            setSelectedTrajets(selectedTrajets.filter(id => id !== row.original.id))
                            setSelectAll(false)
                        }
                    }}
                />
            ),
        }),
        trajetColumnHelper.accessor('id', {
            header: 'ID Trajet',
            cell: ({row}) => (
                <h5 className="m-0 d-flex align-items-center gap-1">
                    <TbPackage className="fs-lg text-info" />
                    <Link to="" className="link-reset fw-semibold">
                        #{String(row.original.id).padStart(3, '')}
                    </Link>
                </h5>
            ),
        }),
        trajetColumnHelper.accessor('demande', {
            header: 'ID Demande',
            cell: ({row}) => (
                <h6 className="m-0">
                    <Link to="" className="link-reset text-primary">
                        #{String(row.original.demande?.id).padStart(3, '')}
                    </Link>
                </h6>
            ),
        }),
        trajetColumnHelper.accessor('client', {
            header: 'Client',
            cell: ({row}) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    <div className="avatar-sm shrink-0">
                        <span className="avatar-title text-bg-primary fw-bold rounded-circle">
                            {row.original.client?.prenom?.charAt(0) || 'C'}
                        </span>
                    </div>
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <Link to="" className="link-reset">
                                {row.original.client?.prenom} {row.original.client?.nom}
                            </Link>
                        </h5>
                        <p className="text-muted fs-xs mb-0">{row.original.client?.email}</p>
                    </div>
                </div>
            ),
        }),
        trajetColumnHelper.accessor('ville_depart', {
            header: 'Départ → Arrivée',
            cell: ({row}) => {
                // Check if type_voyage is Transport and depot info is available
                const isTransport = row.original.demande?.type_demande === 'Transport'
                const depotDepart = row.original.depot_depart
                const depotArrivee = row.original.depot_arrivee

                if (isTransport && depotDepart && depotArrivee) {
                    return (
                        <div className="d-flex align-items-center">
                            <div className="text-start">
                                <div className="fw-bold">{depotDepart.nom_depot}</div>
                                <div className="text-muted" style={{fontSize: '0.75rem'}}>{depotDepart.ville_depot}</div>
                            </div>
                            <span className="text-muted mx-2">→</span>
                            <div className="text-start">
                                <div className="fw-bold">{depotArrivee.nom_depot}</div>
                                <div className="text-muted" style={{fontSize: '0.75rem'}}>{depotArrivee.ville_depot}</div>
                            </div>
                        </div>
                    )
                }

                // Fallback to city names for Messagerie or when depot info is not available
                return (
                    <div>
                        <strong>{row.original.ville_depart?.nom || '-'}</strong>
                        <span className="text-muted mx-1">→</span>
                        <strong>{row.original.ville_arrivee?.nom || '-'}</strong>
                    </div>
                )
            },
        }),
        trajetColumnHelper.accessor('date_depart_formatted', {
            header: 'Date Enlèvement',
            cell: ({row}) => {
                const dateStr = row.original.date_depart_formatted || row.original.date_depart
                return dateStr.split(' ')[0]
            },
        }),
        trajetColumnHelper.display({
            id: 'date_livraison',
            header: 'Date Livraison',
            cell: ({row}) => {
                // Use date_arrivee from the database instead of calculating
                const dateArriveeStr = row.original.date_arrivee_formatted || row.original.date_arrivee

                if (!dateArriveeStr) {
                    return '-'
                }

                // Remove time part if present (formats like "20/12/2025 00:00" -> "20/12/2025")
                return dateArriveeStr.split(' ')[0]
            },
        }),
        trajetColumnHelper.accessor('nombre_colies', {
            header: 'Nb Colis',
            cell: ({row}) => row.original.nombre_colies || '-',
        }),
        trajetColumnHelper.accessor('tailles_colies', {
            header: 'Taille',
            cell: ({row}) => row.original.tailles_colies || '-',
        }),
        trajetColumnHelper.accessor('status', {
            header: 'Statut',
            cell: ({row}) => {
                // Display the trajet's own status
                const status = row.original.status
                return (
                    <span className={`badge ${getStatusBadgeColor(status as Demande['status'])} badge-label`}>
                        {status}
                    </span>
                )
            },
        }),
        {
            header: 'Actions',
            cell: ({row}: { row: TableRow<Trajet> }) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            handleShowTrajetDetails(row.original)
                        }}
                    >
                        <TbEye className="fs-lg"/>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            handleShowAffectationModalTrajet(row.original)
                        }}
                    >
                        <TbTruck className="fs-lg"/>
                    </Button>
                </div>
            ),
        },
    ]

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})

    // Messagerie table state
    const [globalFilterTrajet, setGlobalFilterTrajet] = useState('')
    const [sortingTrajet, setSortingTrajet] = useState<SortingState>([])
    const [columnFiltersTrajet, setColumnFiltersTrajet] = useState<ColumnFiltersState>([])
    const [paginationTrajet, setPaginationTrajet] = useState({pageIndex: 0, pageSize: 8})

    // Multiple selection state for Messagerie
    const [selectedTrajets, setSelectedTrajets] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState(false)

    // Modal state for showing related voyages
    const [showVoyagesModal, setShowVoyagesModal] = useState(false)
    const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(null)
    const [relatedVoyages, setRelatedVoyages] = useState<Trajet[]>([])
    const [loadingVoyages, setLoadingVoyages] = useState(false)

    // Modal state for trajet details (Messagerie)
    const [showTrajetDetailsModal, setShowTrajetDetailsModal] = useState(false)
    const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null)

    // Modal state for affectation
    const [showAffectationModal, setShowAffectationModal] = useState(false)
    const [affectationFormData, setAffectationFormData] = useState({
        chauffeur: '',
        vehicule: '',
        parent: ''
    })
    const [isSubmittingAffectation, setIsSubmittingAffectation] = useState(false)

    // Parent mission selection state (for Messagerie linking to Transport missions)
    const [availableParentMissions, setAvailableParentMissions] = useState<Mission[]>([])
    const [loadingParentMissions, setLoadingParentMissions] = useState(false)
    const [showParentSelection, setShowParentSelection] = useState(false)

    // Success/Error modals
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')

    // Function to handle showing voyages for a demande
    const handleShowVoyages = async (demandeId: number) => {
        setSelectedDemandeId(demandeId)
        setShowVoyagesModal(true)
        setLoadingVoyages(true)

        try {
            const response = await getTrajetsByDemande(demandeId)
            setRelatedVoyages(response.data)
        } catch (error) {
            console.error('Error fetching trajets:', error)
            setRelatedVoyages([])
        } finally {
            setLoadingVoyages(false)
        }
    }

    const handleCloseVoyagesModal = () => {
        setShowVoyagesModal(false)
        setSelectedDemandeId(null)
        setRelatedVoyages([])
    }

    // Function to handle showing trajet details (Messagerie)
    const handleShowTrajetDetails = (trajet: Trajet) => {
        setSelectedTrajet(trajet)
        setShowTrajetDetailsModal(true)
    }

    const handleCloseTrajetDetailsModal = () => {
        setShowTrajetDetailsModal(false)
        setSelectedTrajet(null)
    }

    // Function to handle showing affectation modal
    const handleShowAffectationModal = async (demandeId: number) => {
        setAffectationFormData({ chauffeur: '', vehicule: '', parent: '' })
        setSelectedDemandeId(demandeId)
        setShowAffectationModal(true)
        setLoadingVoyages(true)

        try {
            const response = await getTrajetsByDemande(demandeId)
            setRelatedVoyages(response.data)
        } catch (error) {
            console.error('Error fetching trajets:', error)
            setRelatedVoyages([])
        } finally {
            setLoadingVoyages(false)
        }
    }

    // Function to handle showing affectation modal for single trajet (Messagerie)
    const handleShowAffectationModalTrajet = (trajet: Trajet) => {
        setAffectationFormData({ chauffeur: '', vehicule: '', parent: '' })
        setSelectedTrajet(trajet)
        setRelatedVoyages([trajet])
        setShowAffectationModal(true)
    }

    // Function to handle showing affectation modal for multiple selected trajets (Messagerie)
    const handleShowAffectationModalMultiple = () => {
        if (selectedTrajets.length === 0) {
            alert('Veuillez sélectionner au moins un trajet')
            return
        }

        setAffectationFormData({ chauffeur: '', vehicule: '', parent: '' })
        setSelectedDemandeId(null)
        setSelectedTrajet(null)

        // Filter trajets that are selected
        const selectedTrajetsList = trajets.filter(t => selectedTrajets.includes(t.id))
        setRelatedVoyages(selectedTrajetsList)
        setShowAffectationModal(true)
    }

    const handleCloseAffectationModal = () => {
        setShowAffectationModal(false)
        setSelectedDemandeId(null)
        setSelectedTrajet(null)
        setRelatedVoyages([])
        setAffectationFormData({ chauffeur: '', vehicule: '', parent: '' })
        setAvailableParentMissions([])
        setShowParentSelection(false)
    }

    const handleAffectationInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setAffectationFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Determine affectation type from the demande's type_demande field
        let isMessagerieAffectation = false
        let isTransportAffectation = false

        if (selectedDemandeId) {
            // For Transport demandes opened from the Transport tab
            const currentDemande = demandes.find(d => d.id === selectedDemandeId)
            if (currentDemande) {
                isTransportAffectation = currentDemande.type_demande === 'Transport'
                isMessagerieAffectation = currentDemande.type_demande === 'Messagerie'
            }
        } else if (relatedVoyages.length > 0 && relatedVoyages[0].demande) {
            // For Messagerie trajets (from Messagerie tab)
            isMessagerieAffectation = relatedVoyages[0].demande.type_demande === 'Messagerie'
            isTransportAffectation = relatedVoyages[0].demande.type_demande === 'Transport'
        }

        if (name === 'vehicule' && value) {
            setLoadingParentMissions(true)
            try {
                // Get the date to filter missions
                let dateToFilter = ''

                if (isMessagerieAffectation) {
                    // For messagerie: use date_arrivee (delivery date) instead of date_depart
                    const messagerieDeliveryDate = relatedVoyages[0]?.date_arrivee
                    if (messagerieDeliveryDate) {
                        const dateStr = messagerieDeliveryDate.toString()
                        if (dateStr.includes('/')) {
                            // Handle DD/MM/YYYY format
                            const [day, month, year] = dateStr.split(' ')[0].split('/')
                            dateToFilter = `${year}-${month}-${day}`
                        } else if (dateStr.includes(' ')) {
                            // Handle YYYY-MM-DD HH:MM:SS format
                            dateToFilter = dateStr.split(' ')[0]
                        } else {
                            // Handle ISO date format
                            const date = new Date(messagerieDeliveryDate)
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            dateToFilter = `${year}-${month}-${day}`
                        }
                    }
                } else if (isTransportAffectation && selectedDemandeId) {
                    // For transport: use delivery date from the demande
                    const currentDemande = demandes.find(d => d.id === selectedDemandeId)
                    if (currentDemande?.date_livraison_souhaitee) {
                        const dateStr = currentDemande.date_livraison_souhaitee.toString()
                        if (dateStr.includes(' ')) {
                            dateToFilter = dateStr.split(' ')[0]
                        } else {
                            const date = new Date(currentDemande.date_livraison_souhaitee)
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            dateToFilter = `${year}-${month}-${day}`
                        }
                    }
                }

                // Build fetch filters based on affectation type
                const fetchFilters: any = {
                    statut: 'Planifiée'
                }

                // For both types, add date filter if available
                if (dateToFilter) {
                    fetchFilters.date_from = dateToFilter
                    // For both Transport and Messagerie: use filter_by_delivery_date to find missions on same delivery date
                    fetchFilters.filter_by_delivery_date = true
                }

                const response = await getMissionsByVehicule(parseInt(value), fetchFilters)

                const missions = response.data || response
                const hasMissions = Array.isArray(missions) && missions.length > 0

                if (hasMissions) {
                    if (isMessagerieAffectation) {
                        // For Messagerie: show warning about existing missions AND allow linking to Transport missions with parent
                        setAvailableParentMissions(missions)
                        setShowParentSelection(true)
                    } else if (isTransportAffectation) {
                        // For Transport: show warning about existing missions
                        setAvailableParentMissions(missions)
                        setShowParentSelection(true)
                    }
                } else {
                    setAvailableParentMissions([])
                    setShowParentSelection(false)
                }
            } catch (error) {
                console.error('Error fetching vehicle missions:', error)
                setAvailableParentMissions([])
                setShowParentSelection(false)
            } finally {
                setLoadingParentMissions(false)
            }
        }

        // Reset parent selection when vehicle changes
        if (name === 'vehicule') {
            setAffectationFormData(prev => ({
                ...prev,
                parent: ''
            }))
        }
    }

    const handleSubmitAffectation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!affectationFormData.chauffeur || !affectationFormData.vehicule) {
            setModalMessage('Veuillez sélectionner un chauffeur et un véhicule')
            setShowErrorModal(true)
            return
        }

        setIsSubmittingAffectation(true)

        try {
            // Update all related trajets with chauffeur, vehicule IDs, parent and status
            const updatePromises = relatedVoyages.map(trajet => {
                const updateData: any = {
                    id_chauffeur: parseInt(affectationFormData.chauffeur),
                    id_vehicule: parseInt(affectationFormData.vehicule),
                    status: 'Planifiée'
                }

                // Add parent field if a parent mission is selected
                // The parent field in trajets should store the id_parent_demande from the selected mission
                // Note: When adding to Messagerie missions without parent, this will be null - that's OK
                if (affectationFormData.parent) {
                    const selectedMission = availableParentMissions.find(m => m.id === parseInt(affectationFormData.parent))
                    if (selectedMission) {
                        // Store id_parent_demande if it exists, otherwise null (for Messagerie missions)
                        updateData.parent = selectedMission.id_parent_demande || null
                    }
                }

                return updateTrajet(trajet.id, updateData)
            })

            await Promise.all(updatePromises)

            // Update demande status to "Planifiée" and is_parent flag
            if (selectedDemandeId) {
                // Update demande status if we have a selected demande (Transport tab)
                await updateDemandeStatus(selectedDemandeId, 'Planifiée')
            } else if (relatedVoyages.length > 0) {
                // For Messagerie tab, update demande status for each trajet
                const uniqueDemandeIds = [...new Set(relatedVoyages.map(t => t.demande?.id).filter(id => id !== undefined))]
                await Promise.all(
                    uniqueDemandeIds.map(demandeId =>
                        updateDemandeStatus(demandeId as number, 'Planifiée')
                    )
                )
            }

            // If a parent mission was selected, update its parent demande's is_parent flag
            if (affectationFormData.parent) {
                const selectedMission = availableParentMissions.find(m => m.id === parseInt(affectationFormData.parent))
                if (selectedMission && selectedMission.id_parent_demande) {
                    // Update the is_parent flag to true for the parent demande
                    try {
                        await updateDemandeStatus(selectedMission.id_parent_demande, 'Planifiée')
                        // Note: We need to add a separate API call to update is_parent flag
                    } catch (error) {
                        console.error('Error updating parent demande is_parent flag:', error)
                    }
                }
            }

            let missionResponse
            const chauffeur = chauffeurs.find(c => c.id === parseInt(affectationFormData.chauffeur))
            const vehicule = vehicules.find(v => v.id === parseInt(affectationFormData.vehicule))
            const chauffeurName = chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : 'Chauffeur'
            const vehiculeInfo = vehicule ? vehicule.immatriculation : 'Véhicule'

            // Check if a parent mission is selected
            if (affectationFormData.parent) {
                // Add trajets to existing mission and update type to mixte
                console.log('=== ADDING TRAJETS TO EXISTING MISSION ===', {
                    missionId: affectationFormData.parent,
                    trajetIds: relatedVoyages.map(t => t.id)
                })

                missionResponse = await addTrajetsToMission(
                    parseInt(affectationFormData.parent),
                    relatedVoyages.map(t => t.id)
                )

                console.log('=== TRAJETS ADDED TO MISSION ===', missionResponse)

                // Determine the new mission type based on the combination
                const selectedMission = availableParentMissions.find(m => m.id === parseInt(affectationFormData.parent))
                const currentMissionType = selectedMission?.type_mission

                // For trajets: check type_voyage first, then demande type_demande
                // This ensures we get 'Messagerie' for messagerie trajets, not 'Transport' from parent demande
                const newTrajetType = relatedVoyages[0]?.type_voyage || relatedVoyages[0]?.demande?.type_demande

                console.log('=== MISSION TYPE DETERMINATION ===', {
                    currentMissionType,
                    newTrajetType,
                    trajetTypeVoyage: relatedVoyages[0]?.type_voyage,
                    demandeTypeDemande: relatedVoyages[0]?.demande?.type_demande
                })

                let newMissionType = currentMissionType

                // Update mission type only if combining different types (Transport + Messagerie = Mixte)
                if (currentMissionType === 'Transport' && newTrajetType === 'Messagerie') {
                    newMissionType = 'Mixte'
                } else if (currentMissionType === 'Messagerie' && newTrajetType === 'Transport') {
                    newMissionType = 'Mixte'
                }
                // If both are same type (Transport + Transport OR Messagerie + Messagerie), keep current type
                // If already Mixte, keep it Mixte

                if (newMissionType !== currentMissionType) {
                    await updateMission(parseInt(affectationFormData.parent), {
                        type_mission: newMissionType
                    })
                    console.log('=== MISSION TYPE UPDATED ===', { from: currentMissionType, to: newMissionType })
                } else {
                    console.log('=== MISSION TYPE UNCHANGED ===', { type: currentMissionType, reason: 'Same type combination' })
                }

                setModalMessage(
                    `Trajets ajoutés à la mission existante!\n\n` +
                    `• ${relatedVoyages.length} trajet(s) ${newTrajetType} ajouté(s)\n` +
                    `• Type de mission: ${newMissionType}${newMissionType === 'Mixte' ? ' (Transport + Messagerie)' : ''}\n` +
                    `• Statut: ${missionResponse.data.statut || 'Planifiée'}\n` +
                    `• Chauffeur: ${chauffeurName}\n` +
                    `• Véhicule: ${vehiculeInfo}`
                )
            } else {
                // Create new mission with the assigned chauffeur, vehicule, and trajets
                const firstTrajet = relatedVoyages[0]

                // Determine which demande ID to save:
                // 1. For Transport tab: use selectedDemandeId (the demande being planned)
                // 2. For Messagerie without parent: use the first trajet's demande ID
                let demandeIdToSave: number | null = null
                if (selectedDemandeId) {
                    // Transport tab - save the demande being planned
                    demandeIdToSave = selectedDemandeId
                } else if (firstTrajet?.demande?.id) {
                    // Messagerie without parent - save the first trajet's demande ID
                    demandeIdToSave = firstTrajet.demande.id
                }

                const missionData: CreateMissionData = {
                    id_chauffeur: parseInt(affectationFormData.chauffeur),
                    id_vehicule: parseInt(affectationFormData.vehicule),
                    type_mission: firstTrajet?.type_voyage || 'Transport',
                    date_enlevement: firstTrajet?.date_depart || new Date().toISOString(),
                    statut: 'Planifiée',
                    id_parent_demande: demandeIdToSave,
                    trajets: relatedVoyages.map(t => t.id)
                }

                console.log('=== MISSION DATA BEING SENT ===', {
                    missionData,
                    selectedDemandeId,
                    firstTrajetDemandeId: firstTrajet?.demande?.id,
                    calculated_demande_id: demandeIdToSave
                })

                missionResponse = await createMission(missionData)
                console.log('=== MISSION RESPONSE ===', missionResponse)

                setModalMessage(
                    `Affectation réussie!\n\n` +
                    `• ${relatedVoyages.length} trajet(s) affecté(s)\n` +
                    `• Chauffeur: ${chauffeurName}\n` +
                    `• Véhicule: ${vehiculeInfo}\n` +
                    `• Statut: Planifiée\n` +
                    `• Mission créée avec succès`
                )
            }

            setShowSuccessModal(true)
            handleCloseAffectationModal()

            // Clear selection if multiple trajets were selected
            setSelectedTrajets([])
            setSelectAll(false)

            // Reload after 2 seconds to reflect changes
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (error) {
            console.error('Error during affectation:', error)
            setModalMessage('Erreur lors de l\'affectation. Veuillez réessayer.')
            setShowErrorModal(true)
        } finally {
            setIsSubmittingAffectation(false)
        }
    }

    const table = useReactTable({
        data: demandes,
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

    const trajetTable = useReactTable({
        data: trajets,
        columns: trajetColumns,
        state: {sorting: sortingTrajet, globalFilter: globalFilterTrajet, columnFilters: columnFiltersTrajet, pagination: paginationTrajet},
        onSortingChange: setSortingTrajet,
        onGlobalFilterChange: setGlobalFilterTrajet,
        onColumnFiltersChange: setColumnFiltersTrajet,
        onPaginationChange: setPaginationTrajet,
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

    // Pagination for trajet table
    const trajetPageIndex = trajetTable.getState().pagination.pageIndex
    const trajetPageSize = trajetTable.getState().pagination.pageSize
    const trajetTotalItems = trajetTable.getFilteredRowModel().rows.length

    const trajetStart = trajetPageIndex * trajetPageSize + 1
    const trajetEnd = Math.min(trajetStart + trajetPageSize - 1, trajetTotalItems)

    return (
        <>
            <PageBreadcrumb title="Liste de planification" subtitle="Planification" />

            {/* Transport Tab */}
            {activeTab === 'transport' && (
                <>
                    {loading && (
                        <Card>
                            <Card.Body className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Chargement des demandes Transport...</p>
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
                                                const response = await getAllDemandes({
                                                    status: 'À planifier',
                                                    type_demande: 'Transport',
                                                    per_page: 100
                                                })
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
                                            placeholder="Search demandes Transport..."
                                            value={globalFilter ?? ''}
                                            onChange={(e) => setGlobalFilter(e.target.value)}
                                        />
                                        <LuSearch className="app-search-icon text-muted"/>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <span className="me-2 fw-semibold">Affichage:</span>

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

                            {/* Tabs Navigation */}
                            <Card.Body className="p-0 border-bottom">
                                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'transport' | 'messagerie')}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="transport" className="d-flex align-items-center gap-2">
                                            <TbTruck size={20} />
                                            <span>Transport ({demandes.length})</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="messagerie" className="d-flex align-items-center gap-2">
                                            <TbPackage size={20} />
                                            <span>Messagerie ({trajets.length})</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>

                            <DataTable<Demande> table={table} emptyMessage="Aucune demande Transport à planifier"/>

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
                </>
            )}

            {/* Messagerie Tab */}
            {activeTab === 'messagerie' && (
                <>
                    {loadingTrajets && (
                        <Card>
                            <Card.Body className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Chargement des trajets Messagerie...</p>
                            </Card.Body>
                        </Card>
                    )}

                    {errorTrajets && !loadingTrajets && (
                        <Card>
                            <Card.Body>
                                <Alert variant="danger" className="mb-0">
                                    <Alert.Heading>Erreur</Alert.Heading>
                                    <p className="mb-0">{errorTrajets}</p>
                                    <hr />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={async () => {
                                            setLoadingTrajets(true)
                                            setErrorTrajets(null)
                                            try {
                                                const response = await getAllTrajets({
                                                    status: 'À planifier',
                                                    type_voyage: 'Messagerie',
                                                    per_page: 100
                                                })
                                                setTrajets(response.data)
                                            } catch (err) {
                                                setErrorTrajets('Erreur lors du chargement des trajets.')
                                            } finally {
                                                setLoadingTrajets(false)
                                            }
                                        }}
                                    >
                                        Réessayer
                                    </Button>
                                </Alert>
                            </Card.Body>
                        </Card>
                    )}

                    {!loadingTrajets && !errorTrajets && (
                        <Card>
                            <CardHeader className="border-light justify-content-between">
                                <div className="d-flex gap-2 align-items-center">
                                    <div className="app-search">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search trajets Messagerie..."
                                            value={globalFilterTrajet ?? ''}
                                            onChange={(e) => setGlobalFilterTrajet(e.target.value)}
                                        />
                                        <LuSearch className="app-search-icon text-muted"/>
                                    </div>
                                    {selectedTrajets.length > 0 && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleShowAffectationModalMultiple}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <TbTruck size={18} />
                                            Affecter ({selectedTrajets.length})
                                        </Button>
                                    )}
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <span className="me-2 fw-semibold">Affichage:</span>

                                    <div>
                                        <select
                                            className="form-select form-control my-1 my-md-0"
                                            value={trajetTable.getState().pagination.pageSize}
                                            onChange={(e) => trajetTable.setPageSize(Number(e.target.value))}>
                                            {[5, 8, 10, 15, 20].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Tabs Navigation */}
                            <Card.Body className="p-0 border-bottom">
                                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'transport' | 'messagerie')}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="transport" className="d-flex align-items-center gap-2">
                                            <TbTruck size={20} />
                                            <span>Transport ({demandes.length})</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="messagerie" className="d-flex align-items-center gap-2">
                                            <TbPackage size={20} />
                                            <span>Messagerie ({trajets.length})</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>

                            <DataTable<Trajet> table={trajetTable} emptyMessage="Aucun trajet Messagerie à planifier"/>

                            {trajetTable.getRowModel().rows.length > 0 && (
                                <CardFooter className="border-0">
                                    <TablePagination
                                        totalItems={trajetTotalItems}
                                        start={trajetStart}
                                        end={trajetEnd}
                                        itemsName="trajets"
                                        showInfo
                                        previousPage={trajetTable.previousPage}
                                        canPreviousPage={trajetTable.getCanPreviousPage()}
                                        pageCount={trajetTable.getPageCount()}
                                        pageIndex={trajetTable.getState().pagination.pageIndex}
                                        setPageIndex={trajetTable.setPageIndex}
                                        nextPage={trajetTable.nextPage}
                                        canNextPage={trajetTable.getCanNextPage()}
                                    />
                                </CardFooter>
                            )}
                        </Card>
                    )}
                </>
            )}

        {/* Modal for showing related voyages */}
        <Modal show={showVoyagesModal} onHide={handleCloseVoyagesModal} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    Trajet liés à la demande #{selectedDemandeId}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loadingVoyages ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des trajets...</p>
                    </div>
                ) : relatedVoyages.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID Trajet</th>
                                <th>Chauffeur</th>
                                <th>Véhicule</th>
                                <th>Départ</th>
                                <th>Arrivée</th>
                                <th>Date Enlèvement</th>
                                <th>Nombre de Cartons</th>
                                <th>Manutention</th>
                                <th>Retour</th>
                                <th>Heure de Livraison</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedVoyages.map((trajet) => (
                                <tr key={trajet.id}>
                                    <td>
                                        <strong className="text-primary">#{String(trajet.id).padStart(3, '')}</strong>
                                    </td>
                                    <td>
                                        {trajet.chauffeur ? (
                                            <span>{trajet.chauffeur.prenom} {trajet.chauffeur.nom}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>
                                        {trajet.vehicule ? (
                                            <span>{trajet.vehicule.marque} {trajet.vehicule.modele} - {trajet.vehicule.immatriculation}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>
                                        {trajet.depot_depart ? (
                                            <div>
                                                <div className="fw-bold">{trajet.depot_depart.nom_depot}</div>
                                                <div className="text-muted" style={{fontSize: '0.75rem'}}>{trajet.depot_depart.ville_depot}</div>
                                            </div>
                                        ) : (
                                            trajet.ville_depart?.nom || '-'
                                        )}
                                    </td>
                                    <td>
                                        {trajet.depot_arrivee ? (
                                            <div>
                                                <div className="fw-bold">{trajet.depot_arrivee.nom_depot}</div>
                                                <div className="text-muted" style={{fontSize: '0.75rem'}}>{trajet.depot_arrivee.ville_depot}</div>
                                            </div>
                                        ) : (
                                            trajet.ville_arrivee?.nom || '-'
                                        )}
                                    </td>
                                    <td>{trajet.date_depart_formatted?.split(' ')[0] || new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                    <td className="text-center">{trajet.nombre_colies || '-'}</td>
                                    <td className="text-center">
                                        <span className={`badge ${trajet.manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                            {trajet.manutention ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${trajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                            {trajet.retour ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td className="text-center">{trajet.heure_livraison || '-'}</td>
                                    <td>
                                        <span className={`badge ${
                                            trajet.status === 'À planifier' ? 'bg-secondary-subtle text-secondary' :
                                            trajet.status === 'Planifiée' ? 'bg-info-subtle text-info' :
                                            trajet.status === 'Livrée' ? 'bg-success-subtle text-success' :
                                            trajet.status === 'Anomalie' ? 'bg-danger-subtle text-danger' :
                                            trajet.status === 'Clôturée' ? 'bg-dark-subtle text-dark' :
                                            'bg-secondary-subtle text-secondary'
                                        } badge-label`}>
                                            {trajet.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center py-4">
                        <TbTruck size={48} className="text-muted mb-3" />
                        <h6 className="text-muted">Aucun trajet associé à cette demande</h6>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className='btn-danger' onClick={handleCloseVoyagesModal}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Modal for showing trajet details (Messagerie) */}
        <Modal show={showTrajetDetailsModal} onHide={handleCloseTrajetDetailsModal} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Détails du Trajet #{selectedTrajet?.id}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedTrajet && (
                    <div>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>ID Trajet:</strong> #{String(selectedTrajet.id).padStart(3, '')}
                            </Col>
                            <Col md={6}>
                                <strong>ID Demande:</strong>{' '}
                                <span className="text-primary">
                                    #{String(selectedTrajet.demande?.id).padStart(3, '')}
                                </span>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>Type:</strong>{' '}
                                <span className="badge bg-info-subtle text-info">
                                    {selectedTrajet.type_voyage}
                                </span>
                            </Col>
                            <Col md={6}>
                                <strong>Statut:</strong>{' '}
                                <span className={`badge ${getStatusBadgeColor((selectedTrajet.demande?.status || selectedTrajet.status) as Demande['status'])} badge-label`}>
                                    {selectedTrajet.demande?.status || selectedTrajet.status}
                                </span>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>Ville Départ:</strong> {selectedTrajet.ville_depart?.nom || '-'}
                            </Col>
                            <Col md={6}>
                                <strong>Ville Arrivée:</strong> {selectedTrajet.ville_arrivee?.nom || '-'}
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>Date Enlèvement:</strong> {selectedTrajet.date_depart_formatted?.split(' ')[0]}
                            </Col>
                            <Col md={6}>
                                <strong>Date Livraison:</strong> {selectedTrajet.date_arrivee_formatted?.split(' ')[0]}
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>Nombre de Colis:</strong> {selectedTrajet.nombre_colies || '-'}
                            </Col>
                            <Col md={6}>
                                <strong>Taille:</strong> {selectedTrajet.tailles_colies || '-'}
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            {/* <Col md={6}>
                                <strong>Manutention:</strong>{' '}
                                <span className={`badge ${selectedTrajet.manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {selectedTrajet.manutention ? 'Oui' : 'Non'}
                                </span>
                            </Col> */}
                            <Col md={6}>
                                <strong>Retour:</strong>{' '}
                                <span className={`badge ${selectedTrajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {selectedTrajet.retour ? 'Oui' : 'Non'}
                                </span>
                            </Col>
                        </Row>
                        {selectedTrajet.client && (
                            <Row className="mb-3">
                                <Col md={12}>
                                    <strong>Client:</strong>{selectedTrajet.client.prenom ? (
                                        <>
                                            {selectedTrajet.client.prenom} {selectedTrajet.client.nom}
                                        </>
                                    ) : (
                                        <> {selectedTrajet.client.raison_sociale}</>
                                    )
                                    }
                                    <br />
                                    <small className="text-muted">{selectedTrajet.client.email}</small>
                                </Col>
                            </Row>
                        )}
                        {selectedTrajet.notes && (
                            <Row className="mb-3">
                                <Col md={12}>
                                    <strong>Notes:</strong>
                                    <p className="text-muted">{selectedTrajet.notes}</p>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className='btn-danger' onClick={handleCloseTrajetDetailsModal}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Modal for affectation */}
        <Modal show={showAffectationModal} onHide={handleCloseAffectationModal} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Affecter Chauffeur et Véhicule
                    {selectedDemandeId && ` - Demande #${selectedDemandeId}`}
                    {selectedTrajet && !selectedDemandeId && ` - Trajet #${selectedTrajet.id}`}
                    {!selectedDemandeId && !selectedTrajet && relatedVoyages.length > 1 && ` - ${relatedVoyages.length} Trajets sélectionnés`}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitAffectation}>
                <Modal.Body>
                    <div className="mb-4">
                        <h6 className="text-muted mb-3">
                            <TbTruck className="me-2" />
                            Trajet à affecter ({relatedVoyages.length})
                        </h6>
                        {loadingVoyages && !selectedTrajet ? (
                            <div className="text-center py-3">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="ms-2 text-muted">Chargement des trajets...</span>
                            </div>
                        ) : relatedVoyages.length > 0 ? (
                            <div className="border rounded p-3 bg-light">
                                {relatedVoyages.map((trajet) => (
                                    <div key={trajet.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong className="text-primary">#{String(trajet.id).padStart(3, '')}</strong>
                                            <span className="ms-2 text-muted">
                                                {trajet.type_voyage === 'Transport' ? (
                                                    <>
                                                        {trajet.depot_depart ? (
                                                            <>
                                                                <strong>{trajet.depot_depart.nom_depot}</strong>
                                                                <small className="text-muted"> ({trajet.depot_depart.ville_depot})</small>
                                                            </>
                                                        ) : (
                                                            trajet.ville_depart?.nom || '-'
                                                        )}
                                                        {' → '}
                                                        {trajet.depot_arrivee ? (
                                                            <>
                                                                <strong>{trajet.depot_arrivee.nom_depot}</strong>
                                                                <small className="text-muted"> ({trajet.depot_arrivee.ville_depot})</small>
                                                            </>
                                                        ) : (
                                                            trajet.ville_arrivee?.nom || '-'
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {trajet.ville_depart?.nom || '-'} → {trajet.ville_arrivee?.nom || '-'}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <span className={`badge ${getStatusBadgeColor((trajet.demande?.status || trajet.status) as Demande['status'])} badge-label`}>
                                            {trajet.demande?.status || trajet.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-3 text-muted">
                                Aucun trajet trouvé pour cette demande
                            </div>
                        )}
                    </div>

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
                                    {chauffeurs.map((chauffeur) => (
                                        <option key={chauffeur.id} value={chauffeur.id.toString()}>
                                            {chauffeur.prenom} {chauffeur.nom} - {chauffeur.telephone}
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
                                    {vehicules.map((vehicule) => (
                                        <option key={vehicule.id} value={vehicule.id.toString()}>
                                            {vehicule.type_vehicule?.libelle_type_vehicule || 'Véhicule'} - {vehicule.immatriculation} - {vehicule.tonnage}T
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>
                    </Row>

                    {/* Parent Mission Selection - Show when vehicle is already assigned to Transport missions */}
                    {showParentSelection && availableParentMissions.length > 0 && (() => {
                        // Determine affectation type
                        let isMessagerieAffectation = false
                        let isTransportAffectation = false

                        if (selectedDemandeId) {
                            const currentDemande = demandes.find(d => d.id === selectedDemandeId)
                            if (currentDemande) {
                                isTransportAffectation = currentDemande.type_demande === 'Transport'
                                isMessagerieAffectation = currentDemande.type_demande === 'Messagerie'
                            }
                        } else if (relatedVoyages.length > 0 && relatedVoyages[0].demande) {
                            isMessagerieAffectation = relatedVoyages[0].demande.type_demande === 'Messagerie'
                            isTransportAffectation = relatedVoyages[0].demande.type_demande === 'Transport'
                        }

                        // Get the appropriate date for display
                        let displayDate = 'même jour'
                        if (isMessagerieAffectation && relatedVoyages[0]?.date_arrivee) {
                            // For Messagerie: use date_arrivee from database
                            const dateArriveeStr = relatedVoyages[0].date_arrivee.toString()
                            if (dateArriveeStr.includes('/')) {
                                // Already in DD/MM/YYYY format
                                displayDate = dateArriveeStr.split(' ')[0]
                            } else if (dateArriveeStr.includes(' ')) {
                                // YYYY-MM-DD HH:MM:SS format - convert to DD/MM/YYYY
                                const datePart = dateArriveeStr.split(' ')[0]
                                const [year, month, day] = datePart.split('-')
                                displayDate = `${day}/${month}/${year}`
                            } else {
                                // ISO format
                                displayDate = new Date(relatedVoyages[0].date_arrivee).toLocaleDateString('fr-FR')
                            }
                        } else if (isTransportAffectation && selectedDemandeId) {
                            // For Transport, get date_livraison_souhaitee from demande
                            const currentDemande = demandes.find(d => d.id === selectedDemandeId)
                            if (currentDemande?.date_livraison_souhaitee) {
                                displayDate = new Date(currentDemande.date_livraison_souhaitee).toLocaleDateString('fr-FR')
                            }
                        }

                        return (
                            <div className="mb-3">
                                {isMessagerieAffectation ? (
                                    // MESSAGERIE: Show warning and parent selection
                                    <>
                                        <div className="alert alert-warning mb-3">
                                            <div className="d-flex align-items-start">
                                                <div className="me-2" style={{ fontSize: '1.25rem' }}>⚠️</div>
                                                <div>
                                                    <strong>Véhicule déjà affecté</strong><br />
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        Ce véhicule est déjà assigné à <strong>{availableParentMissions.length} mission(s)</strong> avec livraison le <strong>{displayDate}</strong>.
                                                        {availableParentMissions.some(m => m.type_mission === 'Transport') && ' Incluant des missions Transport.'}
                                                        {availableParentMissions.some(m => m.type_mission === 'Messagerie') && ' Incluant des missions Messagerie.'}
                                                        {availableParentMissions.some(m => m.type_mission === 'Mixte') && ' Incluant des missions Mixte.'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* For Messagerie: Show all missions as linkable */}
                                        {(() => {
                                            // For Messagerie, all missions are linkable
                                            const linkableMissions = isMessagerieAffectation ? availableParentMissions : availableParentMissions.filter(m => m.id_parent_demande)
                                            const warningOnlyMissions = isMessagerieAffectation ? [] : availableParentMissions.filter(m => !m.id_parent_demande)

                                            return (
                                                <>
                                                    {linkableMissions.length > 0 && (
                                                        <>
                                                            <label htmlFor="parent" className="form-label fw-semibold">
                                                                <TbTruck className="me-2" />
                                                                {isMessagerieAffectation ? 'Ajouter à une mission existante (Optionnel)' : 'Missions disponibles pour liaison (Optionnel)'}
                                                            </label>
                                                            {loadingParentMissions ? (
                                                                <div className="text-center py-3">
                                                                    <Spinner animation="border" variant="primary" size="sm" />
                                                                    <span className="ms-2 text-muted">Chargement des missions...</span>
                                                                </div>
                                                            ) : (
                                                                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-3">
                                                                    {/* None option */}
                                                                    <div
                                                                        className={`border rounded p-2 mb-2 cursor-pointer ${!affectationFormData.parent ? 'border-primary bg-primary-subtle' : 'bg-white'}`}
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => setAffectationFormData(prev => ({ ...prev, parent: '' }))}
                                                                    >
                                                                        <div className="d-flex align-items-center">
                                                                            <input
                                                                                type="radio"
                                                                                name="parent"
                                                                                value=""
                                                                                checked={!affectationFormData.parent}
                                                                                onChange={() => setAffectationFormData(prev => ({ ...prev, parent: '' }))}
                                                                                className="form-check-input me-2"
                                                                            />
                                                                            <div>
                                                                                <strong className="text-muted" style={{ fontSize: '0.875rem' }}>Aucune mission parent</strong>
                                                                                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Créer une nouvelle mission indépendante</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Linkable mission options */}
                                                                    {linkableMissions.map((mission) => {
                                                                        const isSelected = affectationFormData.parent === mission.id.toString()

                                                                        // Get badge color based on mission type
                                                                        const getBadgeClass = (type: string) => {
                                                                            switch(type) {
                                                                                case 'Transport': return 'bg-primary-subtle text-primary'
                                                                                case 'Messagerie': return 'bg-info-subtle text-info'
                                                                                case 'Mixte': return 'bg-warning-subtle text-warning'
                                                                                default: return 'bg-secondary-subtle text-secondary'
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={mission.id}
                                                                                className={`border rounded p-2 mb-2 cursor-pointer ${isSelected ? 'border-primary bg-primary-subtle' : 'bg-white'}`}
                                                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                                                onClick={() => setAffectationFormData(prev => ({ ...prev, parent: mission.id.toString() }))}
                                                                            >
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name="parent"
                                                                                        value={mission.id.toString()}
                                                                                        checked={isSelected}
                                                                                        onChange={() => setAffectationFormData(prev => ({ ...prev, parent: mission.id.toString() }))}
                                                                                        className="form-check-input"
                                                                                    />
                                                                                    <div className="grow">
                                                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                            <div>
                                                                                                <strong className="text-primary" style={{ fontSize: '0.875rem' }}>
                                                                                                    Mission #{String(mission.id).padStart(3, '0')}
                                                                                                </strong>
                                                                                                {mission.parent_demande ? (
                                                                                                    <span className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
                                                                                                        (Demande #{String(mission.parent_demande.id).padStart(3, '0')})
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
                                                                                                        ({mission.trajets?.length || 0} trajet(s))
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                            <span className={`badge ${getBadgeClass(mission.type_mission)} badge-label`} style={{ fontSize: '0.75rem' }}>
                                                                                                {mission.type_mission}
                                                                                            </span>
                                                                                        </div>

                                                                                        <div className="d-flex gap-2 align-items-center" style={{ fontSize: '0.75rem' }}>
                                                                                            {mission.chauffeur && (
                                                                                                <div className="text-muted">
                                                                                                    <TbTruck className="me-1" size={14} />
                                                                                                    {mission.chauffeur.prenom} {mission.chauffeur.nom}
                                                                                                </div>
                                                                                            )}
                                                                                            {mission.vehicule && (
                                                                                                <div className="text-muted">
                                                                                                    • {mission.vehicule.immatriculation}
                                                                                                </div>
                                                                                            )}
                                                                                            {mission.parent_demande?.date_livraison_souhaitee ? (
                                                                                                <div className="text-muted">
                                                                                                    • Livraison: {new Date(mission.parent_demande.date_livraison_souhaitee).toLocaleDateString('fr-FR')}
                                                                                                </div>
                                                                                            ) : mission.trajets && mission.trajets.length > 0 && mission.trajets[0].date_arrivee && (
                                                                                                <div className="text-muted">
                                                                                                    • Livraison: {(() => {
                                                                                                        const dateStr = mission.trajets[0].date_arrivee.toString()
                                                                                                        if (dateStr.includes('/')) {
                                                                                                            return dateStr.split(' ')[0]
                                                                                                        } else if (dateStr.includes(' ')) {
                                                                                                            const [year, month, day] = dateStr.split(' ')[0].split('-')
                                                                                                            return `${day}/${month}/${year}`
                                                                                                        } else {
                                                                                                            return new Date(mission.trajets[0].date_arrivee).toLocaleDateString('fr-FR')
                                                                                                        }
                                                                                                    })()}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                            {affectationFormData.parent && (
                                                                <small className="form-text text-success mt-2 d-block">
                                                                    ✓ Le trajet Messagerie sera lié à la mission sélectionnée (type Mixte).
                                                                </small>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Show warning-only missions (those without parent) */}
                                                    {warningOnlyMissions.length > 0 && (
                                                        <>
                                                            <div className="border rounded p-3 bg-light mt-3">
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <TbTruck className="me-2 text-muted" size={20} />
                                                                    <strong className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                                        Autres missions sur ce véhicule (information uniquement):
                                                                    </strong>
                                                                </div>
                                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                                    {warningOnlyMissions.map((mission) => {
                                                                        const getBadgeClass = (type: string) => {
                                                                            switch(type) {
                                                                                case 'Transport': return 'bg-primary-subtle text-primary'
                                                                                case 'Messagerie': return 'bg-info-subtle text-info'
                                                                                case 'Mixte': return 'bg-warning-subtle text-warning'
                                                                                default: return 'bg-secondary-subtle text-secondary'
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div key={mission.id} className="border rounded p-2 mb-2 bg-white">
                                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                    <strong className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                                                        Mission #{String(mission.id).padStart(3, '0')}
                                                                                    </strong>
                                                                                    <span className={`badge ${getBadgeClass(mission.type_mission)} badge-label`} style={{ fontSize: '0.75rem' }}>
                                                                                        {mission.type_mission}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex gap-2 align-items-center flex-wrap" style={{ fontSize: '0.75rem' }}>
                                                                                    {mission.chauffeur && (
                                                                                        <div className="text-muted">
                                                                                            <TbTruck className="me-1" size={14} />
                                                                                            {mission.chauffeur.prenom} {mission.chauffeur.nom}
                                                                                        </div>
                                                                                    )}
                                                                                    {mission.vehicule && (
                                                                                        <div className="text-muted">
                                                                                            • {mission.vehicule.immatriculation}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <small className="form-text text-muted mt-2 d-block">
                                                                ℹ️ Ces missions ne peuvent pas être liées (missions Messagerie indépendantes).
                                                            </small>
                                                        </>
                                                    )}
                                                </>
                                            )
                                        })()}
                                    </>
                                ) : isTransportAffectation ? (
                                    // TRANSPORT: Show warning only (no selection)
                                    <>
                                        <div className="alert alert-warning mb-3">
                                            <div className="d-flex align-items-start">
                                                <div className="me-2" style={{ fontSize: '1.25rem' }}>⚠️</div>
                                                <div>
                                                    <strong>Véhicule déjà affecté</strong><br />
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        Ce véhicule est déjà assigné à <strong>{availableParentMissions.length} mission(s)</strong> avec livraison le <strong>{displayDate}</strong>.
                                                        {availableParentMissions.some(m => m.type_mission === 'Transport') && ' Incluant des missions Transport.'}
                                                        {availableParentMissions.some(m => m.type_mission === 'Messagerie') && ' Incluant des missions Messagerie.'}
                                                        {availableParentMissions.some(m => m.type_mission === 'Mixte') && ' Incluant des missions Mixte.'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded p-3 bg-light">
                                            <div className="d-flex align-items-center mb-2">
                                                <TbTruck className="me-2 text-warning" size={20} />
                                                <strong className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                    Missions déjà planifiées pour ce véhicule:
                                                </strong>
                                            </div>
                                            {loadingParentMissions ? (
                                                <div className="text-center py-3">
                                                    <Spinner animation="border" variant="primary" size="sm" />
                                                    <span className="ms-2 text-muted">Chargement des missions...</span>
                                                </div>
                                            ) : (
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {availableParentMissions.map((mission) => {
                                                        // Get badge color based on mission type
                                                        const getBadgeClass = (type: string) => {
                                                            switch(type) {
                                                                case 'Transport': return 'bg-primary-subtle text-primary'
                                                                case 'Messagerie': return 'bg-info-subtle text-info'
                                                                case 'Mixte': return 'bg-warning-subtle text-warning'
                                                                default: return 'bg-secondary-subtle text-secondary'
                                                            }
                                                        }

                                                        return (
                                                            <div key={mission.id} className="border rounded p-2 mb-2 bg-white">
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <strong className="text-primary" style={{ fontSize: '0.875rem' }}>
                                                                        Mission #{String(mission.id).padStart(3, '')}
                                                                    </strong>
                                                                    <span className={`badge ${getBadgeClass(mission.type_mission)} badge-label`} style={{ fontSize: '0.75rem' }}>
                                                                        {mission.type_mission}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex gap-2 align-items-center flex-wrap" style={{ fontSize: '0.75rem' }}>
                                                                    {mission.chauffeur && (
                                                                        <div className="text-muted">
                                                                            <TbTruck className="me-1" size={14} />
                                                                            {mission.chauffeur.prenom} {mission.chauffeur.nom}
                                                                        </div>
                                                                    )}
                                                                    {mission.vehicule && (
                                                                        <div className="text-muted">
                                                                            • {mission.vehicule.immatriculation}
                                                                        </div>
                                                                    )}
                                                                    {mission.parent_demande?.date_livraison_souhaitee && (
                                                                        <div className="text-muted">
                                                                            • Livraison: {new Date(mission.parent_demande.date_livraison_souhaitee).toLocaleDateString('fr-FR')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )
                    })()}

                    {/* {affectationFormData.chauffeur && affectationFormData.vehicule && (
                        <div className="alert alert-info">
                            <strong>Résumé de l'affectation:</strong><br />
                            <strong>
                                {chauffeurs.find(c => c.id === parseInt(affectationFormData.chauffeur))?.prenom}{' '}
                                {chauffeurs.find(c => c.id === parseInt(affectationFormData.chauffeur))?.nom}
                            </strong> avec le véhicule <strong>
                                {vehicules.find(v => v.id === parseInt(affectationFormData.vehicule))?.immatriculation}
                            </strong>
                            sera affecté à <strong>{relatedVoyages.length}</strong> voyage(s).
                        </div>
                    )} */}
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
                                Affectation...
                            </>
                        ) : (
                            <>
                                <TbTruck className="me-2 btn-danger" />
                                Confirmer l'Affectation
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0 bg-success-subtle">
                <Modal.Title className="text-success d-flex align-items-center">
                    <TbTruck size={24} className="me-2" />
                    Affectation Réussie
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="text-center py-3">
                    <div className="mb-3">
                        <svg className="text-success" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                    </div>
                    <p className="mb-0 whitespace-pre-line">{modalMessage}</p>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="success" onClick={() => setShowSuccessModal(false)}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Error Modal */}
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0 bg-danger-subtle">
                <Modal.Title className="text-danger d-flex align-items-center">
                    <svg className="me-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Erreur
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="text-center py-3">
                    <div className="mb-3">
                        <svg className="text-danger" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <p className="mb-0">{modalMessage}</p>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="danger" onClick={() => setShowErrorModal(false)}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default Planification

