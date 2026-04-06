
import clsx from 'clsx'
import { Col, Row } from 'react-bootstrap'
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb'

export type TablePaginationProps = {
  totalItems: number
  start: number
  end: number
  itemsName?: string
  showInfo?: boolean
  // Pagination control props
  previousPage: () => void
  canPreviousPage: boolean
  pageCount: number
  pageIndex: number
  setPageIndex: (index: number) => void
  nextPage: () => void
  canNextPage: boolean
  className?: string
}

// Helper function to generate pagination numbers with ellipsis
const generatePaginationNumbers = (pageIndex: number, pageCount: number): (number | string)[] => {
  const delta = 2 // How many pages to show around current page
  const left = pageIndex - delta
  const right = pageIndex + delta + 1
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  for (let i = 0; i < pageCount; i++) {
    if (i < delta || i === pageCount - 1 || (i > left && i < right)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
}

const TablePagination = ({
  totalItems,
  start,
  end,
  itemsName = 'items',
  showInfo,
  previousPage,
  canPreviousPage,
  pageCount,
  pageIndex,
  setPageIndex,
  nextPage,
  canNextPage,
  className
}: TablePaginationProps) => {
  const paginationNumbers = generatePaginationNumbers(pageIndex, pageCount)

  return (
    <Row className={clsx('align-items-center text-center text-sm-start', showInfo ? 'justify-content-between' : 'justify-content-end')}>
      {showInfo && (
        <Col sm>
          <div className="text-muted">
            Affichage de <span className="fw-semibold">{start}</span> à <span className="fw-semibold">{end}</span> sur{' '}
            <span className="fw-semibold">{totalItems}</span> {itemsName}
          </div>
        </Col>
      )}
      <Col sm="auto" className="mt-3 mt-sm-0">
        <div>
          <ul className={clsx('pagination pagination-boxed mb-0 justify-content-center pagination-sm', className)}>
            <li className="page-item">
              <button className="page-link" onClick={() => previousPage()} disabled={!canPreviousPage}>
                <TbChevronLeft />
              </button>
            </li>

            {paginationNumbers.map((num, index) =>
              num === '...' ? (
                <li key={`ellipsis-${index}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              ) : (
                <li key={num} className={`page-item ${pageIndex === num ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPageIndex(num as number)}>
                    {(num as number) + 1}
                  </button>
                </li>
              )
            )}
            <li className="page-item">
              <button className="page-link" onClick={() => nextPage()} disabled={!canNextPage}>
                <TbChevronRight />
              </button>
            </li>
          </ul>
        </div>
      </Col>
    </Row>
  )
}

export default TablePagination