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
import { TbAdjustmentsFilled, TbEdit, TbFilter } from 'react-icons/tb'
import Select from 'react-select'

import type { Depot } from '@/interface/gloable'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import TableSkeleton from '@/components/TableSkeleton'
import { useQuery } from '@tanstack/react-query'
import { loadDepots } from '@/services/depot'
import EditDepotModal from '@/views/apps/depot/components/Modals/EditDepotModal'
import AddDepotModal from '@/views/apps/depot/components/Modals/AddDepotModal'
import Flatpickr from 'react-flatpickr'
import { French } from 'flatpickr/dist/l10n/fr.js'

const columnHelper = createColumnHelper<Depot>()

type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const DEPOT_SORT_IDS = ['created_at', 'name', 'type', 'id'] as const
type DepotSortId = (typeof DEPOT_SORT_IDS)[number]

const DEPOT_TABLE_COLUMN_VISIBILITY_KEY = 'conexus.depot-table.column-visibility'
const DEPOT_TABLE_FILTER_VISIBILITY_KEY = 'conexus.depot-table.filter-visibility'

type DepotFilterVisibilityState = {
    name: boolean
    type: boolean
    date: boolean
    par_page: boolean
}

const DEFAULT_DEPOT_FILTER_VISIBILITY: DepotFilterVisibilityState = {
    name: true,
    type: false,
    date: false,
    par_page: false,
}

const DEPOT_LOCKED_FILTER_IDS = new Set<keyof DepotFilterVisibilityState>(['name'])

const DEPOT_FILTER_LABELS: Record<keyof DepotFilterVisibilityState, string> = {
    name: 'Nom du dépôt',
    type: 'Type',
    date: 'Date de création',
    par_page: 'Par page',
}

const DEPOT_OPTIONAL_FILTER_ORDER = ['type', 'date', 'par_page'] as const satisfies readonly (
    keyof DepotFilterVisibilityState
)[]

const DEFAULT_DEPOT_COLUMN_VISIBILITY: VisibilityState = {
    select: false,
    id: true,
    name: true,
    type: true,
    created_by: false,
    created_at: true,
    actions: true,
}

const DEPOT_LOCKED_COLUMN_IDS = new Set<string>(['id', 'actions'])

const DEPOT_COLUMN_LABELS: Record<string, string> = {
    select: 'Sélection',
    id: 'ID',
    name: 'Nom',
    type: 'Type',
    created_by: 'Créé par',
    created_at: 'Créé le',
    actions: 'Actions',
}

const DEPOT_OPTIONAL_COLUMN_ORDER = ['select', 'name', 'type', 'created_by', 'created_at'] as const

type DepotSkeletonCol = { id: string; width: string; type: 'checkbox' | 'text' | 'actions' }

const DEPOT_SKELETON_COLUMNS: DepotSkeletonCol[] = [
    { id: 'select', width: '40px', type: 'checkbox' },
    { id: 'id', width: '56px', type: 'text' },
    { id: 'name', width: '160px', type: 'text' },
    { id: 'type', width: '120px', type: 'text' },
    { id: 'created_by', width: '80px', type: 'text' },
    { id: 'created_at', width: '120px', type: 'text' },
    { id: 'actions', width: '70px', type: 'actions' },
]

function parseStoredColumnVisibility(raw: string | null): VisibilityState {
    if (!raw) {
        return { ...DEFAULT_DEPOT_COLUMN_VISIBILITY }
    }
    try {
        const parsed = JSON.parse(raw) as Record<string, boolean>
        const next: VisibilityState = { ...DEFAULT_DEPOT_COLUMN_VISIBILITY }
        for (const key of Object.keys(DEFAULT_DEPOT_COLUMN_VISIBILITY)) {
            if (key in parsed) {
                next[key] = Boolean(parsed[key])
            }
        }
        next.id = true
        next.actions = true
        return next
    } catch {
        return { ...DEFAULT_DEPOT_COLUMN_VISIBILITY }
    }
}

const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const formatDateTimeFr = (value: string | null | undefined) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    const date = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
    const time = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
    return (
        <>
            {date} <small className="text-muted">{time}</small>
        </>
    )
}

const DepotTableComponent = () => {
    const [nameFilter, setNameFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [dateFilter, setDateFilter] = useState<Date[]>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })

    const [selectionState, setSelectionState] = useState<SelectionState>({
        selectAll: false,
        selectedIds: new Set<string>(),
        excludedIds: new Set<string>(),
    })
    const [headerCheckState, setHeaderCheckState] = useState<'none' | 'page' | 'all'>('none')

    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({
        ...DEFAULT_DEPOT_COLUMN_VISIBILITY,
    }))

    const [filterVisibility, setFilterVisibility] = useState<DepotFilterVisibilityState>(() => ({
        ...DEFAULT_DEPOT_FILTER_VISIBILITY,
    }))

    const sortByRaw = sorting[0]?.id
    const sort_by: DepotSortId = DEPOT_SORT_IDS.includes(sortByRaw as DepotSortId)
        ? (sortByRaw as DepotSortId)
        : 'created_at'
    const sort_order =
        sorting.length > 0 ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : 'desc'

    const apiParams = useMemo(
        () => ({
            per_page: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by,
            sort_order,
            name: nameFilter.trim() || undefined,
            type: typeFilter.trim() || undefined,
            from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
            to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
        }),
        [
            pagination.pageSize,
            pagination.pageIndex,
            sort_by,
            sort_order,
            nameFilter,
            typeFilter,
            dateFilter,
        ],
    )

    const { data: depotResponse, isLoading, isError, error } = useQuery({
        queryKey: ['depot', apiParams],
        queryFn: () => loadDepots(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => depotResponse?.data ?? [], [depotResponse])
    const totalItems = depotResponse?.pagination?.total ?? 0
    const start = depotResponse?.pagination?.from ?? 0
    const end = depotResponse?.pagination?.to ?? 0

    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>(),
        })
        setHeaderCheckState('none')
    }, [nameFilter, typeFilter, dateFilter])

    useEffect(() => {
        setColumnVisibility(
            parseStoredColumnVisibility(localStorage.getItem(DEPOT_TABLE_COLUMN_VISIBILITY_KEY)),
        )
    }, [])

    const persistColumnVisibility = (next: VisibilityState) => {
        try {
            localStorage.setItem(
                DEPOT_TABLE_COLUMN_VISIBILITY_KEY,
                JSON.stringify({
                    ...next,
                    id: true,
                    actions: true,
                }),
            )
        } catch {
            /* ignore */
        }
    }

    const persistFilterVisibility = (next: DepotFilterVisibilityState) => {
        try {
            localStorage.setItem(
                DEPOT_TABLE_FILTER_VISIBILITY_KEY,
                JSON.stringify({
                    ...next,
                    name: true,
                }),
            )
        } catch {
            /* ignore */
        }
    }

    const toggleOptionalFilterVisibility = (filterId: keyof DepotFilterVisibilityState) => {
        if (DEPOT_LOCKED_FILTER_IDS.has(filterId)) return
        setFilterVisibility((prev) => {
            const locked = {
                ...prev,
                [filterId]: !prev[filterId],
                name: true,
            }
            persistFilterVisibility(locked)
            return locked
        })
    }

    const currentPageIds = useMemo(() => data.map((row) => String(row.id)), [data])

    const isDepotSelected = (id: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(id)
        }
        return selectionState.selectedIds.has(id)
    }

    const getSelectedCount = (): number => {
        if (selectionState.selectAll) {
            return totalItems - selectionState.excludedIds.size
        }
        return selectionState.selectedIds.size
    }

    const areAllCurrentPageSelected = (): boolean =>
        currentPageIds.length > 0 && currentPageIds.every((id) => isDepotSelected(id))

    const areSomeCurrentPageSelected = (): boolean =>
        currentPageIds.some((id) => isDepotSelected(id)) && !areAllCurrentPageSelected()

    const toggleDepotSelection = (depotId: string) => {
        setSelectionState((prev) => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(depotId)) {
                    newExcluded.delete(depotId)
                } else {
                    newExcluded.add(depotId)
                }
                return { ...prev, excludedIds: newExcluded }
            }
            const newSelected = new Set(prev.selectedIds)
            if (newSelected.has(depotId)) {
                newSelected.delete(depotId)
            } else {
                newSelected.add(depotId)
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

    const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
        setColumnVisibility((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            const locked = { ...next, id: true, actions: true }
            persistColumnVisibility(locked)
            return locked
        })
    }

    const toggleOptionalColumnVisibility = (columnId: string) => {
        if (DEPOT_LOCKED_COLUMN_IDS.has(columnId)) return
        setColumnVisibility((prev) => {
            const locked = {
                ...prev,
                [columnId]: !prev[columnId],
                id: true,
                actions: true,
            }
            persistColumnVisibility(locked)
            return locked
        })
    }

    const visibleSkeletonColumns = useMemo(
        () => DEPOT_SKELETON_COLUMNS.filter((c) => columnVisibility[c.id] !== false),
        [columnVisibility],
    )

    const columns: ColumnDef<Depot, unknown>[] = [
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
            cell: ({ row }: { row: TableRow<Depot> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isDepotSelected(String(row.original.id))}
                    onChange={() => toggleDepotSelection(String(row.original.id))}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        columnHelper.accessor('id', {
            id: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="fw-medium text-nowrap">{row.original.id ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('name', {
            id: 'name',
            header: 'Nom',
            cell: ({ row }) => (
                <span className="fw-medium">{row.original.name ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('type', {
            id: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <span className="badge bg-light text-dark">{row.original.type ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('created_by', {
            id: 'created_by',
            header: 'Créé par',
            enableSorting: false,
            cell: ({ row }) => <span>{row.original.created_by ?? '—'}</span>,
        }),
        columnHelper.accessor('created_at', {
            id: 'created_at',
            header: 'Créé le',
            cell: ({ row }) => formatDateTimeFr(row.original.created_at),
        }),
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: ({ row }: { row: TableRow<Depot> }) => (
                <Button
                    variant="light"
                    size="sm"
                    className="btn-icon rounded-circle"
                    onClick={() => {
                        setSelectedDepot(row.original)
                        setShowEditModal(true)
                    }}
                    title="Modifier"
                >
                    <TbEdit className="fs-lg" />
                </Button>
            ),
        },
    ]as ColumnDef<Depot, unknown>[]

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
        onPaginationChange: (updater) => {
            setPagination((prev) => (typeof updater === 'function' ? updater(prev) : updater))
        },
        onColumnVisibilityChange: handleColumnVisibilityChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: depotResponse?.pagination?.last_page ?? 0,
    })

    const hasActiveFilters = nameFilter || typeFilter || dateFilter.length > 0

    return (
        <>
            <div className="d-flex justify-content-end mb-2">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    + Ajouter un dépôt
                </Button>
            </div>
            <Card className="mb-3 border-light shadow-sm">
                <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                        <span className="fw-semibold text-dark">Filtres</span>
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="btn-icon rounded-circle"
                                aria-label="Filtres affichés"
                            >
                                <TbFilter className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 280 }}>
                                <div className="fw-semibold small text-dark mb-2">Filtres affichés</div>
                                <Form.Check
                                    id="depot-filter-name"
                                    type="checkbox"
                                    className="mb-2"
                                    label={DEPOT_FILTER_LABELS.name}
                                    checked
                                    disabled
                                />
                                <hr className="my-2" />
                                {DEPOT_OPTIONAL_FILTER_ORDER.map((fid) => (
                                    <Form.Check
                                        key={fid}
                                        id={`depot-filter-${fid}`}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DEPOT_FILTER_LABELS[fid]}
                                        checked={filterVisibility[fid] === true}
                                        onChange={() => toggleOptionalFilterVisibility(fid)}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {(filterVisibility.type || filterVisibility.date || filterVisibility.par_page) && (
                        <Row className="g-3">
                            {filterVisibility.type && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">
                                        {DEPOT_FILTER_LABELS.type}
                                    </label>
                                    <Form.Control
                                        className="mt-2"
                                        placeholder="ex. stockage, showroom"
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.date && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">
                                        {DEPOT_FILTER_LABELS.date}
                                    </label>
                                    <Flatpickr
                                        className="form-control mt-2"
                                        placeholder="Période"
                                        value={dateFilter}
                                        onChange={(dates) => {
                                            setDateFilter(dates)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                        options={{
                                            dateFormat: 'd M, Y',
                                            mode: 'range',
                                            locale: French,
                                            monthSelectorType: 'dropdown',
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
                                            { value: 8, label: '8' },
                                            { value: 10, label: '10' },
                                            { value: 15, label: '15' },
                                            { value: 20, label: '20' },
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
                    {filterVisibility.name && (
                        <Row className="mt-2">
                            <Col xs={12} md={8} lg={6}>
                                <label className="d-block fw-semibold text-dark mb-2">
                                    {DEPOT_FILTER_LABELS.name}
                                </label>
                                <div className="app-search">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Rechercher par nom…"
                                        value={nameFilter}
                                        onChange={(e) => {
                                            setNameFilter(e.target.value)
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
                                    setNameFilter('')
                                    setTypeFilter('')
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
                        <div className="d-flex gap-2 align-items-center">
                            {selectedCount > 0 && (
                                <span className="badge bg-primary-subtle text-primary">
                                    {selectionState.selectAll
                                        ? `Tous (${selectedCount})`
                                        : selectedCount}{' '}
                                    sélectionné(s)
                                </span>
                            )}
                        </div>
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="btn-icon rounded-circle"
                                aria-label="Colonnes"
                            >
                                <TbAdjustmentsFilled className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 260 }}>
                                <div className="fw-semibold small text-dark mb-2">Colonnes</div>
                                {(['id', 'actions'] as const).map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DEPOT_COLUMN_LABELS[colId] ?? colId}
                                        checked
                                        disabled
                                    />
                                ))}
                                <hr className="my-2" />
                                {DEPOT_OPTIONAL_COLUMN_ORDER.map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DEPOT_COLUMN_LABELS[colId] ?? colId}
                                        checked={columnVisibility[colId] === true}
                                        onChange={() => toggleOptionalColumnVisibility(colId)}
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
                        Erreur lors du chargement des dépôts: {(error as Error)?.message}
                    </div>
                ) : (
                    <DataTable<Depot> table={table} emptyMessage="Aucun dépôt" />
                )}

                {data.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="dépôts"
                            showInfo
                            previousPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                            }
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={depotResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination((p) => ({ ...p, pageIndex: index }))}
                            nextPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                            }
                            canNextPage={
                                pagination.pageIndex < (depotResponse?.pagination?.last_page ?? 1) - 1
                            }
                        />
                    </CardFooter>
                )}
            </Card>

            <AddDepotModal show={showAddModal} onHide={() => setShowAddModal(false)} />

            <EditDepotModal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false)
                    setSelectedDepot(null)
                }}
                selectedDepot={selectedDepot}
            />
        </>
    )
}

export default DepotTableComponent
