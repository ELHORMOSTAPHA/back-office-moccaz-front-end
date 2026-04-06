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

import {useState, useMemo, useEffect} from 'react'
import {Button, Card, CardFooter, CardHeader, Modal, Table, Spinner, Alert, Tabs, Tab, Form} from 'react-bootstrap'
import {LuCircleCheck, LuSearch} from 'react-icons/lu'
import {TbTruck, TbFileInvoice, TbEye, TbEdit, TbBarcode} from 'react-icons/tb'

import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import {getAllMissions, updateMissionStatus, type Mission} from '@/services/missionService'
import {getTrajetsByMission, type Trajet} from '@/services/trajetService'

const columnHelper = createColumnHelper<Mission>()
const api_url=import.meta.env.VITE_API_URL
const Missions = () => {
    // State for missions data
    const [missions, setMissions] = useState<Mission[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch missions from API
    useEffect(() => {
        const fetchMissions = async () => {
            setLoading(true)
            try {
                const response = await getAllMissions({ per_page: 100 })
                setMissions(response.data)
            } catch (err) {
                setError('Erreur lors du chargement des missions.')
                console.error('Error fetching missions:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMissions()
    }, [])

    // Helper function for status icon color
    const getStatusColor = (status: Mission['statut']) => {
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
    const getStatusBadgeColor = (status: Mission['statut'] | string) => {
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

    // Define table columns
    const columns = [
        columnHelper.accessor('id', {
            header: 'ID Mission',
            cell: ({row}) => (
                <h5 className="m-0 d-flex align-items-center gap-1">
                    <TbFileInvoice className={`fs-lg ${getStatusColor(row.original.statut)}`} />
                    <span className="fw-semibold">
                        #{String(row.original.id).padStart(3, '')}
                    </span>
                </h5>
            ),
        }),
        columnHelper.accessor('type_mission', {
            header: 'Type Mission',
            cell: ({row}) => (
                <span className={`badge ${
                    row.original.type_mission === 'Transport' ? 'bg-primary-subtle text-primary' :
                    row.original.type_mission === 'Messagerie' ? 'bg-success-subtle text-success' :
                    'bg-info-subtle text-info'
                } badge-label`}>
                    {row.original.type_mission}
                </span>
            ),
        }),
        columnHelper.accessor('chauffeur', {
            header: 'Chauffeur',
            cell: ({row}) => (
                row.original.chauffeur ? (
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <div className="avatar-sm shrink-0">
                            <span className="avatar-title text-bg-primary fw-bold rounded-circle">
                                {row.original.chauffeur.prenom.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h5 className="text-nowrap fs-base mb-0 lh-base">
                                {row.original.chauffeur.prenom} {row.original.chauffeur.nom}
                            </h5>
                            <p className="text-muted fs-xs mb-0">{row.original.chauffeur.telephone}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-muted fst-italic">Non affecté</span>
                )
            ),
        }),
        columnHelper.accessor('vehicule', {
            header: 'Véhicule',
            cell: ({row}) => (
                row.original.vehicule ? (
                    <div>
                        <div className="fw-semibold">{row.original.vehicule.immatriculation}</div>
                        <small className="text-muted">
                            {row.original.vehicule.marque} {row.original.vehicule.modele}
                        </small>
                    </div>
                ) : (
                    <span className="text-muted fst-italic">Non affecté</span>
                )
            ),
        }),
        columnHelper.accessor('date_enlevement', {
            header: 'Date Enlèvement',
            cell: ({row}) => {
                const date = new Date(row.original.date_enlevement)
                return date.toLocaleDateString('fr-FR')
            },
        }),
        columnHelper.display({
            id: 'date_livraison',
            header: 'Date Livraison',
            cell: ({row}) => {
                // For Transport or Mixte missions: display date_livraison_souhaitee from parent demande
                if (row.original.parent_demande?.date_livraison_souhaitee) {
                    const date = new Date(row.original.parent_demande.date_livraison_souhaitee)
                    return date.toLocaleDateString('fr-FR')
                }

                return '-'
            },
        }),
        columnHelper.accessor('statut', {
            header: 'Statut',
            cell: ({row}) => (
                <span className={`badge ${getStatusBadgeColor(row.original.statut)} badge-label`}>
                    {row.original.statut}
                </span>
            ),
        }),
        {
            header: 'Actions',
            cell: ({row}: { row: TableRow<Mission> }) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleShowTrajets(row.original.id, row.original.type_mission)}
                        title="Voir les trajets"
                    >
                        <TbEye className="fs-lg" />
                    </Button>
                     <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            window.open(`${api_url}/mission/pdf?mission_id=${row.original.id}`, '_blank')
                        }}
                        title="Imprimer la mission"
                    >
                        <TbFileInvoice className="fs-lg" />
                    </Button>
                     <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            if (row.original.type_mission === 'Transport') {
                                setShowBarcodeWarningModal(true)
                            } else {
                                window.open(`${api_url}/code-barres/pdf?mission_id=${row.original.id}`, '_blank')
                            }
                        }}
                        title="Imprimer les étiquettes"
                    >
                        <TbBarcode className="fs-lg" />
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleShowEditModal(row.original)}
                        title="Modifier le statut"
                    >
                        <TbEdit className="fs-lg" />
                    </Button>
                </div>
            ),
        },
    ]

    // Filter data - show all missions
    const filteredData = useMemo(() => {
        return missions
    }, [missions])

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})

    // Modal state for showing related trajets
    const [showTrajetsModal, setShowTrajetsModal] = useState(false)
    const [selectedMissionId, setSelectedMissionId] = useState<number>(0)
    const [selectedMissionType, setSelectedMissionType] = useState<string>('')
    const [transportTrajets, setTransportTrajets] = useState<Trajet[]>([])
    const [messagerieTrajets, setMessagerieTrajets] = useState<Trajet[]>([])
    const [loadingTrajets, setLoadingTrajets] = useState(false)

    // Modal state for editing mission status
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingMission, setEditingMission] = useState<Mission | null>(null)
    const [newStatus, setNewStatus] = useState<Mission['statut']>('À planifier')
    const [updating, setUpdating] = useState(false)

    // Modal state for success/error messages
    const [showMessageModal, setShowMessageModal] = useState(false)
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')
    const [messageText, setMessageText] = useState('')

    // Modal state for barcode warning
    const [showBarcodeWarningModal, setShowBarcodeWarningModal] = useState(false)

    // Function to handle showing trajets for a mission
    const handleShowTrajets = async (missionId: number, missionType: string) => {
        setSelectedMissionId(missionId)
        setSelectedMissionType(missionType)
        setShowTrajetsModal(true)
        setLoadingTrajets(true)

        try {
            const response = await getTrajetsByMission(missionId)
            const allTrajets = response.data || []

            // For Mixte missions, separate trajets by type_voyage field
            if (missionType === 'Mixte') {
                // Transport trajets have type_voyage = 'Transport'
                const transport = allTrajets.filter((t: Trajet) => t.type_voyage === 'Transport')
                // Messagerie trajets have type_voyage = 'Messagerie'
                const messagerie = allTrajets.filter((t: Trajet) => t.type_voyage === 'Messagerie')
                setTransportTrajets(transport)
                setMessagerieTrajets(messagerie)
            } else {
                // For single type missions, put all trajets in the appropriate array
                setTransportTrajets(allTrajets)
                setMessagerieTrajets([])
            }
        } catch (error) {
            console.error('Error fetching trajets:', error)
            setTransportTrajets([])
            setMessagerieTrajets([])
        } finally {
            setLoadingTrajets(false)
        }
    }

    const handleCloseTrajetsModal = () => {
        setShowTrajetsModal(false)
        setSelectedMissionId(0)
        setSelectedMissionType('')
        setTransportTrajets([])
        setMessagerieTrajets([])
    }

    // Function to handle showing edit modal
    const handleShowEditModal = (mission: Mission) => {
        setEditingMission(mission)
        setNewStatus(mission.statut)
        setShowEditModal(true)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setEditingMission(null)
        setNewStatus('Planifiée')
    }

    // Function to update mission status
    const handleUpdateStatus = async () => {
        if (!editingMission) return

        setUpdating(true)
        try {
            console.log('Updating mission:', editingMission.id, 'to status:', newStatus)

            const response = await updateMissionStatus(editingMission.id, newStatus)

            console.log('Update response:', response)

            // Refresh missions list
            const missionsResponse = await getAllMissions({ per_page: 100 })
            setMissions(missionsResponse.data)

            // Close edit modal
            handleCloseEditModal()

            // Show success message
            setMessageType('success')
            setMessageText('Le statut de la mission a été mis à jour avec succès!')
            setShowMessageModal(true)

        } catch (error: any) {
            console.error('Error updating mission status:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du statut'

            // Show error message
            setMessageType('error')
            setMessageText(errorMessage)
            setShowMessageModal(true)
        } finally {
            setUpdating(false)
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

    return (
        <>
            {loading && (
                <Card>
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des missions...</p>
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
                                        const response = await getAllMissions({ per_page: 100 })
                                        setMissions(response.data)
                                    } catch (err) {
                                        setError('Erreur lors du chargement des missions.')
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
                                    placeholder="Search missions..."
                                    value={globalFilter ?? ''}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                />
                                <LuSearch className="app-search-icon text-muted"/>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="me-2 fw-semibold">Filter By:</span>

                            <div className="app-search">
                                <select
                                    className="form-select form-control my-1 my-md-0"
                                    value={(table.getColumn('statut')?.getFilterValue() as string) ?? 'All'}
                                    onChange={(e) => table.getColumn('statut')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
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

                    <DataTable<Mission> table={table} emptyMessage="Aucune mission trouvée"/>

                    {table.getRowModel().rows.length > 0 && (
                        <CardFooter className="border-0">
                            <TablePagination
                                totalItems={totalItems}
                                start={start}
                                end={end}
                                itemsName="missions"
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

            {/* Modal for showing related trajets */}
            <Modal show={showTrajetsModal} onHide={handleCloseTrajetsModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Trajets liés à la mission #{String(selectedMissionId).padStart(3, '')} ({selectedMissionType})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingTrajets ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Chargement des trajets...</p>
                        </div>
                    ) : selectedMissionType === 'Mixte' ? (
                        // Show tabs for Mixte missions
                        <Tabs defaultActiveKey="transport" id="trajets-tabs" className="mb-3">
                            {/* Tab 1: Transport Trajets */}
                            <Tab eventKey="transport" title={`Transport (${transportTrajets.length})`}>
                                {transportTrajets.length > 0 ? (
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transportTrajets.map((trajet) => (
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
                                                            <div>
                                                                <div>{trajet.vehicule.immatriculation}</div>
                                                                <small className="text-muted">{trajet.vehicule.tonnage || 12.00}T</small>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted fst-italic">Non affecté</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-semibold">{trajet.depot_depart?.nom_depot || 'N/A'}</div>
                                                            <small className="text-muted">{trajet.depot_depart?.ville_depot || ''}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-semibold">{trajet.depot_arrivee?.nom_depot || 'N/A'}</div>
                                                            <small className="text-muted">{trajet.depot_arrivee?.ville_depot || ''}</small>
                                                        </div>
                                                    </td>
                                                    <td>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                                    <td>{trajet.heure_livraison || '08:30:00'}</td>
                                                    <td>{trajet.nombre_colies || 123}</td>
                                                    <td>
                                                        <span className={`badge ${trajet.manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {trajet.manutention ? 'Oui' : 'Non'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${trajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {trajet.retour ? 'Oui' : 'Non'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeColor(trajet.status)} badge-label`}>
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
                                        <h6 className="text-muted">Aucun trajet transport associé</h6>
                                    </div>
                                )}
                            </Tab>

                            {/* Tab 2: Messagerie Trajets */}
                            <Tab eventKey="messagerie" title={`Messagerie (${messagerieTrajets.length})`}>
                                {messagerieTrajets.length > 0 ? (
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>ID Trajet</th>
                                                <th>Demande</th>
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {messagerieTrajets.map((trajet) => (
                                                <tr key={trajet.id}>
                                                    <td>
                                                        <strong className="text-success">#{String(trajet.id).padStart(3, '')}</strong>
                                                    </td>
                                                    <td>
                                                        {trajet.demande ? (
                                                            <strong className="text-primary">#{String(trajet.demande.id).padStart(3, '')}</strong>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
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
                                                            <div>
                                                                <div>{trajet.vehicule.immatriculation}</div>
                                                                <small className="text-muted">{trajet.vehicule.tonnage || 12.00}T</small>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted fst-italic">Non affecté</span>
                                                        )}
                                                    </td>
                                                    <td>{trajet.ville_depart?.nom || 'N/A'}</td>
                                                    <td>{trajet.ville_arrivee?.nom || 'N/A'}</td>
                                                    <td>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                                    <td>{trajet.nombre_colies || 334}</td>
                                                    <td>{trajet.tailles_colies || 'M'}</td>
                                                    <td>{trajet.notes || '-'}</td>
                                                    <td>
                                                        <span className={`badge ${trajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {trajet.retour ? 'Oui' : 'Non'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeColor(trajet.status)} badge-label`}>
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
                                        <h6 className="text-muted">Aucun trajet messagerie associé</h6>
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    ) : selectedMissionType === 'Transport' && transportTrajets.length > 0 ? (
                        // Show Transport table for single Transport missions
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
                                </tr>
                            </thead>
                            <tbody>
                                {transportTrajets.map((trajet) => (
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
                                                <div>
                                                    <div>{trajet.vehicule.immatriculation}</div>
                                                    <small className="text-muted">{trajet.vehicule.tonnage || 12.00}T</small>
                                                </div>
                                            ) : (
                                                <span className="text-muted fst-italic">Non affecté</span>
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-semibold">{trajet.depot_depart?.nom_depot || 'N/A'}</div>
                                                <small className="text-muted">{trajet.depot_depart?.ville_depot || ''}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-semibold">{trajet.depot_arrivee?.nom_depot || 'N/A'}</div>
                                                <small className="text-muted">{trajet.depot_arrivee?.ville_depot || ''}</small>
                                            </div>
                                        </td>
                                        <td>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                        <td>{trajet.heure_livraison || '08:30:00'}</td>
                                        <td>{trajet.nombre_colies || 123}</td>
                                        <td>
                                            <span className={`badge ${trajet.manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {trajet.manutention ? 'Oui' : 'Non'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${trajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {trajet.retour ? 'Oui' : 'Non'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeColor(trajet.status)} badge-label`}>
                                                {trajet.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : selectedMissionType === 'Messagerie' && transportTrajets.length > 0 ? (
                        // Show Messagerie table for single Messagerie missions
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID Trajet</th>
                                    <th>Demande</th>
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
                                </tr>
                            </thead>
                            <tbody>
                                {transportTrajets.map((trajet) => (
                                    <tr key={trajet.id}>
                                        <td>
                                            <strong className="text-success">#{String(trajet.id).padStart(3, '')}</strong>
                                        </td>
                                        <td>
                                            {trajet.demande ? (
                                                <strong className="text-primary">#{String(trajet.demande.id).padStart(3, '')}</strong>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
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
                                                <div>
                                                    <div>{trajet.vehicule.immatriculation}</div>
                                                    <small className="text-muted">{trajet.vehicule.tonnage || 12.00}T</small>
                                                </div>
                                            ) : (
                                                <span className="text-muted fst-italic">Non affecté</span>
                                            )}
                                        </td>
                                        <td>{trajet.ville_depart?.nom || 'N/A'}</td>
                                        <td>{trajet.ville_arrivee?.nom || 'N/A'}</td>
                                        <td>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                        <td>{trajet.nombre_colies || 334}</td>
                                        <td>{trajet.tailles_colies || 'M'}</td>
                                        <td>{trajet.notes || '-'}</td>
                                        <td>
                                            <span className={`badge ${trajet.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {trajet.retour ? 'Oui' : 'Non'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeColor(trajet.status)} badge-label`}>
                                                {trajet.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : transportTrajets.length > 0 ? (
                        // Fallback for any other case
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID Trajet</th>
                                    <th>Chauffeur</th>
                                    <th>Véhicule</th>
                                    <th>Départ</th>
                                    <th>Arrivée</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transportTrajets.map((trajet) => (
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
                                                <span>{trajet.vehicule.immatriculation}</span>
                                            ) : (
                                                <span className="text-muted fst-italic">Non affecté</span>
                                            )}
                                        </td>
                                        <td>
                                            {selectedMissionType === 'Transport' ? (
                                                <div>
                                                    <div className="fw-semibold">{trajet.depot_depart?.nom_depot || 'N/A'}</div>
                                                    <small className="text-muted">{trajet.depot_depart?.ville_depot || ''}</small>
                                                </div>
                                            ) : (
                                                trajet.ville_depart?.nom || 'N/A'
                                            )}
                                        </td>
                                        <td>
                                            {selectedMissionType === 'Transport' ? (
                                                <div>
                                                    <div className="fw-semibold">{trajet.depot_arrivee?.nom_depot || 'N/A'}</div>
                                                    <small className="text-muted">{trajet.depot_arrivee?.ville_depot || ''}</small>
                                                </div>
                                            ) : (
                                                trajet.ville_arrivee?.nom || 'N/A'
                                            )}
                                        </td>
                                        <td>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeColor(trajet.status)} badge-label`}>
                                                {trajet.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        // Show empty state
                        <div className="text-center py-4">
                            <TbTruck size={48} className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun trajet associé à cette mission</h6>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseTrajetsModal}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for editing mission status */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Modifier le statut - Mission #{editingMission ? String(editingMission.id).padStart(3, '') : ''}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingMission && (
                        <Form>

                            <Form.Group className="mb-3">
                                <Form.Label>Statut actuel</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingMission.statut}
                                    disabled
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Nouveau statut <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as Mission['statut'])}
                                >
                                    <option value="À planifier">À planifier</option>
                                    <option value="Planifiée">Planifiée</option>
                                    <option value="Traitement en cours">Traitement en cours</option>
                                    <option value="Livrée">Livrée</option>
                                    <option value="Anomalie">Anomalie</option>
                                    <option value="Clôturée">Clôturée</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal} disabled={updating}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateStatus}
                        disabled={updating || newStatus === editingMission?.statut}
                    >
                        {updating ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Mise à jour...
                            </>
                        ) : (
                            'Enregistrer'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Success/Error Messages */}
            <Modal
                show={showMessageModal}
                onHide={() => setShowMessageModal(false)}
                centered
            >
                <Modal.Header closeButton className={messageType === 'success' ? 'bg-success-subtle' : 'bg-danger-subtle'}>
                    <Modal.Title className={messageType === 'success' ? 'text-success' : 'text-danger'}>
                        {messageType === 'success' ? (
                            <>
                                <LuCircleCheck className="me-2" />
                                Succès
                            </>
                        ) : (
                            <>
                                <span className="me-2">⚠️</span>
                                Erreur
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">{messageText}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant={messageType === 'success' ? 'success' : 'danger'}
                        onClick={() => setShowMessageModal(false)}
                    >
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Barcode Warning */}
            <Modal
                show={showBarcodeWarningModal}
                onHide={() => setShowBarcodeWarningModal(false)}
                centered
            >
                <Modal.Header closeButton className="bg-warning-subtle">
                    <Modal.Title className="text-warning">
                        <span className="me-2">ℹ️</span>
                        Information
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">Les missions de type transport n'ont pas des code barres à imprimer.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="warning"
                        onClick={() => setShowBarcodeWarningModal(false)}
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Missions
