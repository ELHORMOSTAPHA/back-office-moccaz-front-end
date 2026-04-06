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
import { Button, Card, CardFooter, CardHeader, Col, Dropdown, Form, Modal, Row } from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'
// v2 (actions column): add TbEdit, TbEye to this import
import { TbAdjustmentsFilled, TbFilter } from 'react-icons/tb'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import { French } from 'flatpickr/dist/l10n/fr.js'

import type { AnnounceBulkStatusFilters, AnnounceType, AnnounceVehiculeImageType } from '@/interface/gloable'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'
import TableSkeleton from '@/components/TableSkeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bulkUpdateAnnounceStatus, loadAnnounces, updateAnnounce } from '@/services/announces'
const columnHelper = createColumnHelper<AnnounceType>()

type SelectionState = {
    selectAll: boolean
    selectedIds: Set<string>
    excludedIds: Set<string>
}

const ANNOUNCE_SORT_IDS = [
    'created_at',
    'id',
    'ref',
    'title',
    'prix',
    'year',
    'city',
    'store_id',
    'status',
    'user_id',
] as const
type AnnounceSortId = (typeof ANNOUNCE_SORT_IDS)[number]

const COLUMN_KEY = 'moccaz.announce-table.column-visibility'
const FILTER_KEY = 'moccaz.announce-table.filter-visibility'

type AnnounceFilterVisibility = {
    global: boolean
    date: boolean
    status: boolean
    city: boolean
    par_page: boolean
}

const DEFAULT_FILTER_VISIBILITY: AnnounceFilterVisibility = {
    global: true,
    date: false,
    status: false,
    city: false,
    par_page: false,
}

const FILTER_LABELS: Record<keyof AnnounceFilterVisibility, string> = {
    global: 'Recherche',
    date: 'Période (création)',
    status: 'Statut',
    city: 'Ville',
    par_page: 'Par page',
}

const OPTIONAL_FILTER_ORDER = ['date', 'status', 'city', 'par_page'] as const satisfies readonly (
    keyof AnnounceFilterVisibility
)[]

const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
    select: true,
    id: true,
    ref: true,
    title: true,
    description: false,
    prix: true,
    year: true,
    user_id: true,
    marque: true,
    modele: true,
    finition: true,
    city: true,
    store_id: true,
    photos: true,
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
    ref: 'Réf.',
    title: 'Titre',
    description: 'Description',
    prix: 'Prix',
    year: 'Année',
    user_id: 'Client',
    marque: 'Marque',
    modele: 'Modèle',
    finition: 'Finition',
    city: 'Ville',
    store_id: 'Boutique',
    photos: 'Photos',
    status: 'Statut',
    created_at: 'Créé le',
    // v2: actions column
    // actions: 'Actions',
}

const OPTIONAL_COLUMN_ORDER = [
    'select',
    'ref',
    'title',
    'description',
    'prix',
    'year',
    'user_id',
    'marque',
    'modele',
    'finition',
    'city',
    'store_id',
    'photos',
    'status',
    'created_at',
] as const

type SkeletonCol = { id: string; width: string; type: 'checkbox' | 'text' | 'badge' | 'actions' }

const SKELETON_COLUMNS: SkeletonCol[] = [
    { id: 'select', width: '40px', type: 'checkbox' },
    { id: 'id', width: '56px', type: 'text' },
    { id: 'ref', width: '120px', type: 'text' },
    { id: 'title', width: '160px', type: 'text' },
    { id: 'description', width: '180px', type: 'text' },
    { id: 'prix', width: '88px', type: 'text' },
    { id: 'year', width: '72px', type: 'text' },
    { id: 'user_id', width: '200px', type: 'text' },
    { id: 'marque', width: '120px', type: 'text' },
    { id: 'modele', width: '120px', type: 'text' },
    { id: 'finition', width: '120px', type: 'text' },
    { id: 'city', width: '140px', type: 'text' },
    { id: 'store_id', width: '88px', type: 'text' },
    { id: 'photos', width: '160px', type: 'text' },
    { id: 'status', width: '168px', type: 'text' },
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

/** Laravel public URL (storage) from `VITE_API_URL` (e.g. strip trailing `/api`). */
function getApiPublicOrigin(): string {
    const raw = import.meta.env.VITE_API_URL as string | undefined
    if (!raw) return ''
    const trimmed = raw.replace(/\/+$/, '')
    return trimmed.replace(/\/api\/?$/i, '') || trimmed
}

/** Build absolute URL for announce image `path` from `crm_vehicules_images`. */
function resolveAnnounceImageUrl(path: string): string {
    const p = path?.trim() ?? ''
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    const base = getApiPublicOrigin()
    const segment = p.startsWith('/') ? p : `/${p}`
    return base ? `${base}${segment}` : segment
}

const PHOTO_PREVIEW_COUNT = 5

function sortVehiculeImages(images: AnnounceVehiculeImageType[]): AnnounceVehiculeImageType[] {
    return [...images].sort((a, b) => {
        const pa = a.position ?? 999_999
        const pb = b.position ?? 999_999
        if (pa !== pb) return pa - pb
        return a.id - b.id
    })
}

/** Avatar initials from client full name (same idea as UserTable nom / prénom). */
function clientInitialsFromFullName(fullName: string): string {
    const t = fullName.trim()
    if (!t) return '?'
    const parts = t.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
    }
    return t.slice(0, 2).toUpperCase()
}

/** Table `annonces`: 0 non approuvé, 1 approuvé, 4 désactivé */
const STATUS_SELECT_OPTIONS: { value: number; label: string }[] = [
    { value: 0, label: 'Non approuvé' },
    { value: 1, label: 'Approuvé' },
    { value: 4, label: 'Désactivé' },
]

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

const AnnouncesTableComponent = () => {
    const queryClient = useQueryClient()

    const [keyword, setKeyword] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [statusFilter, setStatusFilter] = useState<{ value: number; label: string } | null>(null)
    const [dateFilter, setDateFilter] = useState<Date[]>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })

    const [selectionState, setSelectionState] = useState<SelectionState>({
        selectAll: false,
        selectedIds: new Set<string>(),
        excludedIds: new Set<string>(),
    })
    const [headerCheckState, setHeaderCheckState] = useState<'none' | 'page' | 'all'>('none')

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({
        ...DEFAULT_COLUMN_VISIBILITY,
    }))
    const [filterVisibility, setFilterVisibility] = useState<AnnounceFilterVisibility>(() => ({
        ...DEFAULT_FILTER_VISIBILITY,
    }))

    const [photoGallery, setPhotoGallery] = useState<{
        heading: string
        items: { id: number; src: string }[]
    } | null>(null)

    const sortByRaw = sorting[0]?.id
    const sort_by: AnnounceSortId = ANNOUNCE_SORT_IDS.includes(sortByRaw as AnnounceSortId)
        ? (sortByRaw as AnnounceSortId)
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
            statusFilter,
            cityFilter,
            dateFilter,
            creationPeriodComplete,
        ],
    )

    const { data: announceResponse, isLoading, isError, error } = useQuery({
        queryKey: ['announces', apiParams],
        queryFn: () => loadAnnounces(apiParams),
        staleTime: 30_000,
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: number }) => updateAnnounce(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announces'] })
        },
    })

    const bulkListFilters = useMemo((): AnnounceBulkStatusFilters | undefined => {
        const f: AnnounceBulkStatusFilters = {}
        const kw = keyword.trim()
        if (kw) f.keyword = kw
        if (statusFilter != null) f.status = statusFilter.value
        const cityName = cityFilter.trim()
        if (cityName) f.city_name = cityName
        if (creationPeriodComplete) {
            f.from = formatDateToISO(dateFilter[0])
            f.to = formatDateToISO(dateFilter[1])
        }
        return Object.keys(f).length > 0 ? f : undefined
    }, [keyword, statusFilter, cityFilter, dateFilter, creationPeriodComplete])

    const bulkStatusMutation = useMutation({
        mutationFn: bulkUpdateAnnounceStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announces'] })
            setSelectionState({
                selectAll: false,
                selectedIds: new Set<string>(),
                excludedIds: new Set<string>(),
            })
            setHeaderCheckState('none')
        },
    })

    const data = useMemo(() => announceResponse?.data ?? [], [announceResponse])
    const totalItems = announceResponse?.pagination?.total ?? 0
    const start = announceResponse?.pagination?.from ?? 0
    const end = announceResponse?.pagination?.to ?? 0

    useEffect(() => {
        setSelectionState({
            selectAll: false,
            selectedIds: new Set<string>(),
            excludedIds: new Set<string>(),
        })
        setHeaderCheckState('none')
    }, [keyword, cityFilter, statusFilter, appliedCreationPeriodKey])

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

    const persistFilters = (next: AnnounceFilterVisibility) => {
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
            const p = JSON.parse(raw) as Partial<AnnounceFilterVisibility>
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

    const toggleOptionalFilter = (fid: keyof AnnounceFilterVisibility) => {
        if (fid === 'global') return
        setFilterVisibility((prev) => {
            const next = { ...prev, [fid]: !prev[fid], global: true }
            persistFilters(next)
            return next
        })
    }

    const currentPageIds = useMemo(() => data.map((row) => String(row.id)), [data])

    const isRowSelected = (rowId: string): boolean => {
        if (selectionState.selectAll) {
            return !selectionState.excludedIds.has(rowId)
        }
        return selectionState.selectedIds.has(rowId)
    }

    const getSelectedCount = (): number => {
        if (selectionState.selectAll) {
            return totalItems - selectionState.excludedIds.size
        }
        return selectionState.selectedIds.size
    }

    const areAllCurrentPageSelected = (): boolean =>
        currentPageIds.length > 0 && currentPageIds.every((id) => isRowSelected(id))

    const areSomeCurrentPageSelected = (): boolean =>
        currentPageIds.some((id) => isRowSelected(id)) && !areAllCurrentPageSelected()

    const toggleRowSelection = (rowId: string) => {
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

    const runBulkStatusUpdate = (status: 0 | 1 | 4) => {
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

    const columns: ColumnDef<AnnounceType, any>[] = [
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
            cell: ({ row }: { row: TableRow<AnnounceType> }) => (
                <input
                    type="checkbox"
                    className="form-check-input form-check-input-light fs-14"
                    checked={isRowSelected(String(row.original.id))}
                    onChange={() => toggleRowSelection(String(row.original.id))}
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
        columnHelper.accessor('ref', {
            id: 'ref',
            header: 'Réf.',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-200">{row.original.ref || '—'}</span>
            ),
        }),
        columnHelper.accessor('title', {
            id: 'title',
            header: 'Titre',
            cell: ({ row }) => (
                <span className="fw-medium text-truncate d-inline-block max-w-200">{row.original.title || '—'}</span>
            ),
        }),
        columnHelper.accessor('description', {
            id: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-240" style={{ maxWidth: 240 }}>
                    {row.original.description || '—'}
                </span>
            ),
        }),
        columnHelper.accessor('prix', {
            id: 'prix',
            header: 'Prix',
            cell: ({ row }) => {
                const p = row.original.prix
                const t = row.original.prix_type
                return (
                    <span className="text-nowrap">
                        {p != null ? Number(p).toLocaleString('fr-FR') : '—'}
                        {t ? <small className="text-muted ms-1">{t}</small> : null}
                    </span>
                )
            },
        }),
        columnHelper.accessor('year', {
            id: 'year',
            header: 'Année',
            cell: ({ row }) => <span>{row.original.year ?? '—'}</span>,
        }),
        columnHelper.accessor((row) => row.client_id, {
            id: 'user_id',
            header: 'Client',
            cell: ({ row }) => {
                const c = row.original.client
                const cid = row.original.client_id
                const name =
                    c?.full_name?.trim() || (cid != null && cid !== 0 ? `Client #${cid}` : '—')
                const email = c?.email?.trim() || ''
                const initials = clientInitialsFromFullName(c?.full_name ?? (cid ? String(cid) : ''))
                return (
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title text-bg-primary fw-bold rounded-circle">{initials}</span>
                        </div>
                        <div className="min-w-0">
                            <h5 className="fs-base mb-0 text-truncate" title={name}>
                                {name}
                            </h5>
                            {email ? (
                                <p className="text-muted fs-xs mb-0 text-truncate" title={email}>
                                    {email}
                                </p>
                            ) : null}
                        </div>
                    </div>
                )
            },
        }),
        columnHelper.accessor((row) => row.marque?.name ?? '', {
            id: 'marque',
            header: 'Marque',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-200">
                    {row.original.marque?.name?.trim() || '—'}
                </span>
            ),
        }),
        columnHelper.accessor((row) => row.modele?.name ?? '', {
            id: 'modele',
            header: 'Modèle',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-200">
                    {row.original.modele?.name?.trim() || '—'}
                </span>
            ),
        }),
        columnHelper.accessor((row) => row.finition?.name ?? '', {
            id: 'finition',
            header: 'Finition',
            cell: ({ row }) => (
                <span className="text-truncate d-inline-block max-w-200">
                    {row.original.finition?.name?.trim() || '—'}
                </span>
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
        columnHelper.accessor('store_id', {
            id: 'store_id',
            header: 'Boutique',
            cell: ({ row }) =>
                row.original.store_id != null ? (
                    <span className="text-nowrap">#{row.original.store_id}</span>
                ) : (
                    '—'
                ),
        }),
        columnHelper.display({
            id: 'photos',
            header: 'Photos',
            enableSorting: false,
            cell: ({ row }) => {
                const sorted = sortVehiculeImages(row.original.vehiculeImages ?? [])
                const withUrls = sorted
                    .map((im) => ({ id: im.id, src: resolveAnnounceImageUrl(im.path) }))
                    .filter((x) => Boolean(x.src))
                if (withUrls.length === 0) {
                    return <span className="text-muted">—</span>
                }
                const preview = withUrls.slice(0, PHOTO_PREVIEW_COUNT)
                const extra = withUrls.length - PHOTO_PREVIEW_COUNT
                return (
                    <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none text-start announce-photo-stack"
                        onClick={() =>
                            setPhotoGallery({
                                heading: [row.original.ref, row.original.title].filter(Boolean).join(' — ') || `Annonce #${row.original.id}`,
                                items: withUrls,
                            })
                        }
                        aria-label={`Voir ${withUrls.length} photo${withUrls.length > 1 ? 's' : ''}`}
                    >
                        <div className="d-flex align-items-center flex-nowrap">
                            {preview.map((im, i) => (
                                <div
                                    key={im.id}
                                    className="rounded-circle border border-2 border-white overflow-hidden flex-shrink-0 bg-light shadow-sm"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        marginLeft: i === 0 ? 0 : -12,
                                        zIndex: preview.length - i,
                                    }}
                                >
                                    <img
                                        src={im.src}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                            {extra > 0 ? (
                                <span
                                    className="rounded-pill text-white fw-semibold small px-2 py-1 flex-shrink-0 ms-1"
                                    style={{ background: '#6f42c1', zIndex: preview.length + 2 }}
                                >
                                    +{extra}
                                </span>
                            ) : null}
                        </div>
                    </button>
                )
            },
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Statut',
            enableSorting: false,
            cell: ({ row }) => {
                const id = row.original.id
                const current = row.original.status ?? 0
                const inList = STATUS_SELECT_OPTIONS.some((o) => o.value === current)
                const selected = inList
                    ? STATUS_SELECT_OPTIONS.find((o) => o.value === current)!
                    : { value: current, label: `Statut ${current}` }
                const statusOptions = inList
                    ? STATUS_SELECT_OPTIONS
                    : [...STATUS_SELECT_OPTIONS, selected]
                const busy = statusMutation.isPending && statusMutation.variables?.id === id

                return (
                    <div style={{ minWidth: 168 }} className="announce-table-status-select">
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
                            options={statusOptions}
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
        //     cell: ({ row }: { row: TableRow<AnnounceType> }) => (
        //         <div className="d-flex gap-1">…</div>
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
        pageCount: announceResponse?.pagination?.last_page ?? 0,
    })

    const hasActiveFilters =
        keyword.trim() || statusFilter || cityFilter.trim() || creationPeriodComplete

    return (
        <>
            <Modal show={photoGallery != null} onHide={() => setPhotoGallery(null)} size="lg" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title className="text-truncate me-2" title={photoGallery?.heading}>
                        {photoGallery?.heading}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {photoGallery?.items.map((im) => (
                        <figure key={im.id} className="mb-3 mb-lg-4">
                            <img
                                src={im.src}
                                alt=""
                                className="img-fluid rounded shadow-sm w-100"
                                style={{ maxHeight: '70vh', objectFit: 'contain', background: 'var(--bs-secondary-bg)' }}
                            />
                        </figure>
                    ))}
                </Modal.Body>
            </Modal>

            {/* <div className="d-flex justify-content-end mb-2">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    + Nouvelle annonce
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
                                id="announce-filter-visibility-toggle"
                                aria-label="Choisir les filtres affichés"
                            >
                                <TbFilter className="fs-lg" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm p-3" style={{ minWidth: 280 }}>
                                <div className="fw-semibold small text-dark mb-2">Filtres affichés</div>
                                <Form.Check
                                    id="announce-filter-global"
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
                                        id={`announce-filter-opt-${fid}`}
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
                            {filterVisibility.status && (
                                <Col xs={12} sm={6} lg={3}>
                                    <label className="fw-medium text-dark mb-0 d-block">Statut</label>
                                    <Select
                                        className="react-select mt-2"
                                        classNamePrefix="react-select"
                                        placeholder="Tous"
                                        isClearable
                                        options={STATUS_SELECT_OPTIONS}
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
                                        placeholder="Référence, titre, description…"
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
                                            id="announce-bulk-status-dropdown"
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
                                                Approuvé
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => runBulkStatusUpdate(0)}
                                                disabled={bulkStatusMutation.isPending}
                                            >
                                                Non approuvé
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => runBulkStatusUpdate(4)}
                                                disabled={bulkStatusMutation.isPending}
                                            >
                                                Désactivé
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
                                id="announce-table-columns-toggle"
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
                                        id={`announce-col-locked-${colId}`}
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
                                        id={`announce-col-opt-${colId}`}
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
                        Erreur lors du chargement des annonces: {error?.message}
                    </div>
                ) : (
                    <DataTable<AnnounceType> table={table} emptyMessage="Aucune annonce" />
                )}

                {data.length > 0 && !isLoading && (
                    <CardFooter className="border-0">
                        <TablePagination
                            totalItems={totalItems}
                            start={start}
                            end={end}
                            itemsName="annonces"
                            showInfo
                            previousPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                            }
                            canPreviousPage={pagination.pageIndex > 0}
                            pageCount={announceResponse?.pagination?.last_page ?? 0}
                            pageIndex={pagination.pageIndex}
                            setPageIndex={(index) => setPagination((p) => ({ ...p, pageIndex: index }))}
                            nextPage={() =>
                                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                            }
                            canNextPage={
                                pagination.pageIndex < (announceResponse?.pagination?.last_page ?? 1) - 1
                            }
                        />
                    </CardFooter>
                )}
            </Card>
        </>
    )
}

export default AnnouncesTableComponent
