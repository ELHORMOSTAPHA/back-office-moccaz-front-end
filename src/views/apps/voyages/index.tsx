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
import {useState} from 'react'
import {Button, Card, CardFooter, CardHeader, Modal, Form, Row, Col} from 'react-bootstrap'
import {LuCircleCheck, LuSearch} from 'react-icons/lu'
import {TbEdit, TbTruck, TbEye} from 'react-icons/tb'

import {voyages, type VoyageType, depots} from '@/views/apps/invoice/invoices/data'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import PageBreadcrumb from '@/components/PageBreadcrumb'

const columnHelper = createColumnHelper<VoyageType>()

const Voyages = () => {
    // Helper function to calculate arrival date (departure + 48 hours)
    const calculateArrivalDate = (dateDepart: string): Date => {
        const departDate = new Date(dateDepart);
        const arrivalDate = new Date(departDate.getTime() + (48 * 60 * 60 * 1000)); // Add 48 hours in milliseconds
        return arrivalDate;
    }

    // Helper function for status icon color
    const getStatusColor = (status: VoyageType['status']) => {
        switch (status) {
            case 'En attente': return 'text-secondary'
            case 'En cours': return 'text-info'
            case 'En transit': return 'text-warning'
            case 'Arrivé': return 'text-primary'
            case 'Terminé': return 'text-success'
            case 'Annulé': return 'text-danger'
            case 'Retardé': return 'text-warning'
            default: return 'text-secondary'
        }
    }

    // Helper function for status badge color
    const getStatusBadgeColor = (status: VoyageType['status']) => {
        switch (status) {
            case 'En attente': return 'bg-secondary-subtle text-secondary'
            case 'En cours': return 'bg-info-subtle text-info'
            case 'En transit': return 'bg-warning-subtle text-warning'
            case 'Arrivé': return 'bg-primary-subtle text-primary'
            case 'Terminé': return 'bg-success-subtle text-success'
            case 'Annulé': return 'bg-danger-subtle text-danger'
            case 'Retardé': return 'bg-warning-subtle text-warning'
            default: return 'bg-secondary-subtle text-secondary'
        }
    }

    const columns = [
        {
            id: 'select',
            header: ({table}: { table: TableType<VoyageType> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({row}: { row: TableRow<VoyageType> }) => (
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
                        #{row.original.id}
                    </Link>
                </h5>
            ),
        }),
        columnHelper.accessor('typeVoyage', {
            header: 'Type de trajet',
            cell: ({row}) => (
                <span className={`badge ${row.original.typeVoyage === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} badge-label`}>
                    {row.original.typeVoyage}
                </span>
            ),
        }),
        columnHelper.accessor('chauffeur', {
            header: 'Chauffeur',
            cell: ({row}) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    {row.original.chauffeurImage ? (
                        <div className="avatar avatar-sm">
                            <img src={row.original.chauffeurImage} height={32} width={32} alt=""
                                 className="img-fluid rounded-circle"/>
                        </div>
                    ) : (
                        <div className="avatar-sm flex-shrink-0">
                            <span
                                className="avatar-title text-bg-primary fw-bold rounded-circle">{row.original.chauffeur.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <Link to="" className="link-reset">
                                {row.original.chauffeur}
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
                    {row.original.vehicule}
                </span>
            ),
        }),
        columnHelper.accessor('dateDepart', {
            header: 'Date Départ',
            cell: ({row}) => {
                const date = new Date(row.original.dateDepart);
                return (
                    <div>
                        <div className="fw-semibold">{date.toLocaleDateString('fr-FR')}</div>
                        <small className="text-muted">{date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</small>
                    </div>
                )
            },
        }),
         columnHelper.accessor('depart', {
            header: 'Départ',
            cell: ({row}) => (
                <span className="text-nowrap">
                    {row.original.depart}
                </span>
            ),
        }),
        columnHelper.accessor('dateArrivee', {
            header: 'Date Arrivée',
            cell: ({row}) => {
                const date = calculateArrivalDate(row.original.dateDepart);
                return (
                    <div>
                        <div className="fw-semibold">{date.toLocaleDateString('fr-FR')}</div>
                        <small className="text-muted">{date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</small>
                    </div>
                )
            },
        }),

        columnHelper.accessor('arrivee', {
            header: 'Arrivée',
            cell: ({row}) => (
                <span className="text-nowrap">
                    {row.original.arrivee}
                </span>
            ),
        }),
        columnHelper.accessor('dateReelle', {
            header: 'Date Arrivée Réelle',
            cell: ({row}) => {
                if (!row.original.dateReelle) {
                    return <span className="text-muted fst-italic">Non livré</span>
                }
                const date = new Date(row.original.dateReelle);
                return (
                    <div>
                        <div className="fw-semibold text-success">{date.toLocaleDateString('fr-FR')}</div>
                        <small className="text-muted">{date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</small>
                    </div>
                )
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
            cell: ({row}: { row: TableRow<VoyageType> }) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleShowDepotModal(row.original)}
                        title="Voir le dépôt"
                    >
                        <TbEye className="fs-lg"/>
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleShowEditModal(row.original)}
                    >
                        <TbEdit className="fs-lg"/>
                    </Button>
                </div>
            ),
        },
    ]

    const [data, setData] = useState<VoyageType[]>(() => [...voyages])
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})

    const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({})

    // Modal state for editing voyage
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedVoyage, setSelectedVoyage] = useState<VoyageType | null>(null)
    const [editFormData, setEditFormData] = useState({
        status: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Modal state for viewing depot
    const [showDepotModal, setShowDepotModal] = useState(false)
    const [selectedDepotVoyage, setSelectedDepotVoyage] = useState<VoyageType | null>(null)

    // Available status options
    const availableStatuses: VoyageType['status'][] = [
        'En attente',
        'En cours',
        'En transit',
        'Arrivé',
        'Terminé',
        'Annulé',
        'Retardé'
    ]

    const handleShowEditModal = (voyage: VoyageType) => {
        setSelectedVoyage(voyage)
        setEditFormData({
            status: voyage.status
        })
        setShowEditModal(true)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setSelectedVoyage(null)
        setEditFormData({ status: '' })
    }

    const handleShowDepotModal = (voyage: VoyageType) => {
        setSelectedDepotVoyage(voyage)
        setShowDepotModal(true)
    }

    const handleCloseDepotModal = () => {
        setShowDepotModal(false)
        setSelectedDepotVoyage(null)
    }

    const getDepotDetails = (depotId?: string) => {
        if (!depotId) return null
        return depots.find(d => d.id === depotId)
    }

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editFormData.status) {
            alert('Veuillez sélectionner un statut')
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Update the voyage status in the data array
            setData(prevData => prevData.map(v =>
                v.id === selectedVoyage?.id
                    ? { ...v, status: editFormData.status as VoyageType['status'] }
                    : v
            ))

            alert('Statut modifié avec succès!')
            handleCloseEditModal()
        } catch (error) {
            console.error('Error during edit:', error)
            alert('Erreur lors de la modification')
        } finally {
            setIsSubmitting(false)
        }
    }

    const table = useReactTable({
        data,
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

    return (
        <>
            <PageBreadcrumb
                title="Trajets"
                subtitle="Transport"
            />

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
                        {/* <Link to="/trajets/add" className="btn btn-secondary">
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
                                <option value="En attente">En attente</option>
                                <option value="En cours">En cours</option>
                                <option value="En transit">En transit</option>
                                <option value="Arrivé">Arrivé</option>
                                <option value="Terminé">Terminé</option>
                                <option value="Annulé">Annulé</option>
                                <option value="Retardé">Retardé</option>
                            </select>
                            <LuCircleCheck className="app-search-icon text-muted"/>
                        </div>

                        <div className="app-search">
                            <select
                                className="form-select form-control my-1 my-md-0"
                                value={(table.getColumn('typeVoyage')?.getFilterValue() as string) ?? 'All'}
                                onChange={(e) => table.getColumn('typeVoyage')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
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

                <DataTable<VoyageType> table={table} emptyMessage="Aucun voyage trouvé"/>

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
            </Card>

            {/* Modal for editing voyage */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Modifier Trajet #{selectedVoyage?.id}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitEdit}>
                    <Modal.Body>
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
                                    >
                                        <option value="">Sélectionnez un statut</option>
                                        {availableStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
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
                            disabled={isSubmitting || !editFormData.status}
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

            {/* Modal for viewing depot */}
            <Modal show={showDepotModal} onHide={handleCloseDepotModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Informations du Dépôt - Trajet #{selectedDepotVoyage?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDepotVoyage && getDepotDetails(selectedDepotVoyage.depot) ? (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Client
                                        </label>
                                        <p className="fs-base">{selectedDepotVoyage.client || 'N/A'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            ID Dépôt
                                        </label>
                                        <p className="fs-base">
                                            <span className="badge bg-primary-subtle text-primary">
                                                {selectedDepotVoyage.depot}
                                            </span>
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Nom du Dépôt
                                        </label>
                                        <p className="fs-base">{getDepotDetails(selectedDepotVoyage.depot)?.nom}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">
                                            Ville
                                        </label>
                                        <p className="fs-base">{getDepotDetails(selectedDepotVoyage.depot)?.ville}</p>
                                    </div>
                                </Col>
                            </Row>

                            <div className="alert alert-info mb-0">
                                <strong>Détails du Trajet:</strong>
                                <div className="mt-2">
                                    <div className="mb-2">
                                        <span className="text-muted">Type:</span>
                                        <span className="ms-2 badge bg-info-subtle text-info">{selectedDepotVoyage.typeVoyage}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-muted">Départ:</span>
                                        <span className="ms-2 fw-semibold">{selectedDepotVoyage.depart}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-muted">Arrivée:</span>
                                        <span className="ms-2 fw-semibold">{selectedDepotVoyage.arrivee}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted">Chauffeur:</span>
                                        <span className="ms-2 fw-semibold">{selectedDepotVoyage.chauffeur}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-warning mb-0">
                            Aucune information de dépôt disponible
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
        </>
    )
}

export default Voyages
