import { Col, Container, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { useEffect, useState } from 'react'
import { loadDashboardData } from '@/services/Dashboard'
import StatCard from "@/views/dashboards/dashboard/components/StatCard"
import StatCardSkeleton from "@/views/dashboards/dashboard/components/StatCardSkeleton"
import { TbTruck, TbUsers, TbClipboardList, TbRoute } from 'react-icons/tb'
import type { StatCardType } from '@/views/dashboards/dashboard/data'
import { useQuery } from '@tanstack/react-query'

const Index = () => {
  // const [statCards, setStatCards] = useState<StatCardType[]>([])
  // const [isLoading, setIsLoading] = useState(true)

  // const { data: dashboardData, isLoading: isDashLoading } = useQuery({
  //   queryKey: ['dashboardStatistics'],
  //   queryFn: loadDashboardData,
  // })

  // useEffect(() => {
  //   if (dashboardData) {
  //     console.log('helllllooooo', dashboardData)
  //     const cards: StatCardType[] = [
  //       {
  //         id: 1,
  //         title: 'Chauffeurs Actifs',
  //         value: dashboardData.active_drivers ,
  //         icon: TbUsers,
  //         iconBg: 'primary',
  //       },
  //       {
  //         id: 2,
  //         title: 'Véhicules Actifs',
  //         value: dashboardData.active_vehicles,
  //         icon: TbTruck,
  //         iconBg: 'success',
  //       },
  //       {
  //         id: 3,
  //         title: 'Clients Actifs',
  //         value: dashboardData.active_clients ,
  //         icon: TbUsers,
  //         iconBg: 'info',
  //       },
  //       {
  //         id: 4,
  //         title: 'Utilisateurs',
  //         value: dashboardData.total_users,
  //         icon: TbClipboardList,
  //         iconBg: 'warning',
  //       },
  //       {
  //         id: 5,
  //         title: 'Total Missions',
  //         value: dashboardData.total_missions,
  //         icon: TbRoute,
  //         iconBg: 'danger',
  //       },
  //       {
  //         id: 6,
  //         title: 'Total Demandes',
  //         value: dashboardData.total_demandes ,
  //         icon: TbClipboardList,
  //         iconBg: 'secondary',
  //       },
  //     ]
  //     setStatCards(cards)
  //     setIsLoading(false)
  //   }
  // }, [dashboardData])

  return (
    <Container fluid>
      <PageBreadcrumb title={'Dashboard'} />
      {/* <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        {isLoading || isDashLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, idx) => (
              <Col key={idx}>
                <StatCardSkeleton />
              </Col>
            ))}
          </>
        ) : (
          statCards.map((item, idx) => (
            <Col key={idx}>
              <StatCard item={item} />
            </Col>
          ))
        )}
      </Row> */}
    </Container>
  )
}

export default Index
