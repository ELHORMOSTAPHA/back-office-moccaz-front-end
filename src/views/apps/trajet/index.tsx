import {
    type ColumnFiltersState,
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type Row as TableRow,
    type Table as TableType,
    useReactTable,
} from '@tanstack/react-table'

import {Link} from "react-router";
import {useState, useEffect} from 'react'
import {Button, Card, CardBody, CardFooter, CardHeader, Modal, Form, Row, Col} from 'react-bootstrap'
import {LuCircleCheck, LuSearch} from 'react-icons/lu'
import {TbEdit, TbEye, TbTruck} from 'react-icons/tb'

import {getAllTrajets, deleteTrajet, updateTrajetStatus, type Trajet} from '@/services/trajetService'
import DataTable from '@/components/table/DataTable'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import TablePagination from '@/components/table/TablePagination'
import PageBreadcrumb from '@/components/PageBreadcrumb'

const columnHelper = createColumnHelper<Trajet>()

const Trajets = () => {
    // State for API data
    const [trajets, setTrajets] = useState<Trajet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch trajets from API
    const fetchTrajets = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getAllTrajets({ per_page: 100 })
            setTrajets(response.data)
        } catch (err) {
            setError('Erreur lors du chargement des trajets. Veuillez réessayer.')
            console.error('Error fetching trajets:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrajets()
    }, [])

    // Helper function for status icon color
    const getStatusColor = (status: Trajet['status']) => {
        switch (status) {
            case 'À planifier': return 'text-secondary'
            case 'Planifiée': return 'text-info'
            case 'Enlèvement en cours': return 'text-warning'
            case 'Enlevée': return 'text-primary'
            case 'En livraison': return 'text-warning'
            case 'Livrée': return 'text-success'
            case 'Anomalie': return 'text-danger'
            case 'Clôturée': return 'text-dark'
            default: return 'text-secondary'
        }
    }

    // Helper function for status badge color
    const getStatusBadgeColor = (status: Trajet['status']) => {
        switch (status) {
            case 'À planifier': return 'bg-secondary-subtle text-secondary'
            case 'Planifiée': return 'bg-info-subtle text-info'
            case 'Enlèvement en cours': return 'bg-warning-subtle text-warning'
            case 'Enlevée': return 'bg-primary-subtle text-primary'
            case 'En livraison': return 'bg-warning-subtle text-warning'
            case 'Livrée': return 'bg-success-subtle text-success'
            case 'Anomalie': return 'bg-danger-subtle text-danger'
            case 'Clôturée': return 'bg-dark-subtle text-dark'
            default: return 'bg-secondary-subtle text-secondary'
        }
    }

    const columns = [
        {
            id: 'select',
            header: ({table}: { table: TableType<Trajet> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({row}: { row: TableRow<Trajet> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ({row}) => (
                <h5 className="m-0 d-flex align-items-center gap-1">
                    <TbTruck
                        className={`fs-lg ${getStatusColor(row.original.status)}`}
                    />
                    <Link to="" className="link-reset fw-semibold">
                        #{String(row.original.id).padStart(3, '')}
                    </Link>
                </h5>
            ),
        }),
        columnHelper.accessor('type_voyage', {
            header: 'Type de trajet',
            cell: ({row}) => (
                <span className={`badge ${row.original.type_voyage === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} badge-label`}>
                    {row.original.type_voyage}
                </span>
            ),
        }),
        columnHelper.accessor('chauffeur', {
            header: 'Chauffeur',
            cell: ({row}) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    <div className="avatar-sm shrink-0">
                        <span className="avatar-title text-bg-primary fw-bold rounded-circle">
                            {row.original.chauffeur?.prenom?.charAt(0) || '?'}
                        </span>
                    </div>
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <Link to="" className="link-reset">
                                {row.original.chauffeur ? `${row.original.chauffeur.prenom} ${row.original.chauffeur.nom}` : 'Non assigné'}
                            </Link>
                        </h5>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('vehicule', {
            header: 'Véhicule',
            cell: ({row}) => (
                <span className="text-muted fs-sm">
                    {row.original.vehicule ?
                        `${row.original.vehicule.type_vehicule || 'Véhicule'} - ${row.original.vehicule.immatriculation} - ${row.original.vehicule.tonnage || 0}T`
                        : 'Non assigné'}
                </span>
            ),
        }),
        columnHelper.accessor('date_depart_formatted', {
            header: 'Date Enlèvement',
            cell: ({row}) => (
                <div>
                    <div className="fw-semibold">{row.original.date_depart_formatted?.split(' ')[0]}</div>
                    <small className="text-muted">{row.original.date_depart_formatted?.split(' ')[1]}</small>
                </div>
            ),
        }),
        columnHelper.accessor('ville_depart', {
            header: 'Départ',
            cell: ({row}) => {
                if (row.original.type_voyage === 'Transport') {
                    return (
                        <div>
                            <div className="fw-semibold">{row.original.depot_depart?.nom_depot || 'N/A'}</div>
                            <small className="text-muted">{row.original.depot_depart?.ville_depot || ''}</small>
                        </div>
                    )
                }
                return (
                    <span className="text-nowrap">
                        {row.original.ville_depart?.nom || 'N/A'}
                    </span>
                )
            },
        }),
        columnHelper.accessor('date_arrivee_formatted', {
            header: 'Date Livraison',
            cell: ({row}) => (
                <div>
                    <div className="fw-semibold">{row.original.date_arrivee_formatted?.split(' ')[0]}</div>
                    <small className="text-muted">{row.original.date_arrivee_formatted?.split(' ')[1]}</small>
                </div>
            ),
        }),
        columnHelper.accessor('ville_arrivee', {
            header: 'Arrivée',
            cell: ({row}) => {
                if (row.original.type_voyage === 'Transport') {
                    return (
                        <div>
                            <div className="fw-semibold">{row.original.depot_arrivee?.nom_depot || 'N/A'}</div>
                            <small className="text-muted">{row.original.depot_arrivee?.ville_depot || ''}</small>
                        </div>
                    )
                }
                return (
                    <span className="text-nowrap">
                        {row.original.ville_arrivee?.nom || 'N/A'}
                    </span>
                )
            },
        }),
        {
            header: 'Date Livraison Réelle',
            accessorKey: 'date_reelle_arrivee_formatted',
            cell: ({row}: { row: TableRow<Trajet> }) => (
                <div>
                    {row.original.date_reelle_arrivee_formatted ? (
                        <>
                            <div className="fw-semibold text-success">{row.original.date_reelle_arrivee_formatted.split(' ')[0]}</div>
                            <small className="text-muted">{row.original.date_reelle_arrivee_formatted.split(' ')[1]}</small>
                        </>
                    ) : (
                        <span className="text-muted fst-italic">Non livré</span>
                    )}
                </div>
            ),
        },
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
            cell: ({row}: { row: TableRow<Trajet> }) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleOpenDepotModal(row.original)}
                        title="Voir les détails"
                    >
                        <TbEye className="fs-lg"/>
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleOpenEditModal(row.original)}
                        title="Modifier le trajet"
                    >
                        <TbEdit className="fs-lg"/>
                    </Button>
                </div>
            ),
        },
    ]

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})

    const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({})

    const table = useReactTable({
        data: trajets,
        columns,
        state: {sorting, globalFilter, columnFilters, pagination, rowSelection: selectedRowIds},
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onRowSelectionChange: setSelectedRowIds,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: 'includesString',
        enableColumnFilters: true,
        enableRowSelection: true,
    })

    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const totalItems = table.getFilteredRowModel().rows.length

    const start = pageIndex * pageSize + 1
    const end = Math.min(start + pageSize - 1, totalItems)

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [showDepotModal, setShowDepotModal] = useState<boolean>(false)
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
    const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editFormData, setEditFormData] = useState({
        status: ''
    })

    const availableStatuses = ['Planifiée', 'Enlèvement en cours', 'Enlevée', 'En livraison', 'Livrée', 'Anomalie', 'Clôturée']

    const toggleDeleteModal = () => {
        setShowDeleteModal(!showDeleteModal)
    }

    const handleOpenEditModal = (trajet: Trajet) => {
        setSelectedTrajet(trajet)
        setEditFormData({
            status: trajet.status
        })
        setShowEditModal(true)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setSelectedTrajet(null)
        setEditFormData({ status: '' })
        setIsSubmitting(false)
    }

    const handleOpenDepotModal = (trajet: Trajet) => {
        setSelectedTrajet(trajet)
        setShowDepotModal(true)
    }

    const handleCloseDepotModal = () => {
        setShowDepotModal(false)
        setSelectedTrajet(null)
    }

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTrajet || !editFormData.status) {
            alert('Veuillez sélectionner un statut')
            return
        }

        setIsSubmitting(true)
        try {
            // Call the API to update trajet status
            await updateTrajetStatus(selectedTrajet.id, editFormData.status as Trajet['status'])

            // Refresh data
            await fetchTrajets()

            // Show success modal
            setShowSuccessModal(true)
            handleCloseEditModal()
        } catch (err) {
            console.error('Error updating trajet:', err)
            setError('Erreur lors de la modification du trajet')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        try {
            const selectedIds = Object.keys(selectedRowIds).map(id => parseInt(id));
            for (const id of selectedIds) {
                await deleteTrajet(id);
            }
            // Refresh data after deletion
            await fetchTrajets();
            setSelectedRowIds({});
            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting trajets:', err);
            setError('Erreur lors de la suppression des trajets');
        }
    }

    return (
        <>
            <PageBreadcrumb
                title="Trajets"
                subtitle="Transport"
            />

            {loading && (
                <Card>
                    <CardBody className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3 text-muted">Chargement des trajets...</p>
                    </CardBody>
                </Card>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Erreur!</strong> {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            {!loading && !error && (
            <Card>
                <CardHeader className="border-light justify-content-between">
                    <div className="d-flex gap-2">
                        <div className="app-search">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Rechercher trajets..."
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                            />
                            <LuSearch className="app-search-icon text-muted"/>
                        </div>
                        {Object.keys(selectedRowIds).length > 0 && (
                            <Button variant="danger" size="sm" onClick={toggleDeleteModal}>
                                Supprimer
                            </Button>
                        )}
                        {/* <Link to="/voyages/add" className="btn btn-secondary">
                            <TbPlus className="fs-lg me-1"/>
                            Créer Voyage
                        </Link> */}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="me-2 fw-semibold">Filtrer par:</span>

                        <div className="app-search">
                            <select
                                className="form-select form-control my-1 my-md-0"
                                value={(table.getColumn('status')?.getFilterValue() as string) ?? 'All'}
                                onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                                <option value="All">Tous les statuts</option>
                                <option value="À planifier">À planifier</option>
                                <option value="Planifiée">Planifiée</option>
                                <option value="Enlèvement en cours">Enlèvement en cours</option>
                                <option value="Enlevée">Enlevée</option>
                                <option value="En livraison">En livraison</option>
                                <option value="Livrée">Livrée</option>
                                <option value="Anomalie">Anomalie</option>
                                <option value="Clôturée">Clôturée</option>
                            </select>
                            <LuCircleCheck className="app-search-icon text-muted"/>
                        </div>

                        <div className="app-search">
                            <select
                                className="form-select form-control my-1 my-md-0"
                                value={(table.getColumn('type_voyage')?.getFilterValue() as string) ?? 'All'}
                                onChange={(e) => table.getColumn('type_voyage')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                                <option value="All">Tous les types</option>
                                <option value="Transport">Transport</option>
                                <option value="Messagerie">Messagerie</option>
                            </select>
                            <TbTruck className="app-search-icon text-muted"/>
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

                <DataTable<Trajet> table={table} emptyMessage="Aucun trajet trouvé"/>

                {table.getRowModel().rows.length > 0 && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="trajets"
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

                <DeleteConfirmationModal
                    show={showDeleteModal}
                    onHide={toggleDeleteModal}
                    onConfirm={handleDelete}
                    selectedCount={Object.keys(selectedRowIds).length}
                    itemName="trajets"
                />
            </Card>
            )}

            {/* Modal for editing trajet */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Modifier Trajet #{selectedTrajet?.id}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitEdit}>
                    <Modal.Body>
                        {selectedTrajet?.status === 'À planifier' && (
                            <div className="alert alert-warning mb-3">
                                <strong>⚠️ Modification non autorisée</strong><br />
                                Les trajets avec le statut "À planifier" doivent d'abord être planifiés avant de pouvoir changer de statut.
                            </div>
                        )}
                        <Row>
                            <Col md={12}>
                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label">
                                        Statut <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        value={editFormData.status}
                                        onChange={handleEditInputChange}
                                        required
                                        disabled={selectedTrajet?.status === 'À planifier'}
                                    >
                                        <option value="">Sélectionnez un statut</option>
                                        {availableStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedTrajet?.status === 'À planifier' && (
                                        <small className="form-text text-muted mt-2 d-block">
                                            Veuillez d'abord planifier ce trajet dans la section Planification.
                                        </small>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleCloseEditModal}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || !editFormData.status || selectedTrajet?.status === 'À planifier'}
                        >
                            {isSubmitting ? (
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

            {/* Modal for viewing trajet details */}
            <Modal show={showDepotModal} onHide={handleCloseDepotModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Informations du Trajet #{selectedTrajet?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTrajet ? (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Type de Trajet
                                        </label>
                                        <p className="fs-base">
                                            <span className={`badge ${selectedTrajet.type_voyage === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                                                {selectedTrajet.type_voyage}
                                            </span>
                                        </p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Statut
                                        </label>
                                        <p className="fs-base">
                                            <span className={`badge ${getStatusBadgeColor(selectedTrajet.status)}`}>
                                                {selectedTrajet.status}
                                            </span>
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Chauffeur
                                        </label>
                                        <p className="fs-base">
                                            {selectedTrajet.chauffeur ?
                                                `${selectedTrajet.chauffeur.prenom} ${selectedTrajet.chauffeur.nom}` :
                                                'Non assigné'}
                                        </p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Véhicule
                                        </label>
                                        <p className="fs-base">
                                            {selectedTrajet.vehicule ? (
                                                <>
                                                    {selectedTrajet.vehicule.type_vehicule || 'Véhicule'} - {selectedTrajet.vehicule.immatriculation} - {selectedTrajet.vehicule.tonnage || 0}T
                                                    <br />
                                                    <span className="text-muted" style={{fontSize: '0.875rem'}}>
                                                        {selectedTrajet.vehicule.marque} {selectedTrajet.vehicule.modele}
                                                    </span>
                                                </>
                                            ) : (
                                                'Non assigné'
                                            )}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Départ
                                        </label>
                                        <p className="fs-base">{selectedTrajet.ville_depart?.nom || 'N/A'}</p>
                                        <small className="text-muted">{selectedTrajet.date_depart_formatted}</small>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Arrivée
                                        </label>
                                        <p className="fs-base">{selectedTrajet.ville_arrivee?.nom || 'N/A'}</p>
                                        <small className="text-muted">{selectedTrajet.date_arrivee_formatted}</small>
                                    </div>
                                </Col>
                            </Row>

                            {selectedTrajet.date_reelle_arrivee_formatted && (
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <div className="alert alert-success mb-0">
                                            <strong>Date d'arrivée réelle:</strong>
                                            <span className="ms-2">{selectedTrajet.date_reelle_arrivee_formatted}</span>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {selectedTrajet.client && (
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-muted">
                                                Client
                                            </label>
                                            <p className="fs-base">
                                                {selectedTrajet.client.prenom} {selectedTrajet.client.nom}
                                                {selectedTrajet.client.raison_sociale && (
                                                    <span className="text-muted ms-2">({selectedTrajet.client.raison_sociale})</span>
                                                )}
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {selectedTrajet.depot && (
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-muted">
                                                Dépôt
                                            </label>
                                            <p className="fs-base">
                                                {selectedTrajet.depot.nom_depot}
                                                <br />
                                                <small className="text-muted">{selectedTrajet.depot.adresse}</small>
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {selectedTrajet.notes && (
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-muted">
                                                Notes
                                            </label>
                                            <p className="fs-base">{selectedTrajet.notes}</p>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {selectedTrajet.distance_km && (
                                <Row>
                                    <Col md={12}>
                                        <div className="alert alert-info mb-0">
                                            <strong>Distance:</strong> {selectedTrajet.distance_km} km
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    ) : (
                        <div className="alert alert-warning mb-0">
                            Aucune information disponible
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleCloseDepotModal}
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Body className="text-center p-4">
                    <div className="mb-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle" style={{width: '60px', height: '60px'}}>
                            <LuCircleCheck className="text-success" style={{fontSize: '30px'}} />
                        </div>
                    </div>
                    <h4 className="mb-2">Succès</h4>
                    <p className="text-muted mb-4">Statut modifié avec succès!</p>
                    <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                        Fermer
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Trajets
