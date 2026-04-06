import React from 'react'
import { Card } from 'react-bootstrap'
import type { Demande } from '@/services/demandeService'

interface BarcodeDisplayProps {
  demande: Demande
}

/**
 * Component to display the barcode for a demande
 *
 * Usage:
 * <BarcodeDisplay demande={demande} />
 *
 * Optional: Install react-barcode for visual barcode generation:
 * npm install react-barcode
 *
 * Then you can use:
 * import Barcode from 'react-barcode'
 * <Barcode value={demande.code_barre} />
 */
const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ demande }) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <small className="text-muted d-block mb-1">Code-barres</small>
            <h5 className="mb-0 font-monospace">{demande.code_barre}</h5>
          </div>
          <div className="text-end">
            <small className="text-muted d-block">Demande #{demande.id}</small>
            <small className="text-muted">{demande.type_demande}</small>
          </div>
        </div>

        {/* Optional: Add visual barcode here when library is installed */}
        {/* <div className="mt-3">
          <Barcode value={demande.code_barre} height={50} />
        </div> */}
      </Card.Body>
    </Card>
  )
}

export default BarcodeDisplay
