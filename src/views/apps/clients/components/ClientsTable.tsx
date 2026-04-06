'use client'

import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    type Row as TableRow,
    useReactTable,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import { Button, Card, CardFooter, CardHeader, Col, Dropdown, Form, Row } from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'
// v2 (actions column): add TbEdit, TbEye to this import
import { TbAdjustmentsFilled, TbFilter } from 'react-icons/tb'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import { French } from 'flatpickr/dist/l10n/fr.js'

import type { ClientBulkStatusFilters, ClientType } from '@/interface/gloable'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import TableSkeleton from '@/components/TableSkeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bulkUpdateClientStatus, loadClients, updateClient } from '@/services/clients'
const columnHelper = createColumnHelper<ClientType>()

type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const CLIENT_SORT_IDS = ['created_at', 'id', 'full_name', 'email', 'phone', 'type', 'status', 'city'] as const
type ClientSortId = (typeof CLIENT_SORT_IDS)[number]

const COLUMN_KEY = 'moccaz.client-table.column-visibility'
const FILTER_KEY = 'moccaz.client-table.filter-visibility'

type ClientFilterVisibility = {
    global: boolean
    date: boolean
    type: boolean
    status: boolean
    city: boolean
    par_page: boolean
}

const DEFAULT_FILTER_VISIBILITY: ClientFilterVisibility = {
    global: true,
    date: false,
    type: false,
    status: false,
    city: false,
    par_page: false,
}

const FILTER_LABELS: Record<keyof ClientFilterVisibility, string> = {
    global: 'Recherche',
    date: 'Période (création)',
    type: 'Type',
    status: 'Statut',
    city: 'Ville',
    par_page: 'Par page',
}

const OPTIONAL_FILTER_ORDER = ['date', 'type', 'status', 'city', 'par_page'] as const satisfies readonly (
    keyof ClientFilterVisibility
)[]

const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
    select: true,
    id: true,
    full_name: true,
    email: true,
    phone: true,
    website: false,
    city: true,
    type: true,
    status: true,
    created_at: false,
    // v2: actions column — set back to true when restoring the Actions column
    // actions: true,
    actions: false,
}

// v2: include 'actions' when restoring the Actions column
const LOCKED_COLUMNS = new Set<string>(['id' /* , 'actions' */])

const COLUMN_LABELS: Record<string, string> = {
    select: 'Sélection',
    id: 'ID',
    full_name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    website: 'Site web',
    city: 'Ville',
    type: 'Type',
    status: 'Statut',
    created_at: 'Créé le',
    // v2: actions column
    // actions: 'Actions',
}

const OPTIONAL_COLUMN_ORDER = [
    'select',
    'full_name',
    'email',
    'phone',
    'website',
    'city',
    'type',
    'status',
    'created_at',
] as const

type SkeletonCol = { id: string; width: string; type: 'checkbox' | 'text' | 'badge' | 'actions' }

const SKELETON_COLUMNS: SkeletonCol[] = [
    { id: 'select', width: '40px', type: 'checkbox' },
    { id: 'id', width: '56px', type: 'text' },
    { id: 'full_name', width: '160px', type: 'text' },
    { id: 'email', width: '180px', type: 'text' },
    { id: 'phone', width: '120px', type: 'text' },
    { id: 'website', width: '120px', type: 'text' },
    { id: 'city', width: '140px', type: 'text' },
    { id: 'type', width: '100px', type: 'badge' },
    { id: 'status', width: '140px', type: 'text' },
    { id: 'created_at', width: '120px', type: 'text' },
    // v2: actions column skeleton
    // { id: 'actions', width: '100px', type: 'actions' },
]

const formatDateToISO = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const typeLabel = (t: number) => (t === 2 ? 'Partenaire' : 'Particulier')

/** Matches API: 1 actif, 0 désactivé */
const CLIENT_STATUS_SELECT_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: 'Actif' },
    { value: 0, label: 'Désactivé' },
]

const typeBadgeClass = (t: number) =>
    t === 2 ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'

function parseStoredVisibility(raw: string | null, fallback: VisibilityState): VisibilityState {
    if (!raw) return { ...fallback }
    try {
        const parsed = JSON.parse(raw) as Record<string, boolean>
        const next = { ...fallback }
        for (const key of Object.keys(fallback)) {
            if (key in parsed) next[key] = Boolean(parsed[key])
        }
        next.id = true
        // v2: actions column
        // next.actions = true
        return next
    } catch {
        return { ...fallback }
    }
}

const ClientsTableComponent = () => {
    const queryClient = useQueryClient()

    const [keyword, setKeyword] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [typeFilter, setTypeFilter] = useState<{ value: number; label: string } | null>(null)
    const [statusFilter, setStatusFilter] = useState<{ value: number; label: string } | null>(null)
    const [dateFilter, setDateFilter] = useState<Date[]>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })

    const [selectionState, setSelectionState] = useState<SelectionState>({
        selectAll: false,
        selectedIds: new Set<string>(),
        excludedIds: new Set<string>(),
    })
    const [headerCheckState, setHeaderCheckState] = useState<'none' | 'page' | 'all'>('none')

    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState<ClientType | null>(null)

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({
        ...DEFAULT_COLUMN_VISIBILITY,
    }))
    const [filterVisibility, setFilterVisibility] = useState<ClientFilterVisibility>(() => ({
        ...DEFAULT_FILTER_VISIBILITY,
    }))

    const sortByRaw = sorting[0]?.id
    const sort_by: ClientSortId = CLIENT_SORT_IDS.includes(sortByRaw as ClientSortId)
        ? (sortByRaw as ClientSortId)
        : 'created_at'
    const sort_order = sorting.length > 0 ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : 'desc'

    /** Range mode: only send dates to the API once start and end are both chosen. */
    const creationPeriodComplete = dateFilter.length >= 2
    const appliedCreationPeriodKey = useMemo(
        () =>
            creationPeriodComplete
                ? `${formatDateToISO(dateFilter[0])}|${formatDateToISO(dateFilter[1])}`
                : '',
        [creationPeriodComplete, dateFilter],
    )

    const apiParams = useMemo(
        () => ({
            per_page: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by,
            sort_order,
            keyword: keyword.trim() || undefined,
            type: typeFilter?.value,
            status: statusFilter?.value,
            city_name: cityFilter.trim() || undefined,
            from: creationPeriodComplete ? formatDateToISO(dateFilter[0]) : undefined,
            to: creationPeriodComplete ? formatDateToISO(dateFilter[1]) : undefined,
        }),
        [
            pagination.pageSize,
            pagination.pageIndex,
            sort_by,
            sort_order,
            keyword,
            typeFilter,
            statusFilter,
            cityFilter,
            dateFilter,
            creationPeriodComplete,
        ],
    )

    const { data: clientResponse, isLoading, isError, error } = useQuery({
        queryKey: ['clients', apiParams],
        queryFn: () => loadClients(apiParams),
        staleTime: 30_000,
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: number }) => updateClient(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        },
    })

    const bulkListFilters = useMemo((): ClientBulkStatusFilters | undefined => {
        const f: ClientBulkStatusFilters = {}
        const kw = keyword.trim()
        if (kw) f.keyword = kw
        if (typeFilter != null) f.type = typeFilter.value
        if (statusFilter != null) f.status = statusFilter.value
        const cityName = cityFilter.trim()
        if (cityName) f.city_name = cityName
        if (creationPeriodComplete) {
            f.from = formatDateToISO(dateFilter[0])
            f.to = formatDateToISO(dateFilter[1])
        }
        return Object.keys(f).length > 0 ? f : undefined
    }, [keyword, typeFilter, statusFilter, cityFilter, dateFilter, creationPeriodComplete])

    const bulkStatusMutation = useMutation({
        mutationFn: bulkUpdateClientStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>(),
            })
            setHeaderCheckState('none')
        },
    })

    const data = useMemo(() => clientResponse?.data ?? [], [clientResponse])
    const totalItems = clientResponse?.pagination?.total ?? 0
    const start = clientResponse?.pagination?.from ?? 0
    const end = clientResponse?.pagination?.to ?? 0

    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>(),
        })
        setHeaderCheckState('none')
    }, [keyword, cityFilter, typeFilter, statusFilter, appliedCreationPeriodKey])

    useEffect(() => {
        setColumnVisibility(parseStoredVisibility(localStorage.getItem(COLUMN_KEY), DEFAULT_COLUMN_VISIBILITY))
    }, [])

    const persistColumns = (next: VisibilityState) => {
        try {
            localStorage.setItem(
                COLUMN_KEY,
                // v2: add actions: true when restoring Actions column
                JSON.stringify({ ...next, id: true }),
            )
        } catch {
            /* ignore */
        }
    }

    const persistFilters = (next: ClientFilterVisibility) => {
        try {
            localStorage.setItem(FILTER_KEY, JSON.stringify({ ...next, global: true }))
        } catch {
            /* ignore */
        }
    }

    useEffect(() => {
        try {
            const raw = localStorage.getItem(FILTER_KEY)
            if (!raw) return
            const p = JSON.parse(raw) as Partial<ClientFilterVisibility>
            setFilterVisibility((prev) => ({ ...prev, ...p, global: true }))
        } catch {
            /* ignore */
        }
    }, [])

    const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
        setColumnVisibility((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            // v2: add actions: true when restoring Actions column
            const locked = { ...next, id: true }
            persistColumns(locked)
            return locked
        })
    }

    const toggleOptionalColumn = (columnId: string) => {
        if (LOCKED_COLUMNS.has(columnId)) return
        setColumnVisibility((prev) => {
            // v2: add actions: true when restoring Actions column
            const locked = { ...prev, [columnId]: !prev[columnId], id: true }
            persistColumns(locked)
            return locked
        })
    }

    const toggleOptionalFilter = (fid: keyof ClientFilterVisibility) => {
        if (fid === 'global') return
        setFilterVisibility((prev) => {
            const next = { ...prev, [fid]: !prev[fid], global: true }
            persistFilters(next)
            return next
        })
    }

    const currentPageIds = useMemo(() => data.map((row) => String(row.id)), [data])

    const isClientSelected = (clientId: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(clientId)
        }
        return selectionState.selectedIds.has(clientId)
    }

    const getSelectedCount = (): number => {
        if (selectionState.selectAll) {
            return totalItems - selectionState.excludedIds.size
        }
        return selectionState.selectedIds.size
    }

    const areAllCurrentPageSelected = (): boolean =>
        currentPageIds.length > 0 && currentPageIds.every((id) => isClientSelected(id))

    const areSomeCurrentPageSelected = (): boolean =>
        currentPageIds.some((id) => isClientSelected(id)) && !areAllCurrentPageSelected()

    const toggleClientSelection = (clientId: string) => {
        setSelectionState((prev) => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(clientId)) {
                    newExcluded.delete(clientId)
                } else {
                    newExcluded.add(clientId)
                }
                return { ...prev, excludedIds: newExcluded }
            }
            const newSelected = new Set(prev.selectedIds)
            if (newSelected.has(clientId)) {
                newSelected.delete(clientId)
            } else {
                newSelected.add(clientId)
            }
            return { ...prev, selectedIds: newSelected }
        })
        setHeaderCheckState('none')
    }

    const handleHeaderCheckboxClick = () => {
        if (headerCheckState === 'none' || !areAllCurrentPageSelected()) {
            setSelectionState((prev) => {
                const newSelected = new Set(prev.selectedIds)
                currentPageIds.forEach((id) => newSelected.add(id))
                return {
                    selectAll: false,
                    selectedIds: newSelected,
                    excludedIds: new Set<string>(),
                }
            })
            setHeaderCheckState('page')
        } else if (headerCheckState === 'page' && areAllCurrentPageSelected()) {
            setSelectionState({
                selectAll: true,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>(),
            })
            setHeaderCheckState('all')
        } else if (headerCheckState === 'all') {
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>(),
            })
            setHeaderCheckState('none')
        }
    }

    const selectedCount = getSelectedCount()

    const runBulkStatusUpdate = (status: 0 | 1) => {
        if (selectedCount < 1) return
        if (selectionState.selectAll) {
            bulkStatusMutation.mutate({
                status,
                select_all: true,
                excluded_ids: Array.from(selectionState.excludedIds, (id) => Number(id)),
                ...(bulkListFilters ? { filters: bulkListFilters } : {}),
            })
        } else {
            bulkStatusMutation.mutate({
                status,
                select_all: false,
                ids: Array.from(selectionState.selectedIds, (id) => Number(id)),
            })
        }
    }

    const visibleSkeletonColumns = useMemo(
        () => SKELETON_COLUMNS.filter((c) => columnVisibility[c.id] !== false),
        [columnVisibility],
    )

    const columns: ColumnDef<ClientType, any>[] = [
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
                            input.indeterminate =
                                !selectionState.selectAll && areSomeCurrentPageSelected()
                        }
                    }}
                    onChange={handleHeaderCheckboxClick}
                />
            ),
            cell: ({ row }: { row: TableRow<ClientType> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isClientSelected(String(row.original.id))}
                    onChange={() => toggleClientSelection(String(row.original.id))}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            id: 'id',
            header: 'ID',
            cell: ({ row }) => <span className="fw-medium text-nowrap">{row.original.id}</span>,
        }),
        columnHelper.accessor('full_name', {
            id: 'full_name',
            header: 'Nom',
            cell: ({ row }) => (
                <span className="fw-medium">{row.original.full_name || '—'}</span>
            ),
        }),
        columnHelper.accessor('email', {
            id: 'email',
            header: 'Email',
            cell: ({ row }) => <span className="text-truncate d-inline-block max-w-200">{row.original.email}</span>,
        }),
        columnHelper.accessor('phone', {
            id: 'phone',
            header: 'Téléphone',
            cell: ({ row }) => row.original.phone ?? '—',
        }),
        columnHelper.accessor('website', {
            id: 'website',
            header: 'Site web',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-200">{row.original.website ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('city', {
            id: 'city',
            header: 'Ville',
            cell: ({ row }) => {
                const name = row.original.ville?.name?.trim()
                if (name)
                    return <span className="text-truncate d-inline-block max-w-200">{name}</span>
                return row.original.city != null ? (
                    <span className="text-muted" title="ID ville sans libellé chargé">
                        #{row.original.city}
                    </span>
                ) : (
                    '—'
                )
            },
        }),
        columnHelper.accessor('type', {
            id: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <span className={`badge ${typeBadgeClass(row.original.type)} badge-label`}>
                    {typeLabel(row.original.type)}
                </span>
            ),
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Statut',
            enableSorting: false,
            cell: ({ row }) => {
                const id = row.original.id
                const current = row.original.status
                const selected =
                    CLIENT_STATUS_SELECT_OPTIONS.find((o) => o.value === current) ??
                    CLIENT_STATUS_SELECT_OPTIONS[0]
                const busy = statusMutation.isPending && statusMutation.variables?.id === id

                return (
                    <div style={{ minWidth: 130 }} className="client-table-status-select">
                        <Select
                            className="react-select react-select-sm"
                            classNamePrefix="react-select"
                            isSearchable={false}
                            isClearable={false}
                            isDisabled={busy}
                            isLoading={busy}
                            menuPlacement="auto"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 1056 }),
                                control: (base) => ({ ...base, minHeight: 32, fontSize: 13 }),
                                valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                            }}
                            options={CLIENT_STATUS_SELECT_OPTIONS}
                            value={selected}
                            onChange={(opt) => {
                                if (!opt || opt.value === current) return
                                statusMutation.mutate({ id, status: opt.value })
                            }}
                        />
                    </div>
                )
            },
        }),
        columnHelper.accessor('created_at', {
            id: 'created_at',
            header: 'Créé le',
            cell: ({ row }) => {
                const d = new Date(row.original.created_at)
                return (
                    <>
                        {d.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}{' '}
                        <small className="text-muted">
                            {d.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </small>
                    </>
                )
            },
        }),
        /* v2 — Actions column (view / edit). Restore: uncomment block, re-enable TbEdit/TbEye import,
           set DEFAULT_COLUMN_VISIBILITY.actions / LOCKED_COLUMNS / COLUMN_LABELS / skeleton / persist / dropdown. */
        // {
        //     id: 'actions',
        //     header: 'Actions',
        //     enableSorting: false,
        //     cell: ({ row }: { row: TableRow<ClientType> }) => (
        //         <div className="d-flex gap-1">
        //             <Button
        //                 variant="light"
        //                 size="sm"
        //                 className="btn-icon rounded-circle"
        //                 onClick={() => {
        //                     setSelectedClient(row.original)
        //                     setShowViewModal(true)
        //                 }}
        //                 title="Voir"
        //             >
        //                 <TbEye className="fs-lg" />
        //             </Button>
        //             <Button
        //                 variant="light"
        //                 size="sm"
        //                 className="btn-icon rounded-circle"
        //                 onClick={() => {
        //                     setSelectedClient(row.original)
        //                     setShowEditModal(true)
        //                 }}
        //                 title="Modifier"
        //             >
        //                 <TbEdit className="fs-lg" />
        //             </Button>
        //         </div>
        //     ),
        // },
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            },
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: clientResponse?.pagination?.last_page ?? 0,
    })

    const hasActiveFilters =
        keyword.trim() ||
        typeFilter ||
        statusFilter ||
        cityFilter.trim() ||
        creationPeriodComplete

    return (
        <>
            {/* <div className="d-flex justify-content-end mb-2">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    + Nouveau client
                </Button>
            </div> */}

            <Card className="mb-3 border-light shadow-sm">
                <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                        <span className="fw-semibold text-dark">Filtres</span>
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="btn-icon rounded-circle"
                                id="client-filter-visibility-toggle"
                                aria-label="Choisir les filtres affichés"
                            >
                                <TbFilter className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 280 }}>
                                <div className="fw-semibold small text-dark mb-2">Filtres affichés</div>
                                <Form.Check
                                    id="client-filter-global"
                                    type="checkbox"
                                    className="mb-2"
                                    label={FILTER_LABELS.global}
                                    checked
                                    disabled
                                />
                                <hr className="my-2" />
                                {OPTIONAL_FILTER_ORDER.map((fid) => (
                                    <Form.Check
                                        key={fid}
                                        id={`client-filter-opt-${fid}`}
                                        type="checkbox"
                                        className="mb-2"
                                        label={FILTER_LABELS[fid]}
                                        checked={filterVisibility[fid] === true}
                                        onChange={() => toggleOptionalFilter(fid)}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {(filterVisibility.date ||
                        filterVisibility.type ||
                        filterVisibility.status ||
                        filterVisibility.city ||
                        filterVisibility.par_page) && (
                        <Row className="g-3">
                            {filterVisibility.date && (
                                <Col xs={12} sm={6} lg={4}>
                                    <label className="fw-medium mb-0 text-dark d-block">Période (création)</label>
                                    <Flatpickr
                                        className="form-control mt-2"
                                        placeholder="Plage de dates (du — au)"
                                        value={dateFilter}
                                        onChange={(dates) => {
                                            setDateFilter(dates)
                                            // Ne pas réinitialiser la page tant que la plage n'est pas complète (2 dates).
                                            if (dates.length === 0 || dates.length >= 2) {
                                                setPagination((p) => ({ ...p, pageIndex: 0 }))
                                            }
                                        }}
                                        options={{
                                            dateFormat: 'd M, Y',
                                            mode: 'range',
                                            locale: French,
                                            monthSelectorType: 'dropdown',
                                        }}
                                    />
                                    <small className="text-muted">Les deux dates sont nécessaires pour filtrer.</small>
                                </Col>
                            )}
                            {filterVisibility.type && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Type</label>
                                    <Select
                                        className="react-select mt-2"
                                        classNamePrefix="react-select"
                                        placeholder="Tous"
                                        isClearable
                                        options={[
                                            { value: 1, label: 'Particulier' },
                                            { value: 2, label: 'Partenaire' },
                                        ]}
                                        value={typeFilter}
                                        onChange={(o) => {
                                            setTypeFilter(o)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.status && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Statut</label>
                                    <Select
                                        className="react-select mt-2"
                                        classNamePrefix="react-select"
                                        placeholder="Tous"
                                        isClearable
                                        options={[
                                            { value: 1, label: 'Actif' },
                                            { value: 0, label: 'Désactivé' },
                                        ]}
                                        value={statusFilter}
                                        onChange={(o) => {
                                            setStatusFilter(o)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.city && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Ville (nom)</label>
                                    <Form.Control
                                        className="mt-2"
                                        type="text"
                                        placeholder="Recherche par nom de ville…"
                                        value={cityFilter}
                                        onChange={(e) => {
                                            setCityFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.par_page && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Par page</label>
                                    <Select
                                        className="react-select mt-2"
                                        classNamePrefix="react-select"
                                        options={[
                                            { value: 5, label: '5' },
                                            { value: 10, label: '10' },
                                            { value: 15, label: '15' },
                                            { value: 25, label: '25' },
                                            { value: 50, label: '50' },
                                        ]}
                                        value={{
                                            value: pagination.pageSize,
                                            label: String(pagination.pageSize),
                                        }}
                                        onChange={(option) => {
                                            if (option) {
                                                setPagination({ pageIndex: 0, pageSize: option.value as number })
                                            }
                                        }}
                                    />
                                </Col>
                            )}
                        </Row>
                    )}

                    {filterVisibility.global && (
                        <Row className={hasActiveFilters ? 'mt-2' : 'mt-0'}>
                            <Col xs={12} md={8} lg={6}>
                                <label className="d-block fw-semibold text-dark mb-2">Recherche</label>
                                <div className="app-search">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nom, email, téléphone…"
                                        value={keyword}
                                        onChange={(e) => {
                                            setKeyword(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                    <LuSearch className="app-search-icon text-muted" />
                                </div>
                            </Col>
                        </Row>
                    )}

                    {hasActiveFilters && (
                        <div className="d-flex justify-content-end mb-2 mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="btn-danger"
                                style={{ fontSize: '13px' }}
                                onClick={() => {
                                    setKeyword('')
                                    setCityFilter('')
                                    setTypeFilter(null)
                                    setStatusFilter(null)
                                    setDateFilter([])
                                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                                }}
                            >
                                ✕ Réinitialiser les filtres
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <CardHeader className="border-light">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap w-100">
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                            {selectedCount > 0 && (
                                <>
                                    <span className="badge bg-primary-subtle text-primary">
                                        {selectionState.selectAll
                                            ? `Tous (${selectedCount})`
                                            : selectedCount}{' '}
                                        sélectionné(s)
                                    </span>
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            variant="outline-primary"
                                            size="sm"
                                            id="client-bulk-status-dropdown"
                                            disabled={bulkStatusMutation.isPending}
                                        >
                                            {bulkStatusMutation.isPending
                                                ? 'Mise à jour…'
                                                : 'Statut groupé'}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                onClick={() => runBulkStatusUpdate(1)}
                                                disabled={bulkStatusMutation.isPending}
                                            >
                                                Marquer actif
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => runBulkStatusUpdate(0)}
                                                disabled={bulkStatusMutation.isPending}
                                            >
                                                Marquer désactivé
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            )}
                        </div>
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="btn-icon rounded-circle"
                                id="client-table-columns-toggle"
                                aria-label="Colonnes affichées"
                            >
                                <TbAdjustmentsFilled className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 260 }}>
                                <div className="fw-semibold small text-dark mb-2">Colonnes</div>
                                <div className="text-muted fs-xxs text-uppercase mb-1">Toujours affichées</div>
                                {/* v2: add 'actions' to the tuple when restoring Actions column */}
                                {(['id'] as const).map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        id={`client-col-locked-${colId}`}
                                        type="checkbox"
                                        className="mb-2"
                                        label={COLUMN_LABELS[colId] ?? colId}
                                        checked
                                        disabled
                                    />
                                ))}
                                <hr className="my-2" />
                                <div className="text-muted fs-xxs text-uppercase mb-1">Optionnelles</div>
                                {OPTIONAL_COLUMN_ORDER.map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        id={`client-col-opt-${colId}`}
                                        type="checkbox"
                                        className="mb-2"
                                        label={COLUMN_LABELS[colId] ?? colId}
                                        checked={columnVisibility[colId] === true}
                                        onChange={() => toggleOptionalColumn(colId)}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </CardHeader>

                {isLoading ? (
                    <TableSkeleton rows={pagination.pageSize} columns={visibleSkeletonColumns} />
                ) : isError ? (
                    <div className="alert alert-danger m-3">
                        Erreur lors du chargement des clients: {error?.message}
                    </div>
                ) : (
                    <DataTable<ClientType> table={table} emptyMessage="Aucun client" />
                )}

                {data.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="clients"
                            showInfo
                            previousPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                            }
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={clientResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination((p) => ({ ...p, pageIndex: index }))}
                            nextPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                            }
                            canNextPage={
                                pagination.pageIndex < (clientResponse?.pagination?.last_page ?? 1) - 1
                            }
                        />
                    </CardFooter>
                )}
            </Card>
        </>
    )
}

export default ClientsTableComponent

