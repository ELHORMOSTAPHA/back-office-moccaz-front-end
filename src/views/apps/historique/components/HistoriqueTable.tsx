'use client'

import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    useReactTable,
} from '@tanstack/react-table'

import { useState, useMemo, useEffect } from 'react'
import { Button, Card, CardFooter, CardHeader, Col, Dropdown, Form, Row } from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'
import { TbAdjustmentsFilled, TbFilter } from 'react-icons/tb'
import Select from 'react-select'

import type { Historique } from '@/interface/gloable'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import TableSkeleton from '@/components/TableSkeleton'
import { useQuery } from '@tanstack/react-query'
import { loadHistorique } from '@/services/historique'
import Flatpickr from 'react-flatpickr'
import { French } from 'flatpickr/dist/l10n/fr.js'

const columnHelper = createColumnHelper<Historique>()

const HIST_SORT_IDS = ['id', 'created_at', 'action', 'table_name'] as const
type HistSortId = (typeof HIST_SORT_IDS)[number]

const HIST_TABLE_COLUMN_VISIBILITY_KEY = 'conexus.historique-table.column-visibility'
const HIST_TABLE_FILTER_VISIBILITY_KEY = 'conexus.historique-table.filter-visibility'

type HistFilterVisibilityState = {
    keyword: boolean
    user_id: boolean
    action: boolean
    table_name: boolean
    record_id: boolean
    date: boolean
    par_page: boolean
}

const DEFAULT_HIST_FILTER_VISIBILITY: HistFilterVisibilityState = {
    keyword: true,
    user_id: false,
    action: false,
    table_name: false,
    record_id: false,
    date: false,
    par_page: false,
}

const HIST_LOCKED_FILTER_IDS = new Set<keyof HistFilterVisibilityState>(['keyword'])

const HIST_FILTER_LABELS: Record<keyof HistFilterVisibilityState, string> = {
    keyword: 'Recherche (valeurs / table)',
    user_id: 'Utilisateur',
    action: 'Action',
    table_name: 'Table',
    record_id: 'ID enregistrement',
    date: 'Date (création)',
    par_page: 'Par page',
}

const HIST_OPTIONAL_FILTER_ORDER = [
    'user_id',
    'action',
    'table_name',
    'record_id',
    'date',
    'par_page',
] as const satisfies readonly (keyof HistFilterVisibilityState)[]

const DEFAULT_HIST_COLUMN_VISIBILITY: VisibilityState = {
    id: true,
    user_id: false,
    action: true,
    table_name: true,
    record_id: true,
    old_value: true,
    new_value: true,
    created_at: true,
    created_by: false,
}

const HIST_LOCKED_COLUMN_IDS = new Set<string>(['id'])

const HIST_COLUMN_LABELS: Record<string, string> = {
    id: 'ID',
    user_id: 'User',
    action: 'Action',
    table_name: 'Table',
    record_id: 'Record',
    old_value: 'Ancienne valeur',
    new_value: 'Nouvelle valeur',
    created_at: 'Date',
    created_by: 'Par',
}

const HIST_OPTIONAL_COLUMN_ORDER = [
    'user_id',
    'action',
    'table_name',
    'record_id',
    'old_value',
    'new_value',
    'created_at',
    'created_by',
] as const

type HistSkeletonCol = { id: string; width: string; type: 'text' }

const HIST_SKELETON_COLUMNS: HistSkeletonCol[] = [
    { id: 'id', width: '56px', type: 'text' },
    { id: 'user_id', width: '80px', type: 'text' },
    { id: 'action', width: '90px', type: 'text' },
    { id: 'table_name', width: '100px', type: 'text' },
    { id: 'record_id', width: '72px', type: 'text' },
    { id: 'old_value', width: '140px', type: 'text' },
    { id: 'new_value', width: '140px', type: 'text' },
    { id: 'created_at', width: '120px', type: 'text' },
    { id: 'created_by', width: '64px', type: 'text' },
]

function parseStoredColumnVisibility(raw: string | null): VisibilityState {
    if (!raw) {
        return { ...DEFAULT_HIST_COLUMN_VISIBILITY }
    }
    try {
        const parsed = JSON.parse(raw) as Record<string, boolean>
        const next: VisibilityState = { ...DEFAULT_HIST_COLUMN_VISIBILITY }
        for (const key of Object.keys(DEFAULT_HIST_COLUMN_VISIBILITY)) {
            if (key in parsed) {
                next[key] = Boolean(parsed[key])
            }
        }
        next.id = true
        return next
    } catch {
        return { ...DEFAULT_HIST_COLUMN_VISIBILITY }
    }
}

const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const trunc = (s: string | null | undefined, n: number) => {
    if (s == null || s === '') return '—'
    return s.length <= n ? s : `${s.slice(0, n)}…`
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

const HistoriqueTableComponent = () => {
    const [keywordFilter, setKeywordFilter] = useState('')
    const [userIdFilter, setUserIdFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [tableNameFilter, setTableNameFilter] = useState('')
    const [recordIdFilter, setRecordIdFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [dateFilter, setDateFilter] = useState<Date[]>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({
        ...DEFAULT_HIST_COLUMN_VISIBILITY,
    }))

    const [filterVisibility, setFilterVisibility] = useState<HistFilterVisibilityState>(() => ({
        ...DEFAULT_HIST_FILTER_VISIBILITY,
    }))

    const sortByRaw = sorting[0]?.id
    const sort_by: HistSortId = HIST_SORT_IDS.includes(sortByRaw as HistSortId)
        ? (sortByRaw as HistSortId)
        : 'id'
    const sort_order =
        sorting.length > 0 ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : 'desc'

    const apiParams = useMemo(() => {
        const ridRaw = recordIdFilter.trim()
        const ridParsed = ridRaw === '' ? undefined : Number(ridRaw)
        const record_id = ridRaw !== '' && !Number.isNaN(ridParsed!) ? ridParsed : undefined
        return {
            per_page: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by,
            sort_order,
            keyword: keywordFilter.trim() || undefined,
            user_id: userIdFilter.trim() || undefined,
            action: actionFilter.trim() || undefined,
            table_name: tableNameFilter.trim() || undefined,
            record_id,
            from: dateFilter.length > 0 ? formatDateToISO(dateFilter[0]) : undefined,
            to: dateFilter.length > 1 ? formatDateToISO(dateFilter[1]) : undefined,
        }
    }, [
        pagination.pageSize,
        pagination.pageIndex,
        sort_by,
        sort_order,
        keywordFilter,
        userIdFilter,
        actionFilter,
        tableNameFilter,
        recordIdFilter,
        dateFilter,
    ])

    const { data: histResponse, isLoading, isError, error } = useQuery({
        queryKey: ['historique', apiParams],
        queryFn: () => loadHistorique(apiParams),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const data = useMemo(() => histResponse?.data ?? [], [histResponse])
    const totalItems = histResponse?.pagination?.total ?? 0
    const start = histResponse?.pagination?.from ?? 0
    const end = histResponse?.pagination?.to ?? 0

    useEffect(() => {
        setColumnVisibility(parseStoredColumnVisibility(localStorage.getItem(HIST_TABLE_COLUMN_VISIBILITY_KEY)))
    }, [])

    const persistColumnVisibility = (next: VisibilityState) => {
        try {
            localStorage.setItem(
                HIST_TABLE_COLUMN_VISIBILITY_KEY,
                JSON.stringify({
                    ...next,
                    id: true,
                }),
            )
        } catch {
            /* ignore */
        }
    }

    const persistFilterVisibility = (next: HistFilterVisibilityState) => {
        try {
            localStorage.setItem(
                HIST_TABLE_FILTER_VISIBILITY_KEY,
                JSON.stringify({
                    ...next,
                    keyword: true,
                }),
            )
        } catch {
            /* ignore */
        }
    }

    const toggleOptionalFilterVisibility = (filterId: keyof HistFilterVisibilityState) => {
        if (HIST_LOCKED_FILTER_IDS.has(filterId)) return
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

    const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
        setColumnVisibility((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            const locked = { ...next, id: true }
            persistColumnVisibility(locked)
            return locked
        })
    }

    const toggleOptionalColumnVisibility = (columnId: string) => {
        if (HIST_LOCKED_COLUMN_IDS.has(columnId)) return
        setColumnVisibility((prev) => {
            const locked = {
                ...prev,
                [columnId]: !prev[columnId],
                id: true,
            }
            persistColumnVisibility(locked)
            return locked
        })
    }

    const visibleSkeletonColumns = useMemo(
        () => HIST_SKELETON_COLUMNS.filter((c) => columnVisibility[c.id] !== false),
        [columnVisibility],
    )

    const columns: ColumnDef<Historique, unknown>[] = [
        columnHelper.accessor('id', {
            id: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="fw-medium text-nowrap">{row.original.id ?? '—'}</span>
            ),
        }),
        columnHelper.accessor('user_id', {
            id: 'user_id',
            header: 'User',
            cell: ({ row }) => <span className="text-nowrap">{row.original.user_id ?? '—'}</span>,
        }),
        columnHelper.accessor('action', {
            id: 'action',
            header: 'Action',
            cell: ({ row }) => <span className="badge bg-light text-dark">{row.original.action ?? '—'}</span>,
        }),
        columnHelper.accessor('table_name', {
            id: 'table_name',
            header: 'Table',
            cell: ({ row }) => <span>{row.original.table_name ?? '—'}</span>,
        }),
        columnHelper.accessor('record_id', {
            id: 'record_id',
            header: 'Record',
            cell: ({ row }) => <span>{row.original.record_id ?? '—'}</span>,
        }),
        columnHelper.accessor('old_value', {
            id: 'old_value',
            header: 'Ancienne valeur',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="fs-xs text-muted" title={row.original.old_value ?? ''}>
                    {trunc(row.original.old_value, 48)}
                </span>
            ),
        }),
        columnHelper.accessor('new_value', {
            id: 'new_value',
            header: 'Nouvelle valeur',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="fs-xs" title={row.original.new_value ?? ''}>
                    {trunc(row.original.new_value, 48)}
                </span>
            ),
        }),
        columnHelper.accessor('created_at', {
            id: 'created_at',
            header: 'Date',
            cell: ({ row }) => formatDateTimeFr(row.original.created_at),
        }),
        columnHelper.accessor('created_by', {
            id: 'created_by',
            header: 'Par',
            cell: ({ row }) => <span>{row.original.created_by ?? '—'}</span>,
        }),
    ] as ColumnDef<Historique, unknown>[]

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
        pageCount: histResponse?.pagination?.last_page ?? 0,
    })

    const hasActiveFilters =
        keywordFilter ||
        userIdFilter ||
        actionFilter ||
        tableNameFilter ||
        recordIdFilter ||
        dateFilter.length > 0

    return (
        <>
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
                                    type="checkbox"
                                    className="mb-2"
                                    label={HIST_FILTER_LABELS.keyword}
                                    checked
                                    disabled
                                />
                                <hr className="my-2" />
                                {HIST_OPTIONAL_FILTER_ORDER.map((fid) => (
                                    <Form.Check
                                        key={fid}
                                        type="checkbox"
                                        className="mb-2"
                                        label={HIST_FILTER_LABELS[fid]}
                                        checked={filterVisibility[fid] === true}
                                        onChange={() => toggleOptionalFilterVisibility(fid)}
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {(filterVisibility.user_id ||
                        filterVisibility.action ||
                        filterVisibility.table_name ||
                        filterVisibility.record_id ||
                        filterVisibility.date ||
                        filterVisibility.par_page) && (
                        <Row className="g-3">
                            {filterVisibility.user_id && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">User ID</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={userIdFilter}
                                        onChange={(e) => {
                                            setUserIdFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.action && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Action</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={actionFilter}
                                        onChange={(e) => {
                                            setActionFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.table_name && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Table</label>
                                    <Form.Control
                                        className="mt-2"
                                        value={tableNameFilter}
                                        onChange={(e) => {
                                            setTableNameFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.record_id && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Record ID</label>
                                    <Form.Control
                                        className="mt-2"
                                        type="number"
                                        value={recordIdFilter}
                                        onChange={(e) => {
                                            setRecordIdFilter(e.target.value)
                                            setPagination((p) => ({ ...p, pageIndex: 0 }))
                                        }}
                                    />
                                </Col>
                            )}
                            {filterVisibility.date && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">
                                        {HIST_FILTER_LABELS.date}
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
                                    {HIST_FILTER_LABELS.keyword}
                                </label>
                                <div className="app-search">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Texte dans ancienne / nouvelle valeur ou nom de table…"
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
                                    setUserIdFilter('')
                                    setActionFilter('')
                                    setTableNameFilter('')
                                    setRecordIdFilter('')
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
                    <div className="d-flex align-items-center justify-content-end w-100">
                        <Dropdown align="end" autoClose="outside">
                            <Dropdown.Toggle variant="light" size="sm" className="btn-icon rounded-circle">
                                <TbAdjustmentsFilled className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 260 }}>
                                <div className="fw-semibold small text-dark mb-2">Colonnes</div>
                                <Form.Check
                                    type="checkbox"
                                    className="mb-2"
                                    label={HIST_COLUMN_LABELS.id}
                                    checked
                                    disabled
                                />
                                <hr className="my-2" />
                                {HIST_OPTIONAL_COLUMN_ORDER.map((colId) => (
                                    <Form.Check
                                        key={colId}
                                        type="checkbox"
                                        className="mb-2"
                                        label={HIST_COLUMN_LABELS[colId] ?? colId}
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
                        Erreur lors du chargement de l&apos;historique: {(error as Error)?.message}
                    </div>
                ) : (
                    <DataTable<Historique> table={table} emptyMessage="Aucune entrée d&apos;historique" />
                )}

                {data.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="entrées"
                            showInfo
                            previousPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                            }
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={histResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination((p) => ({ ...p, pageIndex: index }))}
                            nextPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                            }
                            canNextPage={
                                pagination.pageIndex < (histResponse?.pagination?.last_page ?? 1) - 1
                            }
                        />
                    </CardFooter>
                )}
            </Card>
        </>
    )
}

export default HistoriqueTableComponent
