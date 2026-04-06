import { Card, CardBody } from 'react-bootstrap'
import './statcard-skeleton.scss'

const StatCardSkeleton = () => {
    return (
        <Card>
            <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="avatar fs-60 avatar-img-size flex-shrink-0">
                        <span className="skeleton-stat-icon" />
                    </div>
                    <div className="text-end">
                        <h3 className="mb-2 fw-normal">
                            <div className="skeleton-stat-number" />
                        </h3>
                        <p className="mb-0 text-muted">
                            <div className="skeleton-stat-text" />
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default StatCardSkeleton
