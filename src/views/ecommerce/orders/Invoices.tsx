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

import { Link } from "react-router";
import { useState, useEffect } from 'react'
import { Button, Card, CardFooter, CardHeader, Modal, Table, Spinner, Alert } from 'react-bootstrap'
import { LuCircleCheck, LuSearch } from 'react-icons/lu'
import {TbTruck, TbFileInvoice, TbEye, TbPlus} from 'react-icons/tb'

import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import {getAllDemandes, type Demande} from '@/services/demandeService'
import {getTrajetsByDemande, type Trajet} from '@/services/trajetService'
import { useAuth } from '@/context/AuthProvider'

const columnHelper = createColumnHelper<Demande>()

const Invoices = () => {
    // API State
    const [demandes, setDemandes] = useState<Demande[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get client ID from authenticated user
    const { user, loading: authLoading } = useAuth()
    const clientId = user?.client?.id

    // Fetch demandes for this client
    useEffect(() => {
        const fetchDemandes = async () => {
            console.log('=== FETCH EFFECT TRIGGERED ===')
            console.log('authLoading:', authLoading)
            console.log('user:', user)
            console.log('user?.client:', user?.client)
            console.log('clientId:', clientId)
            console.log('==============================')

            // Wait for auth to complete loading
            if (authLoading) {
                setLoading(true)
                return
            }

            // Don't fetch if user is not authenticated
            if (!user) {
                setLoading(false)
                setError('Utilisateur non authentifié. Veuillez vous connecter.')
                return
            }

            // Check if user has client role
            if (!user.client) {
                setLoading(false)
                setError(`Votre compte utilisateur (ID: ${user.id}) n'a pas de profil client associé dans la base de données. Veuillez contacter l'administrateur pour créer votre profil client.`)
                console.error('=== USER MISSING CLIENT RECORD ===')
                console.error('User ID:', user.id)
                console.error('User profile:', user.profile)
                console.error('Full user object:', JSON.stringify(user, null, 2))
                console.error('======================================')
                return
            }

            // Don't fetch if client ID is not available
            if (!clientId) {
                setLoading(false)
                setError('Client ID non trouvé. Veuillez vous reconnecter.')
                console.error('Client object:', user.client)
                return
            }

            try {
                setLoading(true)
                setError(null)
                console.log('Fetching demandes for client:', clientId)
                const response = await getAllDemandes({ id_client: clientId })
                console.log('Demandes fetched successfully:', response.data)
                setDemandes(response.data)
            } catch (err) {
                console.error('Error fetching demandes:', err)
                setError('Erreur lors du chargement des demandes. Veuillez réessayer.')
            } finally {
                setLoading(false)
            }
        }

        fetchDemandes()
    }, [clientId, authLoading, user])

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
            cell: ({ row }) => (
                <h5 className="m-0 d-flex align-items-center gap-1">
                    <TbFileInvoice
                        className={`fs-lg ${getStatusColor(row.original.status)}`}
                    />
                    <Link to="" className="link-reset fw-semibold">
                        #{row.original.id}
                    </Link>
                </h5>
            ),
        }),
        columnHelper.accessor('type_demande', {
            header: 'Type de Demande',
            cell: ({ row }) => (
                <span className={`badge ${row.original.type_demande === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} badge-label`}>
                    {row.original.type_demande}
                </span>
            ),
        }),
        columnHelper.accessor('type_vehicule', {
            header: 'Type Véhicule',
            cell: ({ row }) => (
                <span className="badge bg-secondary-subtle text-secondary badge-label">
                    {row.original.type_vehicule?.libelle || '-'}
                </span>
            ),
        }),
        columnHelper.accessor('nombre_tonne', {
            header: 'Tonnage',
            cell: ({ row }) => row.original.type_demande === 'Messagerie' ? '-' : `${row.original.nombre_tonne} T`,
        }),
        columnHelper.accessor('date_enlevement', {
            header: 'Date Enlèvement',
            cell: ({ row }) => new Date(row.original.date_enlevement).toLocaleDateString('fr-FR'),
        }),
        columnHelper.accessor('date_livraison_souhaitee', {
            header: 'Date Livraison',
            cell: ({ row }) => {
                if (row.original.type_demande === 'Messagerie') {
                    // For Messagerie: date_enlevement + 48 hours
                    const dateEnlevement = new Date(row.original.date_enlevement)
                    dateEnlevement.setHours(dateEnlevement.getHours() + 48)
                    return dateEnlevement.toLocaleDateString('fr-FR')
                }
                // For Transport: use the actual date_livraison_souhaitee
                return row.original.date_livraison_souhaitee
                    ? new Date(row.original.date_livraison_souhaitee).toLocaleDateString('fr-FR')
                    : 'N/A'
            },
        }),
        columnHelper.accessor('status', {
            header: 'Statut',
            cell: ({ row }) => (
                <span className={`badge ${getStatusBadgeColor(row.original.status)} badge-label`}>
                    {row.original.status}
                </span>
            ),
        }),
        {
            header: 'Actions',
            cell: ({ row }: { row: TableRow<Demande> }) => (
                <div className="d-flex gap-1 align-items-center justify-content-center ">
                    <Button
                        variant="light"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => {
                            // Show voyages related to this demande
                            handleShowVoyages(row.original.id, row.original.type_demande)
                        }}
                    >
                        <TbEye className="fs-lg" />
                    </Button>
                    {/* //imprimer la facture */}
                </div>
            ),
        },
    ]

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })

    // Modal state for showing related voyages
    const [showVoyagesModal, setShowVoyagesModal] = useState(false)
    const [selectedDemandeId, setSelectedDemandeId] = useState<number>(0)
    const [selectedDemandeType, setSelectedDemandeType] = useState<string>('')
    const [relatedVoyages, setRelatedVoyages] = useState<Trajet[]>([])
    const [loadingVoyages, setLoadingVoyages] = useState(false)

    // Function to handle showing voyages for a demande
    const handleShowVoyages = async (demandeId: number, demandeType: string) => {
        setLoadingVoyages(true)
        setSelectedDemandeId(demandeId)
        setSelectedDemandeType(demandeType)
        setShowVoyagesModal(true)

        try {
            // Fetch trajets for this demande
            const trajetsResponse = await getTrajetsByDemande(demandeId)
            setRelatedVoyages(trajetsResponse.data)
        } catch (error) {
            console.error('Error fetching trajets:', error)
            setRelatedVoyages([])
        } finally {
            setLoadingVoyages(false)
        }
    }

    const handleCloseVoyagesModal = () => {
        setShowVoyagesModal(false)
        setSelectedDemandeId(0)
        setSelectedDemandeType('')
        setRelatedVoyages([])
    }

    const table = useReactTable({
        data: demandes,
        columns,
        state: { sorting, globalFilter, columnFilters, pagination },
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
    /*
    const getVoyageStatusColor = (status: VoyageType['status']) => {
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
    */

    return (
        <>
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Chargement des demandes...</p>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Erreur</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
                        Réessayer
                    </Button>
                </Alert>
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
                            <LuSearch className="app-search-icon text-muted" />
                        </div>

                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="me-2 fw-semibold">Filter By:</span>
                        <div className="app-search">
                            <select
                                className="form-select form-control my-1 my-md-0"
                                value={(table.getColumn('type_demande')?.getFilterValue() as string) ?? 'All'}
                                onChange={(e) => table.getColumn('type_demande')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                                <option value="All">typeDemande</option>
                                <option value="Messagerie">Messagerie</option>
                                <option value="Transport">Transport</option>
                            </select>
                            <LuCircleCheck className="app-search-icon text-muted" />
                        </div>
                        <div className="app-search">
                            <select
                                className="form-select form-control my-1 my-md-0"
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
                            <LuCircleCheck className="app-search-icon text-muted" />
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
                        <Link to="/creer-demande" className="btn btn-danger"><TbPlus
                        className="fs-lg me-1"></TbPlus> Créer Demande</Link>
                    </div>

                </CardHeader>

                <DataTable<Demande> table={table} emptyMessage="No records found" />

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
                        selectedDemandeType === 'Messagerie' ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID Trajet</th>
                                        <th>Départ</th>
                                        <th>Arrivée</th>
                                        <th>Date Départ</th>
                                        <th>Nombre de Colis</th>
                                        <th>Taille</th>
                                        <th>Commentaire</th>
                                        <th>Retour</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedVoyages.map((voyage) => (
                                        <tr key={voyage.id}>
                                            <td>
                                                <strong className="text-info">#{voyage.id}</strong>
                                            </td>
                                            <td>{voyage.ville_depart?.nom || 'N/A'}</td>
                                            <td>{voyage.ville_arrivee?.nom || 'N/A'}</td>
                                            <td>{new Date(voyage.date_depart).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                {voyage.nombre_colies || '-'}
                                            </td>
                                            <td>
                                                {voyage.tailles_colies || '-'}
                                            </td>
                                            <td>
                                                {voyage.notes || '-'}
                                            </td>
                                            <td>
                                                <span className={`badge ${voyage.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                                                    {voyage.retour ? 'Oui' : 'Non'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID Trajet</th>
                                        <th>Départ</th>
                                        <th>Arrivée</th>
                                        <th>Date Départ</th>
                                        <th>Heure de Livraison</th>
                                        <th>Nombre de Cartons</th>
                                        <th>Manutention</th>
                                        <th>Retour</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedVoyages.map((voyage) => (
                                        <tr key={voyage.id}>
                                            <td>
                                                <strong className="text-primary">#{voyage.id}</strong>
                                            </td>
                                            <td>
                                                <div>
                                                    <div>{voyage.depot_depart?.nom_depot || 'N/A'}</div>
                                                    <small className="text-muted">{voyage.ville_depart?.nom || ''}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div>{voyage.depot_arrivee?.nom_depot || 'N/A'}</div>
                                                    <small className="text-muted">{voyage.ville_arrivee?.nom || ''}</small>
                                                </div>
                                            </td>
                                            <td>{new Date(voyage.date_depart).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                {voyage.heure_livraison || '-'}
                                            </td>
                                            <td>
                                                {voyage.nombre_colies || '-'}
                                            </td>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )
                    ) : (
                        <div className="text-center py-4">
                            <TbTruck size={48} className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun trajet associé à cette demande</h6>
                            <p className="text-muted small">
                                Les trajets seront affichés ici une fois qu'ils seront affectés à cette demande.
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
        </>
    )
}

export default Invoices
