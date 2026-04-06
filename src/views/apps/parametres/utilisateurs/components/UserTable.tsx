import DataTable from '@/components/table/DataTable'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import TablePagination from '@/components/table/TablePagination'
import { loadutilisateurs, updateUsersBulkStatus } from '@/services/ustilisateur'
import { loadprofiles } from '@/services/profile'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toPascalCase } from '@/helpers/casing'
import AjouterUserModal from './Modals/Ajouter_User_modal'
import ModifierUserModal from './Modals/Modifier_User_modal'
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
    CardHeader,
    Modal,
    Row,
    Col,
} from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'
import { TbEdit } from 'react-icons/tb'
import { useToggle } from 'usehooks-ts'
import type { Profile, User } from '@/interface/gloable'
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

const columnHelper = createColumnHelper<User>()

const UserTable = () => {
    const queryClient = useQueryClient()
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [selectedProfile, setSelectedProfile] = useState<{ value: string; label: string } | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<{ value: string; label: string } | null>(null)
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

    // Fetch all profiles for the dropdown
    const { data: profilesResponse, isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['profiles', 'all'],
        queryFn: () => loadprofiles({ paginated: false }),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const profiles = profilesResponse?.data || []

    const rawSortId = sorting[0]?.id || 'created_at'
    const sort_by =
        rawSortId === 'select'
            ? 'created_at'
            : rawSortId === 'profile'
              ? 'id_profile'
              : rawSortId

    // Prepare API parameters (ListUtilisateurDto / IndexUtilisateurRequest)
    const apiParams = useMemo(() => ({
        paginated: true,
        per_page: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by,
        sort_order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
        keyword: globalFilter || undefined,
        id_profile: selectedProfile?.value ? Number(selectedProfile.value) : undefined,
        statut: selectedStatus?.value || undefined,
        ...(dateFilter.length >= 2
            ? { from: formatDateToISO(dateFilter[0]), to: formatDateToISO(dateFilter[1]) }
            : {}),
    }), [
        pagination.pageSize,
        pagination.pageIndex,
        sorting,
        sort_by,
        globalFilter,
        selectedProfile,
        selectedStatus,
        dateFilter,
    ])

    // Fetch data with React Query
    const { data: apiResponse, isLoading, isError, error } = useQuery({
        queryKey: ['utilisateurs', apiParams],
        queryFn: () => loadutilisateurs(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => {
        if (!apiResponse?.data) return [] as User[]
        return apiResponse.data.map(
            (user): User => ({
                ...user,
                nom: user.nom ?? '',
                prenom: user.prenom ?? '',
                telephone: user.telephone ?? '',
                statut: user.statut ?? 'actif',
                profile: user.profile ?? {
                    id: user.id_profile ?? 0,
                    nom: '',
                    libelle: '',
                    statut: '',
                    created_at: '',
                    updated_at: '',
                },
            })
        )
    }, [apiResponse])

    const totalItems = apiResponse?.pagination?.total ?? 0
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
                        id_profile: selectedProfile?.value ? Number(selectedProfile.value) : undefined,
                        statut: selectedStatus?.value || undefined,
                        ...(dateFilter.length >= 2
                            ? { from: formatDateToISO(dateFilter[0]), to: formatDateToISO(dateFilter[1]) }
                            : {}),
                    },
                    statut: newStatus
                }
                : {
                    select_all: false,
                    ids: Array.from(selectionState.selectedIds),
                    statut: newStatus
                }
            return updateUsersBulkStatus(payload)
        },
        onSuccess: () => {
            // Invalidate and refetch users
            queryClient.invalidateQueries({ queryKey: ["utilisateurs"] })
            
            // Reset pagination to first page
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
            
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
    }, [globalFilter, selectedProfile, selectedStatus, dateFilter])

    // Calculate current page user IDs
    const currentPageIds = useMemo(() => {
        return data.map(user => String(user.id))
    }, [data])

    // Check if a user is selected
    const isUserSelected = (userId: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(userId)
        }
        return selectionState.selectedIds.has(userId)
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
        return currentPageIds.length > 0 && currentPageIds.every(id => isUserSelected(id))
    }

    // Check if some (but not all) current page items are selected
    const areSomeCurrentPageSelected = (): boolean => {
        return currentPageIds.some(id => isUserSelected(id)) && !areAllCurrentPageSelected()
    }

    // Toggle individual user selection
    const toggleUserSelection = (userId: string) => {
        setSelectionState(prev => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(userId)) {
                    newExcluded.delete(userId)
                } else {
                    newExcluded.add(userId)
                }
                return { ...prev, excludedIds: newExcluded }
            } else {
                const newSelected = new Set(prev.selectedIds)
                if (newSelected.has(userId)) {
                    newSelected.delete(userId)
                } else {
                    newSelected.add(userId)
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

    const columns: ColumnDef<User, any>[] = [
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
            cell: ({ row }: { row: TableRow<User> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isUserSelected(String(row.original.id))}
                    onChange={() => toggleUserSelection(String(row.original.id))}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            cell: ({ row }) => (
                <h5 className="m-0">
                    <a href="#" className="link-reset">
                        {row.original.id}
                    </a>
                </h5>
            ),
        }),
        columnHelper.accessor('nom', {
            header: 'Utilisateur',
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    {row.original.avatar ? (
                        <div className="avatar-sm flex-shrink-0 rounded-circle overflow-hidden">
                            <img src={row.original.avatar} height={32} width={32} alt=""
                                className="img-fluid w-100 h-100 object-fit-cover" />
                        </div>
                    ) : (
                        <div className="avatar-sm flex-shrink-0">
                            <span
                                className="avatar-title text-bg-primary fw-bold rounded-circle">
                                {(row.original.prenom?.[0] ?? '?').toUpperCase()}
                                {(row.original.nom?.[0] ?? '?').toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <h5 className="fs-base mb-0">
                            <a data-sort="user" href="#" className="link-reset">
                                {row.original.nom} {row.original.prenom}
                            </a>
                        </h5>
                        <p className="text-muted fs-xs mb-0"> {row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('telephone', {
            header: 'Telephone',
            cell: ({ row }) => (
                <p className=" fs-xs mb-0"> {row.original.telephone}</p>
            ),
        }),
        columnHelper.accessor('profile',
            {
                header: 'profile',
                filterFn: 'equalsString', enableColumnFilter: true,
                cell: ({ row }) => (
                    <p className=" fs-xs mb-0">
                        {row.original.profile?.nom || row.original.profile?.libelle || '—'}
                    </p>
                ),
            }),
        columnHelper.accessor('created_at', {
            header: 'Date de Creation',
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
        columnHelper.accessor('statut', {
            header: 'Statut',
            filterFn: 'equalsString',
            enableColumnFilter: true,
            cell: ({ row }) => (
                <span
                    className={`badge ${row.original.statut === 'suspendu' ? 'bg-danger-subtle text-danger' : row.original.statut === 'inactif' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} badge-label`}>
                    {toPascalCase(row.original.statut)}
                </span>
            ),
        }),
        {
            header: 'Actions',
            cell: ({ row }: { row: TableRow<User> }) => (
                <div className="d-flex  gap-1">
                    <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => {
                        toggleEditModal()
                        setSelectedUser(row.original)
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
                        profile_id: selectedProfile?.value || undefined,
                        status: selectedStatus?.value || undefined
                    }
                }
                : {
                    select_all: false,
                    ids: Array.from(selectionState.selectedIds)
                }

            console.log('Delete payload:', deletePayload)
            
            // TODO: Call your API with deletePayload
            // await deleteUsers(deletePayload)

            // Reset selection and refresh data
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>()
            })
            setHeaderCheckState('none')
            
            queryClient.invalidateQueries({ queryKey: ["utilisateurs"] })
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
            setShowDeleteModal(false)
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const [show, toggle] = useToggle(false)
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const toggleEditModal = () => {
        setShowEditModal(!showEditModal)
    }

    const selectedCount = getSelectedCount()

    // Convert profiles to react-select options
    const profileOptions = useMemo(() => 
        profiles.map((profile: Profile) => ({
            value: String(profile.id),
            label: profile.nom
        })),
        [profiles]
    )

    return (
        <>
            <div className="d-flex justify-content-end mb-2">
                <Button
                    onClick={toggle}
                    className="btn btn-primary"
                >
                    + Ajouter Utilisateur
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

                        {/* Profile Filter */}
                        <Col xs={12} sm={6} lg={3}>
                            <div className="d-flex flex-column gap-2">
                                <label className="fw-medium text-dark mb-0 text-nowrap">Profile</label>
                                <Select
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    placeholder="Tous"
                                    isClearable
                                    isLoading={isLoadingProfiles}
                                    options={profileOptions}
                                    value={selectedProfile}
                                    onChange={(option) => {
                                        setSelectedProfile(option)
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
                                    value={selectedStatus}
                                    onChange={(option) => {
                                        setSelectedStatus(option)
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
                                        placeholder="Rechercher utilisateurs..."
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                    />
                                    <LuSearch className="app-search-icon text-muted" />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {/* Clear Filters Button */}
                    {(globalFilter || selectedProfile || selectedStatus || dateFilter.length > 0) && (
                        <div className="d-flex justify-content-end mb-2 mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setGlobalFilter('')
                                    setSelectedProfile(null)
                                    setSelectedStatus(null)
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
                            { id: 'nom', width: '180px', type: 'avatar' },
                            { id: 'telephone', width: '140px', type: 'text' },
                            { id: 'profile', width: '140px', type: 'text' },
                            { id: 'date', width: '140px', type: 'text' },
                            { id: 'statut', width: '100px', type: 'badge' },
                            { id: 'actions', width: '100px', type: 'actions' },
                        ]}
                    />
                ) : isError ? (
                    <div className="alert alert-danger m-3">
                        Erreur lors du chargement des utilisateurs: {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                ) : (
                    <DataTable<User> table={table} emptyMessage="Aucun enregistrement trouvé" />
                )}
                {table.getRowModel().rows.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="utilisateurs"
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
                    itemName="utilisateurs"
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
                        <p className="text-muted">Mise à jour de {selectedCount} utilisateur(s) en cours...</p>
                    </Modal.Body>
                </Modal>
            </Card>

            <AjouterUserModal
                show={show}
                onHide={toggle}
                profiles={profiles}
                isLoadingProfiles={isLoadingProfiles}
            />

            <ModifierUserModal
                show={showEditModal}
                onHide={toggleEditModal}
                selectedUser={selectedUser}
                profiles={profiles}
                isLoadingProfiles={isLoadingProfiles}
            />
        </>
    )
}
export default UserTable