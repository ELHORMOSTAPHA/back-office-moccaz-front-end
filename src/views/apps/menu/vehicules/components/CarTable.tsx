import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import { loadvehicules, updateVehiculesBulkStatus } from '@/services/vehicule'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
    type ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    type Row as TableRow,
    useReactTable,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import {
    Button,
    Card,
    CardFooter,
    Modal,
    CardHeader,
    Row,
    Col,
} from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'
import { TbEdit } from 'react-icons/tb'
import { useToggle } from 'usehooks-ts'
import { LiaCarSideSolid } from 'react-icons/lia'
import type { Vehicule } from '@/interface/gloable'
import AjouterVehiculeModal from './Modals/Ajouter_Vehicule_modal'
import ModifierVehiculeModal from './Modals/Modifier_Vehicule_modal'
import TableSkeleton from '@/components/TableSkeleton'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import French from 'flatpickr/dist/l10n/fr'

// Helper function to format date to ISO string without timezone conversion
const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Selection state type
type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const columnHelper = createColumnHelper<Vehicule>()

const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case 'actif':
            return 'bg-success-subtle text-success'
        case 'inactif':
            return 'bg-danger-subtle text-danger'
        default:
            return 'bg-secondary-subtle text-secondary'
    }
}

const CarTable = () => {
    const queryClient = useQueryClient()
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [typeProprietaireFilter, setTypeProprietaireFilter] = useState<{ value: string; label: string } | null>(null)
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null)
    const [dateFilter, setDateFilter] = useState<Date[]>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

    // Enhanced selection state
    const [selectionState, setSelectionState] = useState<SelectionState>({
        selectAll: false,
        selectedIds: new Set<string>(),
        excludedIds: new Set<string>()
    })
    
    // Track the last header checkbox action for proper 3-state cycle
    const [headerCheckState, setHeaderCheckState] = useState<'none' | 'page' | 'all'>('none')

    // Prepare API parameters
    const apiParams = useMemo(() => ({
        paginated: true,
        per_page: pagination.pageSize,
        page: pagination.pageIndex + 1,
        order_by: sorting[0]?.id || 'created_at',
        order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
        keyword: globalFilter,
        type_proprietaire: typeProprietaireFilter?.value || undefined,
        statut: statusFilter?.value || undefined,
        date_from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
        date_to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
    }), [pagination.pageSize, pagination.pageIndex, sorting, globalFilter, typeProprietaireFilter, statusFilter, dateFilter])

    // Fetch data with React Query
    const { data: apiResponse, isLoading, isError, error } = useQuery({
        queryKey: ['vehicules', apiParams],
        queryFn: () => loadvehicules(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => {
        if (!apiResponse?.data) return [] as Vehicule[]
        return apiResponse.data
    }, [apiResponse])

    const totalItems = apiResponse?.pagination?.total_items ?? 0
    const start = apiResponse?.pagination?.from ?? 0
    const end = apiResponse?.pagination?.to ?? 0

    // Reset selection when filters change
    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>()
        })
        setHeaderCheckState('none')
    }, [globalFilter, typeProprietaireFilter, statusFilter, dateFilter])

    // Calculate current page vehicule IDs
    const currentPageIds = useMemo(() => {
        return data.map(vehicule => String(vehicule.id))
    }, [data])

    // Check if a vehicule is selected
    const isVehiculeSelected = (vehiculeId: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(vehiculeId)
        }
        return selectionState.selectedIds.has(vehiculeId)
    }

    // Get selected count
    const getSelectedCount = (): number => {
        if (selectionState.selectAll) {
            return totalItems - selectionState.excludedIds.size
        }
        return selectionState.selectedIds.size
    }

    // Check if all current page items are selected
    const areAllCurrentPageSelected = (): boolean => {
        return currentPageIds.length > 0 && currentPageIds.every(id => isVehiculeSelected(id))
    }

    // Check if some (but not all) current page items are selected
    const areSomeCurrentPageSelected = (): boolean => {
        return currentPageIds.some(id => isVehiculeSelected(id)) && !areAllCurrentPageSelected()
    }

    // Toggle individual vehicule selection
    const toggleVehiculeSelection = (vehiculeId: string) => {
        setSelectionState(prev => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(vehiculeId)) {
                    newExcluded.delete(vehiculeId)
                } else {
                    newExcluded.add(vehiculeId)
                }
                return { ...prev, excludedIds: newExcluded }
            } else {
                const newSelected = new Set(prev.selectedIds)
                if (newSelected.has(vehiculeId)) {
                    newSelected.delete(vehiculeId)
                } else {
                    newSelected.add(vehiculeId)
                }
                return { ...prev, selectedIds: newSelected }
            }
        })
        
        // Reset header check state when manually toggling
        setHeaderCheckState('none')
    }

    // Handle header checkbox click (3-state cycle)
    const handleHeaderCheckboxClick = () => {
        if (headerCheckState === 'none' || !areAllCurrentPageSelected()) {
            // First click: Select all on current page only
            setSelectionState(prev => {
                const newSelected = new Set(prev.selectedIds)
                currentPageIds.forEach(id => newSelected.add(id))
                return {
                    selectAll: false,
                    selectedIds: newSelected,
                    excludedIds: new Set<string>()
                }
            })
            setHeaderCheckState('page')
        } else if (headerCheckState === 'page' && areAllCurrentPageSelected()) {
            // Second click: Select all across all pages
            setSelectionState({
                selectAll: true,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>()
            })
            setHeaderCheckState('all')
        } else if (headerCheckState === 'all') {
            // Third click: Clear all selections
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>()
            })
            setHeaderCheckState('none')
        }
    }

    const columns: ColumnDef<Vehicule, any>[] = [
        {
            id: 'select',
            maxSize: 45,
            size: 45,
            header: () => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={selectionState.selectAll || areAllCurrentPageSelected()}
                    ref={(input) => {
                        if (input) {
                            input.indeterminate = !selectionState.selectAll && areSomeCurrentPageSelected()
                        }
                    }}
                    onChange={handleHeaderCheckboxClick}
                />
            ),
            cell: ({ row }: { row: TableRow<Vehicule> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isVehiculeSelected(String(row.original.id))}
                    onChange={() => toggleVehiculeSelection(String(row.original.id))}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ({ row }) => (
                <p className="fs-base mb-0">
                    {row.original.id}
                </p>
            ),
        }),
        columnHelper.accessor('numero_vehicule', {
            header: 'N° Véhicule',
            cell: ({ row }) => (
                <p className="fs-base mb-0">{row.original.numero_vehicule}</p>
            ),
        }),
        columnHelper.accessor('immatriculation', {
            header: 'Immatriculation',
            cell: ({ row }) => (
                <div className="d-flex  align-baseline">
                    <div className="avatar avatar-sm">
                        <LiaCarSideSolid size={20} />
                    </div>
                    <div>
                        <p className="fs-base mb-0">{row.original.immatriculation}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('tonnage', {
            header: 'Tonnage',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <p className=""> {row.original.tonnage}</p>
                </div>
            ),
        }),
        columnHelper.accessor('type_vehicule', {
            header: 'Type',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <p className=""> {row.original.type_vehicule?.libelle_type_vehicule}</p>
                </div>
            ),
        }),
        columnHelper.accessor('statut', {
            header: 'Statut',
            cell: ({ row }) => (
                <span className={`badge badge-label ${getStatusBadgeColor(row.original.statut)}`}>
                    {row.original.statut ? row.original.statut.charAt(0).toUpperCase() + row.original.statut.slice(1) : 'N/A'}
                </span>
            ),
        }),
        columnHelper.accessor('type_proprietaire', {
            header: 'Propriétaire',
            filterFn: 'equalsString',
            enableColumnFilter: true,
            cell: ({ row }) => (
                <span className='text-nowrap'>{row.original.type_proprietaire}</span>
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Date Inscription',
            cell: ({ row }) => {
                const createdDate = new Date(row.original.created_at)
                const date = createdDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                const time = createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
                return (
                    <>
                       {date}<br/> <small className="text-muted">{time}</small>
                    </>
                )
            },  
        }),
        {
            header: 'Actions',
            cell: ({ row }: { row: TableRow<Vehicule> }) => (
                <div className="d-flex  gap-1">
                    <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => {
                        toggleEditModal()
                        setSelectedCar(row.original)
                    }}>
                        <TbEdit className="fs-lg" />
                    </Button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data,
        columns,
        state: { 
            sorting, 
            globalFilter, 
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize
            }
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: apiResponse?.pagination?.last_page ?? 0,
    })

    // Bulk status update mutation
    const bulkStatusMutation = useMutation({
        mutationFn: (newStatus: string) => {
            const payload = selectionState.selectAll
                ? {
                    select_all: true,
                    excluded_ids: Array.from(selectionState.excludedIds),
                    filters: {
                        keyword: globalFilter || undefined,
                        type_proprietaire: typeProprietaireFilter?.value || undefined,
                        statut: statusFilter?.value || undefined,
                        date_from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
                        date_to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
                    },
                    statut: newStatus
                }
                : {
                    select_all: false,
                    ids: Array.from(selectionState.selectedIds),
                    statut: newStatus
                }
            console.log('Bulk status payload:', payload)
            return updateVehiculesBulkStatus(payload)
        },
        onSuccess: () => {
            console.log('Bulk status update successful')
            queryClient.invalidateQueries({ queryKey: ["vehicules"] })
            
            // Reset selection state
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>()
            })
            setHeaderCheckState('none')
        },
        onError: (error) => {
            console.error('Bulk status update error:', error)
        }
    })

    const toggleEditModal = () => {
        setShowEditModal(!showEditModal)
    }

    const [show, toggle] = useToggle(false)
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [selectedCar, setSelectedCar] = useState<Vehicule | null>(null)

    const selectedCount = getSelectedCount()

    return (
        <>
            <div className="d-flex justify-content-end mb-2">
                <Button
                    variant="secondary"
                    onClick={toggle}
                    className="btn btn-danger"
                >
                    + Ajouter Véhicule
                </Button>
            </div>

            {/* Enhanced Search Card */}
            <Card className="mb-3 border-light shadow-sm">
                <div className="p-3">
                    {/* Secondary Filters Row */}
                    <Row className="g-3">
                        {/* Date Picker */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium mb-0 text-nowrap text-dark">Filtrer par date</label>
                                <Flatpickr
                                    className="form-control"
                                    placeholder="Sélectionner une date"
                                    value={dateFilter}
                                    onChange={(dates) => {
                                        setDateFilter(dates)
                                        setPagination({ ...pagination, pageIndex: 0 })
                                    }}
                                    options={{
                                        dateFormat: 'd M, Y',
                                        mode: 'range',
                                        locale: French.fr,
                                        monthSelectorType: 'dropdown',
                                    }}
                                   
                                />
                            </div>
                        </Col>

                        {/* Type Propriétaire Filter */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium text-dark mb-0 text-nowrap">Type Propriétaire</label>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder="Tous"
                                    isClearable
                                    options={[
                                        { value: 'interne', label: 'Eurofat' },
                                        { value: 'externe', label: 'Externe' },
                                    ]}
                                    value={typeProprietaireFilter}
                                    onChange={(option) => {
                                        setTypeProprietaireFilter(option)
                                        setPagination({ ...pagination, pageIndex: 0 })
                                    }}
                                />
                            </div>
                        </Col>

                        {/* Status Filter */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium text-dark mb-0 text-nowrap">Statut</label>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder="Tous"
                                    isClearable
                                    options={[
                                        { value: 'actif', label: 'Actif' },
                                        { value: 'inactif', label: 'Inactif' },
                                    ]}
                                    value={statusFilter}
                                    onChange={(option) => {
                                        setStatusFilter(option)
                                        setPagination({ ...pagination, pageIndex: 0 })
                                    }}
                                />
                            </div>
                        </Col>

                        {/* Items Per Page */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium text-dark mb-0 text-nowrap">Par page</label>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder="10"
                                    options={[
                                        { value: 5, label: '5' },
                                        { value: 10, label: '10' },
                                        { value: 15, label: '15' },
                                        { value: 20, label: '20' },
                                    ]}
                                    value={{ value: pagination.pageSize, label: pagination.pageSize.toString() }}
                                    onChange={(option) => {
                                        if (option) {
                                            setPagination({ pageIndex: 0, pageSize: option.value as number })
                                        }
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Primary Search Section */}
                    <Row>
                        <Col xs={12} md={6} lg={6}>
                            <div className="mt-2">
                                <label className="d-block fw-semibold text-dark mb-2">Que cherchez-vous ?</label>
                                <div className="app-search">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Rechercher véhicules..."
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                    />
                                    <LuSearch className="app-search-icon text-muted" />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Clear Filters Button */}
                    {(globalFilter || statusFilter || typeProprietaireFilter || dateFilter.length > 0) && (
                        <div className="d-flex justify-content-end mb-2 mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setGlobalFilter('')
                                    setStatusFilter(null)
                                    setTypeProprietaireFilter(null)
                                    setDateFilter([])
                                    setPagination({ ...pagination, pageIndex: 0 })
                                }}
                                className="btn btn-danger"
                                style={{ fontSize: '13px' }}
                            >
                                ✕ Réinitialiser les filtres
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <CardHeader className="border-light justify-content-between">
                    <div className="d-flex gap-2">
                        {selectedCount > 0 && (
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary-subtle text-primary">
                                    {selectionState.selectAll ? `Tous (${selectedCount})` : selectedCount} sélectionné(s)
                                </span>
                                <select
                                    className="form-select form-control"
                                    style={{ width: '200px' }}
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            bulkStatusMutation.mutate(e.target.value)
                                        }
                                    }}
                                    disabled={bulkStatusMutation.isPending}
                                >
                                    <option value="">Changer le statut...</option>
                                    <option value="actif">Actif</option>
                                    <option value="inactif">Inactif</option>
                                </select>
                                {bulkStatusMutation.isPending && (
                                    <span className="text-muted fs-xs">Mise à jour...</span>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                
                {isLoading ? (
                    <TableSkeleton
                        rows={pagination.pageSize}
                        columns={[
                            { id: 'checkbox', width: '40px', type: 'checkbox' },
                            { id: 'id', width: '60px', type: 'text' },
                            { id: 'numero_vehicule', width: '120px', type: 'text' },
                            { id: 'immatriculation', width: '140px', type: 'text' },
                            { id: 'tonnage', width: '100px', type: 'text' },
                            { id: 'type_vehicule', width: '120px', type: 'text' },
                            { id: 'statut', width: '100px', type: 'badge' },
                            { id: 'type_proprietaire', width: '130px', type: 'text' },
                            { id: 'actions', width: '100px', type: 'actions' },
                        ]}
                    />
                ) : isError ? (
                    <div className="alert alert-danger m-3">
                        Erreur lors du chargement des véhicules: {error?.message}
                    </div>
                ) : (
                    <DataTable table={table} emptyMessage="Aucun enregistrement trouvé" />
                )}
                {!isLoading && data.length > 0 && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="véhicules"
                            showInfo
                            previousPage={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={apiResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination({ ...pagination, pageIndex: index })}
                            nextPage={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                            canNextPage={pagination.pageIndex < (apiResponse?.pagination?.last_page ?? 1) - 1}
                        />
                    </CardFooter>
                )}
            </Card>

            <AjouterVehiculeModal 
                show={show} 
                onHide={toggle}
            />

            <ModifierVehiculeModal
                show={showEditModal}
                onHide={toggleEditModal}
                selectedCar={selectedCar}
            />

            <Modal centered show={bulkStatusMutation.isPending} backdrop="static" keyboard={false}>
                <Modal.Body className="text-center py-5">
                    <div className="d-flex justify-content-center mb-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                    <h5 className="mb-2">Mise à jour du statut</h5>
                    <p className="text-muted">Mise à jour de {selectedCount} véhicule(s) en cours...</p>
                </Modal.Body>
            </Modal>
        </>
    )
}
export default CarTable