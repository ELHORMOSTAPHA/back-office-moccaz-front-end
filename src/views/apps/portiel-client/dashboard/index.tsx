import { Card, CardBody, Col, Container, Row, Spinner, Alert } from 'react-bootstrap'
import {
  LuShoppingCart,
  LuClipboardList,
  LuTruck,
  LuPackageCheck,
  LuCircleCheck,
  LuTriangleAlert,
  LuArchive
} from 'react-icons/lu'
import { useState, useEffect } from 'react'

import PageBreadcrumb from '@/components/PageBreadcrumb'
import { getAllDemandes, type Demande } from '@/services/demandeService'
import { useAuth } from '@/context/AuthProvider'

const Dashboard = () => {
  const { user } = useAuth()
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get client ID from authenticated user
  const clientId = user?.client?.id

  useEffect(() => {
    const fetchDemandes = async () => {
      // Don't fetch if client ID is not available yet
      if (!clientId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await getAllDemandes({ id_client: clientId })
        setDemandes(response.data)
      } catch (err) {
        console.error('Error fetching demandes:', err)
        setError('Erreur lors du chargement des données. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchDemandes()
  }, [clientId])

  // Calculate stats from real data
  const stats = [
    {
      title: 'TOUS LES DEMANDES',
      value: demandes.length,
      icon: LuShoppingCart,
      iconColor: 'text-success',
      bgColor: 'bg-success-subtle'
    },
    {
      title: 'À PLANIFIER',
      value: demandes.filter(d => d.status === 'À planifier').length,
      icon: LuClipboardList,
      iconColor: 'text-warning',
      bgColor: 'bg-warning-subtle'
    },
    {
      title: 'PLANIFIÉE',
      value: demandes.filter(d => d.status === 'Planifiée').length,
      icon: LuTruck,
      iconColor: 'text-primary',
      bgColor: 'bg-primary-subtle'
    },
    {
      title: 'TRAITEMENT EN COURS',
      value: demandes.filter(d => d.status === 'Traitement en cours').length,
      icon: LuPackageCheck,
      iconColor: 'text-info',
      bgColor: 'bg-info-subtle'
    },
    {
      title: 'LIVRÉE',
      value: demandes.filter(d => d.status === 'Livrée').length,
      icon: LuCircleCheck,
      iconColor: 'text-success',
      bgColor: 'bg-success-subtle'
    },
    {
      title: 'CLÔTURÉE',
      value: demandes.filter(d => d.status === 'Clôturée').length,
      icon: LuArchive,
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary-subtle'
    },
    {
      title: 'ANOMALIE',
      value: demandes.filter(d => d.status === 'Anomalie').length,
      icon: LuTriangleAlert,
      iconColor: 'text-danger',
      bgColor: 'bg-danger-subtle'
    }
  ]

  return (
    <Container fluid>
      <PageBreadcrumb title="Tableau de bord" subtitle="Portail Client" />

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement des données...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {!loading && !error && (
        <Row className="g-3">
          {stats.map((stat, index) => (
            <Col key={index} xl={4} md={6}>
              <Card className="card-height-100">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="flex-grow-1">
                      <p className="text-muted text-uppercase fw-medium fs-xs mb-2">
                        {stat.title}
                      </p>
                      <h2 className="mb-0 fw-bold">{stat.value.toLocaleString()}</h2>
                    </div>
                    <div className={`avatar-sm ${stat.bgColor} rounded-circle d-flex align-items-center justify-content-center`}>
                      <stat.icon className={`fs-3 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

export default Dashboard
