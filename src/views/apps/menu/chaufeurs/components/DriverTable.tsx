import DataTable from '@/components/table/DataTable'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import TablePagination from '@/components/table/TablePagination'
import AjouterChauffeurModal from './Modals/Ajouter_chaffeur_modal'
import ModifierChauffeurModal from './Modals/Modifier_chauffeur_modal'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { loadChaffeurs, updateChauffeursBulkStatus } from '@/services/chauffeur'

import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    type Row as TableRow,
    useReactTable,
} from '@tanstack/react-table'

const basicOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'A1', label: 'A1' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'E(B)', label: 'E(B)' },
    { value: 'E(C)', label: 'E(C)' },
    { value: 'E(D)', label: 'E(D)' },
]

import { useState, useMemo, useEffect } from 'react'
import {
    Button,
    Card,
    CardFooter,
    CardHeader,
    Modal,
    Row,
    Col
} from 'react-bootstrap'

// Helper function to format date to ISO string without timezone conversion
const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
import { LuSearch } from 'react-icons/lu'
import { TbEdit, TbPhone } from 'react-icons/tb'
import { useToggle } from 'usehooks-ts'
import TableSkeleton from '@/components/TableSkeleton'
import type { Chauffeur } from '@/interface/gloable'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import French from 'flatpickr/dist/l10n/fr'

const getStatusBadgeColor = (status: Chauffeur['status']) => {
    switch (status) {
        case 'actif': return 'bg-success-subtle text-success'
        case 'inactif': return 'bg-danger-subtle text-danger'
        case 'suspendu': return 'bg-warning-subtle text-warning'
        default: return 'bg-secondary-subtle text-secondary'
    }
}

// Selection state type
type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const columnHelper = createColumnHelper<Chauffeur>()

const DriverTableComponent = () => {
    const queryClient = useQueryClient()
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null)
    const [employerFilter, setEmployerFilter] = useState<{ value: string; label: string } | null>(null)
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
        status: statusFilter?.value || undefined,
        type_employeur: employerFilter?.value || undefined,
        date_from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
        date_to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
    }), [pagination.pageSize, pagination.pageIndex, sorting, globalFilter, statusFilter, employerFilter, dateFilter])

    // Fetch data with React Query
    const { data: apiResponse, isLoading, isError, error } = useQuery({
        queryKey: ['chauffeurs', apiParams],
        queryFn: () => loadChaffeurs(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => {
        if (!apiResponse?.data) return [] as Chauffeur[]    
        return apiResponse.data
    }, [apiResponse])

    const totalItems = apiResponse?.pagination?.total_items ?? 0
    const start = apiResponse?.pagination?.from ?? 0
    const end = apiResponse?.pagination?.to ?? 0

    // Bulk status update mutation
    const bulkStatusMutation = useMutation({
        mutationFn: (newStatus: string) => {
            const payload = selectionState.selectAll
                ? {
                    select_all: true,
                    excluded_ids: Array.from(selectionState.excludedIds),
                    filters: {
                        keyword: globalFilter || undefined,
                        status: statusFilter?.value || undefined,
                        type_employeur: employerFilter?.value || undefined,
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
            return updateChauffeursBulkStatus(payload)
        },
        onSuccess: () => {
            // Invalidate and refetch chauffeurs
            queryClient.invalidateQueries({ queryKey: ["chauffeurs"] })
            
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

    // Reset selection when filters change
    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>()
        })
        setHeaderCheckState('none')
    }, [globalFilter, statusFilter, employerFilter, dateFilter])

    // Calculate current page chauffeur IDs
    const currentPageIds = useMemo(() => {
        return data.map(chauffeur => String(chauffeur.id))
    }, [data])

    // Check if a chauffeur is selected
    const isChauffeurSelected = (chauffeurId: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(chauffeurId)
        }
        return selectionState.selectedIds.has(chauffeurId)
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
        return currentPageIds.length > 0 && currentPageIds.every(id => isChauffeurSelected(id))
    }

    // Check if some (but not all) current page items are selected
    const areSomeCurrentPageSelected = (): boolean => {
        return currentPageIds.some(id => isChauffeurSelected(id)) && !areAllCurrentPageSelected()
    }

    // Toggle individual chauffeur selection
    const toggleChauffeurSelection = (chauffeurId: string) => {
        setSelectionState(prev => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(chauffeurId)) {
                    newExcluded.delete(chauffeurId)
                } else {
                    newExcluded.add(chauffeurId)
                }
                return { ...prev, excludedIds: newExcluded }
            } else {
                const newSelected = new Set(prev.selectedIds)
                if (newSelected.has(chauffeurId)) {
                    newSelected.delete(chauffeurId)
                } else {
                    newSelected.add(chauffeurId)
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

    const columns = [
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
            cell: ({ row }: { row: TableRow<Chauffeur> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isChauffeurSelected(String(row.original.id))}
                    onChange={() => toggleChauffeurSelection(String(row.original.id))}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ({ row }) => (
                <h5 className="m-0">
                    <a href="#" className="link-reset">
                        {row.original.id}
                    </a>
                </h5>
            ),
        }),
        columnHelper.accessor('prenom', {
            header: 'Chauffeur',
            cell: ({ row }) => (
                <div className="d-flex justify-content-start align-items-center gap-2">
                    {row.original.avatar ? (
                        <div className="avatar-sm flex-shrink-0 rounded-circle overflow-hidden">
                            <img src={row.original.avatar} height={32} width={32} alt=""
                                className="img-fluid w-100 h-100 object-fit-cover" />
                        </div>
                    ) : (
                        <div className="avatar-sm flex-shrink-0">
                            <span
                                className="avatar-title text-bg-primary fw-bold rounded-circle">
                                {row.original.prenom.charAt(0)}{row.original.nom.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div>
                        <h5 className="text-nowrap fs-base mb-0 lh-base">
                            <a href="#" className="link-reset" onClick={(e) => e.preventDefault()}>
                                {row.original.prenom} {row.original.nom}
                            </a>
                        </h5>
                        <p className="text-muted fs-xs mb-0">{row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('telephone', {
            header: 'Téléphone',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <TbPhone className="fs-sm text-muted" />
                    <span className="text-nowrap">{row.original.telephone}</span>
                </div>
            ),
        }),
        columnHelper.accessor('permis_conduit', {
            header: 'Permis',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span className='text-nowrap'>{row.original.permis_conduit}</span>
                </div>
            ),
        }),
        columnHelper.accessor('type_employeur', {
            header: 'Employeur',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span className='text-nowrap'>
                        {row.original.type_employeur === 'interne' ? 'Eurofat' : (row.original.entreprise?.nom_entreprise || 'Externe')}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Date de Création',
            cell: ({ row }) => {
                // const date = new Date(row.original.created_at).toLocaleDateString()
                // const time = new Date(row.original.created_at).toLocaleTimeString()
                 const createdDate = new Date(row.original.created_at)
                const date = createdDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                const time = createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
               
                return (
                    <>
                        {date} <small className="text-muted">{time}</small>
                    </>
                )
            },
        }),
        columnHelper.accessor('status', {
            header: 'Statut',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${getStatusBadgeColor(row.original.status)} badge-label`}>
                        {row.original.status}
                    </span>
                </div>
            ),
        }),
        {
            header: 'Actions',
            cell: ({ row }: { row: TableRow<Chauffeur> }) => (
                <div className="d-flex gap-1">
                    <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => handleEditClick(row.original)}>
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

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

    const toggleDeleteModal = () => {
        setShowDeleteModal(!showDeleteModal)
    }

    const handleDelete = async () => {
        try {
            // Prepare delete payload
            const deletePayload = selectionState.selectAll
                ? {
                    select_all: true,
                    excluded_ids: Array.from(selectionState.excludedIds),
                    filters: {
                        keyword: globalFilter || undefined,
                        status: statusFilter?.value || undefined,
                        type_employeur: employerFilter?.value || undefined
                    }
                }
                : {
                    select_all: false,
                    ids: Array.from(selectionState.selectedIds)
                }

            console.log('Delete payload:', deletePayload)
            
            // TODO: Call your API with deletePayload
            // await deleteChauffeurs(deletePayload)

            // Reset selection and refresh data
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>()
            })
            setHeaderCheckState('none')
            
            queryClient.invalidateQueries({ queryKey: ["chauffeurs"] })
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
            setShowDeleteModal(false)
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const [show, toggle] = useToggle(false)
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [selectedDriver, setSelectedDriver] = useState<Chauffeur | null>(null)

    const toggleEditModal = () => {
        setShowEditModal(!showEditModal)
    }

    const handleEditClick = (driver: Chauffeur) => {
        setSelectedDriver(driver)
        toggleEditModal()
    }

    const selectedCount = getSelectedCount()

    return (
        <>
            <div className="d-flex justify-content-end mb-2">
                <Button
                    variant="secondary"
                    onClick={toggle}
                    className="btn btn-danger"
                >
                    + Ajouter Chauffeur
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

                        {/* Type Employeur Filter */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium text-dark mb-0 text-nowrap">Type Employeur</label>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder="Tous"
                                    isClearable
                                    options={[
                                        { value: 'interne', label: 'Eurofat' },
                                        { value: 'externe', label: 'Externe' },
                                    ]}
                                    value={employerFilter}
                                    onChange={(option) => {
                                        setEmployerFilter(option)
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
                                        { value: 'suspendu', label: 'Suspendu' },
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
                                        placeholder="Rechercher chauffeurs..."
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                    />
                                    <LuSearch className="app-search-icon text-muted" />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Clear Filters Button */}
                    {(globalFilter || statusFilter || employerFilter || dateFilter.length > 0) && (
                        <div className="d-flex justify-content-end mb-2 mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setGlobalFilter('')
                                    setStatusFilter(null)
                                    setEmployerFilter(null)
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
                                    <option value="suspendu">Suspendu</option>
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
                            { id: 'name', width: '180px', type: 'avatar' },
                            { id: 'phone', width: '140px', type: 'text' },
                            { id: 'permis', width: '100px', type: 'text' },
                            { id: 'employer', width: '150px', type: 'text' },
                            { id: 'date', width: '140px', type: 'text' },
                            { id: 'status', width: '100px', type: 'badge' },
                            { id: 'actions', width: '100px', type: 'actions' },
                        ]}
                    />
                ) : isError ? (
                    <div className="alert alert-danger m-3">
                        Erreur lors du chargement des chauffeurs: {error?.message}
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
                            itemsName="chauffeurs"
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
                
                <DeleteConfirmationModal
                    show={showDeleteModal}
                    onHide={toggleDeleteModal}
                    onConfirm={handleDelete}
                    selectedCount={selectedCount}
                    itemName="chauffeurs"
                />

                {/* Bulk Status Update Loading Modal */}
                <Modal centered show={bulkStatusMutation.isPending} backdrop="static" keyboard={false}>
                    <Modal.Body className="text-center py-5">
                        <div className="d-flex justify-content-center mb-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                        <h5 className="mb-2">Mise à jour du statut</h5>
                        <p className="text-muted">Mise à jour de {selectedCount} chauffeur(s) en cours...</p>
                    </Modal.Body>
                </Modal>
            </Card>
            
            <AjouterChauffeurModal 
                show={show} 
                onHide={toggle} 
                basicOptions={basicOptions}
            />
            
            <ModifierChauffeurModal 
                show={showEditModal} 
                onHide={toggleEditModal} 
                selectedDriver={selectedDriver}
                basicOptions={basicOptions}
            />
        </>
    )
}

export default DriverTableComponent