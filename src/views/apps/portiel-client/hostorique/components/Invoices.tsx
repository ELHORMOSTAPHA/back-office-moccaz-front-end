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
import {useState} from 'react'
import {Button, Card, CardFooter, CardHeader, Modal, Table, Form, Row, Col} from 'react-bootstrap'
import {LuCircleCheck, LuSearch} from 'react-icons/lu'
import {TbTruck, TbFileInvoice, TbEye, TbPlus} from 'react-icons/tb'

import {demandes, voyages, type DemandeType, type VoyageType} from '@/views/apps/invoice/invoices/data'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import CreateDemandeModal from './CreateDemandeModal'

const columnHelper = createColumnHelper<DemandeType>()

const Invoices = () => {
    // Helper function for status icon color
    const getStatusColor = (status: DemandeType['status']) => {
        switch (status) {
            case 'À planifier': return 'text-secondary'
            case 'Planifiée': return 'text-info'
            case 'Enlèvement en cours': return 'text-warning'
            case 'Enlevée': return 'text-primary'
            case 'En livraison': return 'text-warning'
            case 'Livrée': return 'text-success'
            case 'Anomalie': return 'text-danger'
            case 'Clôturée': return 'text-muted'
            default: return 'text-secondary'
        }
    }

    // Helper function for status badge color
    const getStatusBadgeColor = (status: DemandeType['status']) => {
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
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ({row}) => (
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
        columnHelper.accessor('client', {
            header: 'Client',
            cell: ({row}) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    {row.original.image ? (
                        <div className="avatar avatar-sm">
                            <img src={row.original.image} height={32} width={32} alt=""
                                 className="img-fluid rounded-circle"/>
                        </div>
                    ) : (
                        <div className="avatar-sm flex-shrink-0">
                            <span
                                className="avatar-title text-bg-primary fw-bold rounded-circle">{row.original.client.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <Link to="" className="link-reset">
                                {row.original.client}
                            </Link>
                        </h5>
                        <p className="text-muted fs-xs mb-0">{row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('typeDemande', {
            header: 'Type de Demande',
            cell: ({row}) => (
                <span className={`badge ${row.original.typeDemande === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} badge-label`}>
                    {row.original.typeDemande}
                </span>
            ),
        }),
        columnHelper.accessor('nombreColies', {
            header: 'Nb Colis',
            cell: ({row}) => row.original.nombreColies,
        }),
        columnHelper.accessor('taillesColies', {
            header: 'Taille',
            cell: ({row}) => (
                <span className={`badge bg-secondary-subtle text-secondary badge-label`}>
                    {row.original.taillesColies}
                </span>
            ),
        }),
        columnHelper.accessor('nombreTonne', {
            header: 'Tonnage',
            cell: ({row}) => `${row.original.nombreTonne} T`,
        }),
        columnHelper.accessor('dateEnlevement', {
            header: 'Date Enlèvement',
            cell: ({row}) => new Date(row.original.dateEnlevement).toLocaleDateString('fr-FR'),
        }),
        columnHelper.accessor('Manutention', {
            header: 'Manutention',
            cell: ({row}) => (
                <span className={`badge ${row.original.Manutention ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                    {row.original.Manutention ? 'Oui' : 'Non'}
                </span>
            ),
        }),
        columnHelper.accessor('retour', {
            header: 'Retour',
            cell: ({row}) => (
                <span className={`badge ${row.original.retour ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} badge-label`}>
                    {row.original.retour ? 'Oui' : 'Non'}
                </span>
            ),
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
            cell: ({row}: { row: TableRow<DemandeType> }) => (
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
                    {row.original.status === 'À planifier' ? (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-pill"
                            onClick={() => {
                                // Handle affectation logic here
                                handleShowAffectationModal(row.original.id)
                            }}
                        >
                            <TbTruck className="fs-sm me-1"/>
                            Affecter
                        </Button>
                    ) : (
                        <Button 
                            variant="info" 
                            size="sm" 
                            className="rounded-pill"
                            onClick={() => {
                                // Handle modification logic here
                                handleShowAffectationModal(row.original.id)
                            }}
                        >
                            <TbTruck className="fs-sm me-1"/>
                            Modifier
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    const [data] = useState<DemandeType[]>(() => [...demandes])
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 8})
    
    // Modal state for creating demande
    const [showCreateDemandeModal, setShowCreateDemandeModal] = useState(false)
    
    // Modal state for showing related voyages
    const [showVoyagesModal, setShowVoyagesModal] = useState(false)
    const [selectedDemandeId, setSelectedDemandeId] = useState<string>('')
    const [relatedVoyages, setRelatedVoyages] = useState<VoyageType[]>([])

    // Modal state for affectation
    const [showAffectationModal, setShowAffectationModal] = useState(false)
    const [affectationFormData, setAffectationFormData] = useState({
        chauffeur: '',
        vehicule: ''
    })
    const [isSubmittingAffectation, setIsSubmittingAffectation] = useState(false)

    // Sample data for chauffeurs and vehicles (in a real app, this would come from API)
    const availableChauffeurs = [
        'Ahmed Ben Ali',
        'Mohamed Rachid', 
        'Omar Bennani',
        'Youssef El Mansouri',
        'Khalid Zeroual',
        'Hassan Alami',
        'Abdellah Tazi',
        'Noureddine Fassi',
        'Rachid Benali',
        'Said Benjelloun'
    ]

    const availableVehicules = [
        'Camion 12T - MA 1234 CD',
        'Fourgon 3.5T - MA 5678 EF', 
        'Remorque 20T - MA 9012 GH',
        'Moto 0.5T - MA 3456 IJ',
        'Camion 8T - MA 7890 KL',
        'Fourgon 2.5T - MA 2468 MN',
        'Scooter 0.2T - MA 1357 OP',
        'Camion 15T - MA 8024 QR',
        'Fourgon 4T - MA 9753 ST',
        'Remorque 25T - MA 4680 UV'
    ]

    // Function to handle showing voyages for a demande
    const handleShowVoyages = (demandeId: string) => {
        // For demo purposes, we'll show voyages that might be related to this demande
        // In a real app, you'd filter voyages based on actual relationships
        const mockRelatedVoyages = voyages.filter((_, index) => {
            // Mock logic: show 2-3 voyages for each demande
            const demandeIndex = demandes.findIndex(d => d.id === demandeId)
            return index >= demandeIndex * 2 && index < (demandeIndex * 2) + 3
        })
        
        // Find the demande to check its status
        const demande = demandes.find(d => d.id === demandeId)
        
        // If status is "À planifier", clear chauffeur and vehicule to show as "Non affecté"
        const processedVoyages = mockRelatedVoyages.map(voyage => ({
            ...voyage,
            chauffeur: demande?.status === 'À planifier' ? '' : voyage.chauffeur,
            vehicule: demande?.status === 'À planifier' ? '' : voyage.vehicule
        }))
        
        setSelectedDemandeId(demandeId)
        setRelatedVoyages(processedVoyages)
        setShowVoyagesModal(true)
    }

    const handleCloseVoyagesModal = () => {
        setShowVoyagesModal(false)
        setSelectedDemandeId('')
        setRelatedVoyages([])
    }

    // Function to handle showing affectation modal
    const handleShowAffectationModal = (demandeId: string) => {
        // Get related voyages for this demande
        const mockRelatedVoyages = voyages.filter((_, index) => {
            const demandeIndex = demandes.findIndex(d => d.id === demandeId)
            return index >= demandeIndex * 2 && index < (demandeIndex * 2) + 3
        })
        
        // Find the demande to check its status
        const demande = demandes.find(d => d.id === demandeId)
        
        // If not "À planifier", pre-populate with existing affectation (simulate existing data)
        if (demande && demande.status !== 'À planifier') {
            // In a real app, you'd get the actual assigned chauffeur and vehicle from the voyages
            // For demo, we'll simulate some existing assignments
            const existingAffectation = {
                chauffeur: mockRelatedVoyages[0]?.chauffeur || availableChauffeurs[0],
                vehicule: mockRelatedVoyages[0]?.vehicule || availableVehicules[0]
            }
            setAffectationFormData(existingAffectation)
        } else {
            setAffectationFormData({ chauffeur: '', vehicule: '' })
        }
        
        setSelectedDemandeId(demandeId)
        setRelatedVoyages(mockRelatedVoyages)
        setShowAffectationModal(true)
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

            const demande = demandes.find(d => d.id === selectedDemandeId)
            const isPlanning = demande?.status === 'À planifier'
            const message = isPlanning 
                ? `Affectation réussie! ${relatedVoyages.length} voyage(s) ont été affectés à ${affectationFormData.chauffeur}`
                : `Modification réussie! Les voyages ont été réaffectés à ${affectationFormData.chauffeur}`

            alert(message)
            handleCloseAffectationModal()
        } catch (error) {
            console.error('Error during affectation:', error)
            alert('Erreur lors de l\'affectation')
        } finally {
            setIsSubmittingAffectation(false)
        }
    }

    const table = useReactTable({
        data,
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
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateDemandeModal(true)}
                    >
                        <TbPlus className="fs-lg me-1" />
                        Créer Demande
                    </Button>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span className="me-2 fw-semibold">Filter By:</span>

                    <div className="app-search">
                        <select
                            className="form-select form-control my-1 my-md-0"
                            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'All'}
                            onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                            <option value="All">Statut</option>
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

            <DataTable<DemandeType> table={table} emptyMessage="No records found"/>

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

        {/* Modal for showing related voyages */}
        <Modal show={showVoyagesModal} onHide={handleCloseVoyagesModal} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    Trajet liés à la demande #{selectedDemandeId}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {relatedVoyages.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID Trajet</th>
                                <th>Type</th>
                                <th>Chauffeur</th>
                                <th>Véhicule</th>
                                <th>Départ</th>
                                <th>Arrivée</th>
                                <th>Date Départ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedVoyages.map((voyage) => (
                                <tr key={voyage.id}>
                                    <td>
                                        <strong className="text-primary">#{voyage.id}</strong>
                                    </td>
                                    <td>
                                        <span className={`badge ${voyage.typeVoyage === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                                            {voyage.typeVoyage}
                                        </span>
                                    </td>
                                    <td>
                                        {voyage.chauffeur || (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>
                                        {voyage.vehicule ? (
                                            <span className="text-muted">{voyage.vehicule}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Non affecté</span>
                                        )}
                                    </td>
                                    <td>{voyage.depart}</td>
                                    <td>{voyage.arrivee}</td>
                                    <td>{new Date(voyage.dateDepart).toLocaleDateString('fr-FR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center py-4">
                        <TbTruck size={48} className="text-muted mb-3" />
                        <h6 className="text-muted">Aucun voyage associé à cette demande</h6>
                        <p className="text-muted small">
                            Les voyages seront affichés ici une fois qu'ils seront affectés à cette demande.
                        </p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className='btn-danger' onClick={handleCloseVoyagesModal}>
                    Fermer
                </Button>
                {relatedVoyages.length > 0 && (
                    <Button variant="primary" onClick={() => {
                        // Handle navigation to full voyages view or management
                        console.log('Manage voyages for demande:', selectedDemandeId)
                        handleCloseVoyagesModal()
                    }}>
                        Gérer les Voyages
                    </Button>
                )}
            </Modal.Footer>
        </Modal>

        {/* Modal for affectation */}
        <Modal show={showAffectationModal} onHide={handleCloseAffectationModal} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {(() => {
                        const demande = demandes.find(d => d.id === selectedDemandeId)
                        const isPlanning = demande?.status === 'À planifier'
                        return isPlanning 
                            ? `Affecter Chauffeur et Véhicule - Demande #${selectedDemandeId}`
                            : `Modifier Affectation - Demande #${selectedDemandeId}`
                    })()}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitAffectation}>
                <Modal.Body>
                    <div className="mb-4">
                        <h6 className="text-muted mb-3">
                            <TbTruck className="me-2" />
                            {(() => {
                                const demande = demandes.find(d => d.id === selectedDemandeId)
                                const isPlanning = demande?.status === 'À planifier'
                                return isPlanning 
                                    ? `Voyages à affecter (${relatedVoyages.length})`
                                    : `Voyages affectés (${relatedVoyages.length})`
                            })()}
                        </h6>
                        {relatedVoyages.length > 0 ? (
                            <div className="border rounded p-3 bg-light">
                                {relatedVoyages.map((voyage) => (
                                    <div key={voyage.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong className="text-primary">#{voyage.id}</strong>
                                            <span className="ms-2 text-muted">
                                                {voyage.depart} → {voyage.arrivee}
                                            </span>
                                        </div>
                                        <span className={`badge ${voyage.typeVoyage === 'Transport' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                                            {voyage.typeVoyage}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-3 text-muted">
                                Aucun voyage trouvé pour cette demande
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
                                >
                                    <option value="">Sélectionnez un chauffeur</option>
                                    {availableChauffeurs.map((chauffeur) => (
                                        <option key={chauffeur} value={chauffeur}>
                                            {chauffeur}
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
                                >
                                    <option value="">Sélectionnez un véhicule</option>
                                    {availableVehicules.map((vehicule) => (
                                        <option key={vehicule} value={vehicule}>
                                            {vehicule}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>
                    </Row>

                    {affectationFormData.chauffeur && affectationFormData.vehicule && (
                        <div className="alert alert-info">
                            {(() => {
                                const demande = demandes.find(d => d.id === selectedDemandeId)
                                const isPlanning = demande?.status === 'À planifier'
                                return isPlanning ? (
                                    <>
                                        <strong>Résumé de l'affectation:</strong><br />
                                        <strong>{affectationFormData.chauffeur}</strong> avec le véhicule <strong>{affectationFormData.vehicule}</strong> 
                                        sera affecté à <strong>{relatedVoyages.length}</strong> voyage(s).
                                    </>
                                ) : (
                                    <>
                                        <strong>Résumé de la modification:</strong><br />
                                        Les voyages seront réaffectés à <strong>{affectationFormData.chauffeur}</strong> avec le véhicule <strong>{affectationFormData.vehicule}</strong>.
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={handleCloseAffectationModal}
                        disabled={isSubmittingAffectation}
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
                                    const demande = demandes.find(d => d.id === selectedDemandeId)
                                    const isPlanning = demande?.status === 'À planifier'
                                    return isPlanning ? 'Affectation...' : 'Modification...'
                                })()}
                            </>
                        ) : (
                            <>
                                <TbTruck className="me-2" />
                                {(() => {
                                    const demande = demandes.find(d => d.id === selectedDemandeId)
                                    const isPlanning = demande?.status === 'À planifier'
                                    return isPlanning ? 'Confirmer l\'Affectation' : 'Confirmer la Modification'
                                })()}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Modal for creating demande */}
        <CreateDemandeModal 
            show={showCreateDemandeModal} 
            onHide={() => setShowCreateDemandeModal(false)} 
        />
        </>
    )
}

export default Invoices
