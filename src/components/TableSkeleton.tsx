import './skeleton.scss'

export interface SkeletonColumn {
    id: string
    width?: string
    type?: 'checkbox' | 'avatar' | 'text' | 'badge' | 'actions'
}

interface TableSkeletonProps {
    rows?: number
    columns: SkeletonColumn[]
}

const TableSkeleton = ({ rows = 5, columns }: TableSkeletonProps) => {
    const renderSkeletonCell = (col: SkeletonColumn) => {
        switch (col.type) {
            case 'checkbox':
                return <div className="skeleton-checkbox" />

            case 'avatar':
                return (
                    <div className="skeleton-user">
                        <div className="skeleton-avatar" />
                        <div className="skeleton-text-group">
                            <div className="skeleton-text skeleton-text-long" />
                            <div className="skeleton-text skeleton-text-short" />
                        </div>
                    </div>
                )

            case 'badge':
                return <div className="skeleton-badge" />

            case 'actions':
                return (
                    <div className="skeleton-actions">
                        <div className="skeleton-action-btn" />
                        <div className="skeleton-action-btn" />
                        <div className="skeleton-action-btn" />
                    </div>
                )

            case 'text':
            default:
                return <div className="skeleton-text" />
        }
    }

    return (
        <div className="table-skeleton-wrapper">
            <table className="table mb-0">
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <tr key={rowIdx} className="skeleton-row">
                            {columns.map((col) => (
                                <td
                                    key={col.id}
                                    className="skeleton-cell"
                                    style={{ width: col.width }}
                                >
                                    {renderSkeletonCell(col)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TableSkeleton
