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

import type { DemandeReservation } from '@/interface/gloable'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import TableSkeleton from '@/components/TableSkeleton'
import { useQuery } from '@tanstack/react-query'
import { loadDemandeReservations } from '@/services/demandeReservation'
import { loadAllStocks } from '@/services/stock'
import EditDemandeReservationModal from '@/views/apps/demande_reservation/components/Modals/EditDemandeReservationModal'
import AddDemandeReservationModal from '@/views/apps/demande_reservation/components/Modals/AddDemandeReservationModal'
import Flatpickr from 'react-flatpickr'
import { French } from 'flatpickr/dist/l10n/fr.js'

const columnHelper = createColumnHelper<DemandeReservation>()

type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const DR_SORT_IDS = ['created_at', 'id', 'stock_id', 'statut'] as const
type DrSortId = (typeof DR_SORT_IDS)[number]

const DR_TABLE_COLUMN_VISIBILITY_KEY = 'conexus.demande-reservation-table.column-visibility'
const DR_TABLE_FILTER_VISIBILITY_KEY = 'conexus.demande-reservation-table.filter-visibility'

type DrFilterVisibilityState = {
    keyword: boolean
    stock_id: boolean
    statut: boolean
    id_demande: boolean
    nom_commercial: boolean
    date: boolean
    par_page: boolean
}

const DEFAULT_DR_FILTER_VISIBILITY: DrFilterVisibilityState = {
    keyword: true,
    stock_id: false,
    statut: false,
    id_demande: false,
    nom_commercial: false,
    date: false,
    par_page: false,
}

const DR_LOCKED_FILTER_IDS = new Set<keyof DrFilterVisibilityState>(['keyword'])

const DR_FILTER_LABELS: Record<keyof DrFilterVisibilityState, string> = {
    keyword: 'Recherche (infos / id demande / commercial)',
    stock_id: 'Stock',
    statut: 'Statut',
    id_demande: 'ID demande',
    nom_commercial: 'Nom commercial',
    date: 'Date de création',
    par_page: 'Par page',
}

const DR_OPTIONAL_FILTER_ORDER = [
    'stock_id',
    'statut',
    'id_demande',
    'nom_commercial',
    'date',
    'par_page',
] as const satisfies readonly (keyof DrFilterVisibilityState)[]

const DEFAULT_DR_COLUMN_VISIBILITY: VisibilityState = {
    select: false,
    id: true,
    stock: true,
    stock_id: false,
    id_demande: true,
    nom_commercial: true,
    statut: true,
    demande_infos: false,
    created_at: true,
    actions: true,
}

const DR_LOCKED_COLUMN_IDS = new Set<string>(['id', 'actions'])

const DR_COLUMN_LABELS: Record<string, string> = {
    select: 'Sélection',
    id: 'ID',
    stock: 'Véhicule',
    stock_id: 'Stock ID',
    id_demande: 'ID demande',
    nom_commercial: 'Commercial',
    statut: 'Statut',
    demande_infos: 'Infos',
    created_at: 'Créé le',
    actions: 'Actions',
}

const DR_OPTIONAL_COLUMN_ORDER = [
    'select',
    'stock',
    'stock_id',
    'id_demande',
    'nom_commercial',
    'statut',
    'demande_infos',
    'created_at',
] as const

type DrSkeletonCol = { id: string; width: string; type: 'checkbox' | 'text' | 'actions' }

const DR_SKELETON_COLUMNS: DrSkeletonCol[] = [
    { id: 'select', width: '40px', type: 'checkbox' },
    { id: 'id', width: '56px', type: 'text' },
    { id: 'stock', width: '180px', type: 'text' },
    { id: 'id_demande', width: '100px', type: 'text' },
    { id: 'nom_commercial', width: '120px', type: 'text' },
    { id: 'statut', width: '100px', type: 'text' },
    { id: 'demande_infos', width: '120px', type: 'text' },
    { id: 'created_at', width: '120px', type: 'text' },
    { id: 'actions', width: '70px', type: 'actions' },
]

function parseStoredColumnVisibility(raw: string | null): VisibilityState {
    if (!raw) {
        return { ...DEFAULT_DR_COLUMN_VISIBILITY }
    }
    try {
        const parsed = JSON.parse(raw) as Record<string, boolean>
        const next: VisibilityState = { ...DEFAULT_DR_COLUMN_VISIBILITY }
        for (const key of Object.keys(DEFAULT_DR_COLUMN_VISIBILITY)) {
            if (key in parsed) {
                next[key] = Boolean(parsed[key])
            }
        }
        next.id = true
        next.actions = true
        return next
    } catch {
        return { ...DEFAULT_DR_COLUMN_VISIBILITY }
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

const trunc = (s: string | null | undefined, n: number) => {
    if (s == null || s === '') return '—'
    return s.length <= n ? s : `${s.slice(0, n)}…`
}

const stockLabel = (row: DemandeReservation) => {
    const s = row.stock
    if (s) {
        const t = [s.marque, s.modele, s.vin].filter(Boolean).join(' · ')
        return t || `Stock #${row.stock_id}`
    }
    return `Stock #${row.stock_id}`
}

const DemandeReservationTableComponent = () => {
    const [keywordFilter, setKeywordFilter] = useState('')
    const [statutFilter, setStatutFilter] = useState('')
    const [idDemandeFilter, setIdDemandeFilter] = useState('')
    const [nomCommercialFilter, setNomCommercialFilter] = useState('')
    const [stockFilter, setStockFilter] = useState<{ value: string; label: string } | null>(null)
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
    const [selectedRow, setSelectedRow] = useState<DemandeReservation | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({
        ...DEFAULT_DR_COLUMN_VISIBILITY,
    }))

    const [filterVisibility, setFilterVisibility] = useState<DrFilterVisibilityState>(() => ({
        ...DEFAULT_DR_FILTER_VISIBILITY,
    }))

    const { data: stockOptionsList = [] } = useQuery({
        queryKey: ['stocks', 'all'],
        queryFn: loadAllStocks,
        staleTime: 60_000,
        enabled: filterVisibility.stock_id,
    })

    const stockSelectOptions = useMemo(
        () =>
            stockOptionsList.map((s) => ({
                value: String(s.id),
                label:
                    [s.marque, s.modele, s.vin].filter(Boolean).join(' · ') || `Stock #${s.id}`,
            })),
        [stockOptionsList],
    )

    const sortByRaw = sorting[0]?.id
    const sort_by: DrSortId = DR_SORT_IDS.includes(sortByRaw as DrSortId)
        ? (sortByRaw as DrSortId)
        : 'created_at'
    const sort_order =
        sorting.length > 0 ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : 'desc'

    const apiParams = useMemo(
        () => ({
            per_page: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by,
            sort_order,
            keyword: keywordFilter.trim() || undefined,
            stock_id: stockFilter ? Number(stockFilter.value) : undefined,
            statut: statutFilter.trim() || undefined,
            id_demande: idDemandeFilter.trim() || undefined,
            nom_commercial: nomCommercialFilter.trim() || undefined,
            from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
            to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
        }),
        [
            pagination.pageSize,
            pagination.pageIndex,
            sort_by,
            sort_order,
            keywordFilter,
            stockFilter,
            statutFilter,
            idDemandeFilter,
            nomCommercialFilter,
            dateFilter,
        ],
    )

    const { data: drResponse, isLoading, isError, error } = useQuery({
        queryKey: ['demande_reservation', apiParams],
        queryFn: () => loadDemandeReservations(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => drResponse?.data ?? [], [drResponse])
    const totalItems = drResponse?.pagination?.total ?? 0
    const start = drResponse?.pagination?.from ?? 0
    const end = drResponse?.pagination?.to ?? 0

    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>(),
        })
        setHeaderCheckState('none')
    }, [keywordFilter, stockFilter, statutFilter, idDemandeFilter, nomCommercialFilter, dateFilter])

    useEffect(() => {
        setColumnVisibility(parseStoredColumnVisibility(localStorage.getItem(DR_TABLE_COLUMN_VISIBILITY_KEY)))
    }, [])

    const persistColumnVisibility = (next: VisibilityState) => {
        try {
            localStorage.setItem(
                DR_TABLE_COLUMN_VISIBILITY_KEY,
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

    const persistFilterVisibility = (next: DrFilterVisibilityState) => {
        try {
            localStorage.setItem(
                DR_TABLE_FILTER_VISIBILITY_KEY,
                JSON.stringify({
                    ...next,
                    keyword: true,
                }),
            )
        } catch {
            /* ignore */
        }
    }

    const toggleOptionalFilterVisibility = (filterId: keyof DrFilterVisibilityState) => {
        if (DR_LOCKED_FILTER_IDS.has(filterId)) return
        setFilterVisibility((prev) => {
            const locked = {
                ...prev,
                [filterId]: !prev[filterId],
                keyword: true,
            }
            persistFilterVisibility(locked)
            return locked
        })
    }

    const currentPageIds = useMemo(() => data.map((row) => String(row.id)), [data])

    const isSelected = (id: string): boolean => {
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
        currentPageIds.length > 0 && currentPageIds.every((id) => isSelected(id))

    const areSomeCurrentPageSelected = (): boolean =>
        currentPageIds.some((id) => isSelected(id)) && !areAllCurrentPageSelected()

    const toggleSelection = (rowId: string) => {
        setSelectionState((prev) => {
            if (prev.selectAll) {
                const newExcluded = new Set(prev.excludedIds)
                if (newExcluded.has(rowId)) {
                    newExcluded.delete(rowId)
                } else {
                    newExcluded.add(rowId)
                }
                return { ...prev, excludedIds: newExcluded }
            }
            const newSelected = new Set(prev.selectedIds)
            if (newSelected.has(rowId)) {
                newSelected.delete(rowId)
            } else {
                newSelected.add(rowId)
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
        if (DR_LOCKED_COLUMN_IDS.has(columnId)) return
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
        () => DR_SKELETON_COLUMNS.filter((c) => columnVisibility[c.id] !== false),
        [columnVisibility],
    )

    const columns: ColumnDef<DemandeReservation, unknown>[] = [
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
            cell: ({ row }: { row: TableRow<DemandeReservation> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isSelected(String(row.original.id))}
                    onChange={() => toggleSelection(String(row.original.id))}
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
        columnHelper.display({
            id: 'stock',
            header: 'Véhicule',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block" style={{ maxWidth: 220 }}>
                    {stockLabel(row.original)}
                </span>
            ),
        }),
        columnHelper.accessor('stock_id', {
            id: 'stock_id',
            header: 'Stock ID',
            cell: ({ row }) => <span>{row.original.stock_id}</span>,
        }),
        columnHelper.accessor('id_demande', {
            id: 'id_demande',
            header: 'ID demande',
            enableSorting: false,
            cell: ({ row }) => <span>{row.original.id_demande ?? '—'}</span>,
        }),
        columnHelper.accessor('nom_commercial', {
            id: 'nom_commercial',
            header: 'Commercial',
            enableSorting: false,
            cell: ({ row }) => <span>{row.original.nom_commercial ?? '—'}</span>,
        }),
        columnHelper.accessor('statut', {
            id: 'statut',
            header: 'Statut',
            cell: ({ row }) => (
                <span className="badge bg-light text-dark">{row.original.statut ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('demande_infos', {
            id: 'demande_infos',
            header: 'Infos',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="fs-xs text-muted" title={row.original.demande_infos ?? ''}>
                    {trunc(row.original.demande_infos, 40)}
                </span>
            ),
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
            cell: ({ row }: { row: TableRow<DemandeReservation> }) => (
                <Button
                    variant="light"
                    size="sm"
                    className="btn-icon rounded-circle"
                    onClick={() => {
                        setSelectedRow(row.original)
                        setShowEditModal(true)
                    }}
                    title="Modifier"
                >
                    <TbEdit className="fs-lg" />
                </Button>
            ),
        },
    ]as ColumnDef<DemandeReservation, unknown>[]

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
        pageCount: drResponse?.pagination?.last_page ?? 0,
    })

    const hasActiveFilters =
        keywordFilter ||
        stockFilter ||
        statutFilter ||
        idDemandeFilter ||
        nomCommercialFilter ||
        dateFilter.length > 0

    return (
        <>
            <div className="d-flex justify-content-end mb-2">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    + Nouvelle demande
                </Button>
            </div>
            <Card className="mb-3 border-light shadow-sm">
                <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                        <span className="fw-semibold text-dark">Filtres</span>
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle variant="light" size="sm" className="btn-icon rounded-circle">
                                <TbFilter className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 280 }}>
                                <div className="fw-semibold small text-dark mb-2">Filtres affichés</div>
                                <Form.Check
                                    type="checkbox"
                                    className="mb-2"
                                    label={DR_FILTER_LABELS.keyword}
                                    checked
                                    disabled
                                />
                                <hr className="my-2" />
                                {DR_OPTIONAL_FILTER_ORDER.map((fid) => (
                                    <Form.Check
                                        key={fid}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DR_FILTER_LABELS[fid]}
                                        checked={filterVisibility[fid] === true}
                                        onChange={() => toggleOptionalFilterVisibility(fid)}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {(filterVisibility.stock_id ||
                        filterVisibility.statut ||
                        filterVisibility.id_demande ||
                        filterVisibility.nom_commercial ||
                        filterVisibility.date ||
                        filterVisibility.par_page) && (
                        <Row className="g-3">
                            {filterVisibility.stock_id && (
                                <Col xs={12} sm={6} lg={4}>
                                    <label className="fw-medium text-dark mb-0 d-block">Stock</label>
                                    <Select
                                        className="react-select mt-2"
                                        classNamePrefix="react-select"
                                        placeholder="Tous"
                                        isClearable
                                        options={stockSelectOptions}
                                        value={stockFilter}
                                        onChange={(opt) => {
                                            setStockFilter(opt)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.statut && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Statut</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={statutFilter}
                                        onChange={(e) => {
                                            setStatutFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.id_demande && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">ID demande</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={idDemandeFilter}
                                        onChange={(e) => {
                                            setIdDemandeFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.nom_commercial && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Nom commercial</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={nomCommercialFilter}
                                        onChange={(e) => {
                                            setNomCommercialFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.date && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">
                                        {DR_FILTER_LABELS.date}
                                    </label>
                                    <Flatpickr
                                        className="form-control mt-2"
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
                    {filterVisibility.keyword && (
                        <Row className="mt-2">
                            <Col xs={12} md={8} lg={6}>
                                <label className="d-block fw-semibold text-dark mb-2">
                                    {DR_FILTER_LABELS.keyword}
                                </label>
                                <div className="app-search">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Infos, id demande, nom commercial…"
                                        value={keywordFilter}
                                        onChange={(e) => {
                                            setKeywordFilter(e.target.value)
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
                                    setKeywordFilter('')
                                    setStockFilter(null)
                                    setStatutFilter('')
                                    setIdDemandeFilter('')
                                    setNomCommercialFilter('')
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
                            <Dropdown.Toggle variant="light" size="sm" className="btn-icon rounded-circle">
                                <TbAdjustmentsFilled className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 260 }}>
                                <div className="fw-semibold small text-dark mb-2">Colonnes</div>
                                {(['id', 'actions'] as const).map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DR_COLUMN_LABELS[colId] ?? colId}
                                        checked
                                        disabled
                                    />
                                ))}
                                <hr className="my-2" />
                                {DR_OPTIONAL_COLUMN_ORDER.map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        type="checkbox"
                                        className="mb-2"
                                        label={DR_COLUMN_LABELS[colId] ?? colId}
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
                        Erreur lors du chargement: {(error as Error)?.message}
                    </div>
                ) : (
                    <DataTable<DemandeReservation>
                        table={table}
                        emptyMessage="Aucune demande de réservation"
                    />
                )}

                {data.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="demandes"
                            showInfo
                            previousPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                            }
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={drResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination((p) => ({ ...p, pageIndex: index }))}
                            nextPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                            }
                            canNextPage={
                                pagination.pageIndex < (drResponse?.pagination?.last_page ?? 1) - 1
                            }
                        />
                    </CardFooter>
                )}
            </Card>

            <AddDemandeReservationModal show={showAddModal} onHide={() => setShowAddModal(false)} />

            <EditDemandeReservationModal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false)
                    setSelectedRow(null)
                }}
                selected={selectedRow}
            />
        </>
    )
}

export default DemandeReservationTableComponent
