import { useState } from 'react'
import { useDemandes, useDemandeActions, useDemandeStatistics } from '@/hooks/useDemandes'
import type { Demande } from '@/services/demandeService'

/**
 * Example Component: Demandes List
 * Demonstrates how to use the demandes API in a React component
 */
export default function DemandesListExample() {
  // State for filters
  const [statusFilter, setStatusFilter] = useState<Demande['status'] | undefined>()
  const [typeFilter, setTypeFilter] = useState<'Transport' | 'Messagerie' | undefined>()

  // Fetch demandes with filters
  const { demandes, loading, error, refetch, pagination } = useDemandes({
    status: statusFilter,
    type_demande: typeFilter,
    per_page: 10,
  })

  // Demande actions (create, update, delete)
  const { updateStatus, remove, loading: actionLoading } = useDemandeActions()

  // Statistics
  const { statistics } = useDemandeStatistics()

  // Handle status update
  const handleStatusUpdate = async (id: number, newStatus: Demande['status']) => {
    try {
      await updateStatus(id, newStatus)
      refetch() // Refresh the list
      alert('Status updated successfully!')
    } catch (err) {
      alert('Failed to update status')
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this demande?')) return

    try {
      await remove(id)
      refetch() // Refresh the list
      alert('Demande deleted successfully!')
    } catch (err) {
      alert('Failed to delete demande')
    }
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Statistics Cards */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Demandes</h5>
                <h2>{statistics.total}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Packages</h5>
                <h2>{statistics.total_packages}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Weight</h5>
                <h2>{statistics.total_weight} T</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Transport</h5>
                <h2>{statistics.by_type.Transport || 0}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label>Filter by Status:</label>
              <select
                className="form-select"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value as Demande['status'] || undefined)}
              >
                <option value="">All</option>
                <option value="À planifier">À planifier</option>
                <option value="Planifiée">Planifiée</option>
                <option value="Enlèvement en cours">Enlèvement en cours</option>
                <option value="Enlevée">Enlevée</option>
                <option value="En livraison">En livraison</option>
                <option value="Livrée">Livrée</option>
                <option value="Anomalie">Anomalie</option>
                <option value="Clôturée">Clôturée</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>Filter by Type:</label>
              <select
                className="form-select"
                value={typeFilter || ''}
                onChange={(e) => setTypeFilter(e.target.value as 'Transport' | 'Messagerie' || undefined)}
              >
                <option value="">All</option>
                <option value="Transport">Transport</option>
                <option value="Messagerie">Messagerie</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-secondary" onClick={refetch}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demandes Table */}
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Demandes List</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Colis</th>
                  <th>Tonnes</th>
                  <th>Date Enlèvement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((demande) => (
                  <tr key={demande.id}>
                    <td>#{demande.id}</td>
                    <td>
                      <div>
                        <strong>{demande.client.raison_sociale}</strong>
                        <br />
                        <small className="text-muted">
                          {demande.client.prenom} {demande.client.nom}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          demande.type_demande === 'Transport'
                            ? 'bg-primary'
                            : 'bg-info'
                        }`}
                      >
                        {demande.type_demande}
                      </span>
                    </td>
                    <td>
                      {demande.nombre_colies} ({demande.tailles_colies})
                    </td>
                    <td>{demande.nombre_tonne} T</td>
                    <td>{demande.date_enlevement_formatted}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={demande.status}
                        onChange={(e) =>
                          handleStatusUpdate(demande.id, e.target.value as Demande['status'])
                        }
                        disabled={actionLoading}
                      >
                        <option value="À planifier">À planifier</option>
                        <option value="Planifiée">Planifiée</option>
                        <option value="Enlèvement en cours">Enlèvement en cours</option>
                        <option value="Enlevée">Enlevée</option>
                        <option value="En livraison">En livraison</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Anomalie">Anomalie</option>
                        <option value="Clôturée">Clôturée</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(demande.id)}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {pagination && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
              </div>
              <div>
                Page {pagination.current_page} of {pagination.last_page}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
