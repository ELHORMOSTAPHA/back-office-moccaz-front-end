import { useState, useEffect } from 'react'
import { Button, CardBody, Col, Form, FormControl, FormGroup, FormLabel, Row, Spinner } from 'react-bootstrap'
import { TbPlus, TbTrash, TbArrowRight } from 'react-icons/tb'
import Flatpickr from 'react-flatpickr'
import { createDemande, type CreateDemandeDTO } from '@/services/demandeService'
import { createTrajet, type CreateTrajetDTO } from '@/services/trajetService'
import { getClientDepots, type Depot } from '@/services/depotService'
import { getTypeVehicules, type TypeVehicule } from '@/services/typeVehiculeService'
import { getAllVilles, type Ville } from '@/services/villeService'
import { loadTonnages } from '@/services/vehicule'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useNotificationModal } from '@/hooks/useNotificationModal'
import French from 'flatpickr/dist/l10n/fr'
import Select from 'react-select'
import { useQuery } from '@tanstack/react-query'

import { ErrorModal, SuccessModal } from '@/components/modals'

interface Trajet {
  id: string
  villeDepart: string
  villeArrivee: string
  nombreColies?: string
  taillesColies?: string
  nombreCartons?: string
  heureLivraison?: string
  manutention?: string
  retour?: string
  commentaire?: string
}

interface SelectOption {
  value: string
  label: string
}

const DemandeForm = () => {
  const { data: user } = useCurrentUser()
  const { error, success } = useNotificationModal()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [typeDemande, setTypeDemande] = useState<string>('')
  const [dateEnlevement, setDateEnlevement] = useState<Date | null>(null)
  const [dateLivraisonSouhaitee, setDateLivraisonSouhaitee] = useState<Date | null>(null)
  const [tonnage, setTonnage] = useState<string>('')
  const [typeVehicule, setTypeVehicule] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [clientDepots, setClientDepots] = useState<Depot[]>([])
  const [loadingDepots, setLoadingDepots] = useState(false)
  const [typeVehicules, setTypeVehicules] = useState<TypeVehicule[]>([])
  const [loadingTypeVehicules, setLoadingTypeVehicules] = useState(false)
  const [villes, setVilles] = useState<Ville[]>([])
  const [loadingVilles, setLoadingVilles] = useState(false)

  // Fetch tonnages using useQuery - only when typeVehicule is selected
  const { data: tonnagesData = [], isLoading: loadingTonnages } = useQuery({
    queryKey: ['tonnages', typeVehicule],
    queryFn: () => loadTonnages({ id_type_vehicule: typeVehicule ? parseInt(typeVehicule) : undefined }),
    enabled: !!typeVehicule, // Only fetch when typeVehicule is selected
    staleTime: Infinity,
    gcTime: Infinity
  })

  // City mapping - maps city names to IDs from the database (case-insensitive)
  const getCityId = (cityName: string): number => {
    const cityMapping: Record<string, number> = {
      'casablanca': 4,
      'rabat': 5,
      'tanger': 6,
      'marrakech': 7,
      'fès': 8,
      'fes': 8,
      'agadir': 9,
      'meknès': 10,
      'meknes': 10,
      'oujda': 11,
      'salé': 12,
      'sale': 12
    }

    return cityMapping[cityName.toLowerCase()] || 4
  }

  const [trajets, setTrajets] = useState<Trajet[]>([
    {
      id: '1',
      villeDepart: '',
      villeArrivee: '',
      nombreColies: '',
      taillesColies: '',
      nombreCartons: '',
      heureLivraison: '',
      manutention: 'Non',
      retour: 'Non',
      commentaire: ''
    }
  ])

  // Options for various select fields
  const typeDemandeOptions: SelectOption[] = [
    { value: 'Transport', label: 'Transport' },
    { value: 'Messagerie', label: 'Messagerie' }
  ]

  const tonnageOptions: SelectOption[] = tonnagesData.map(tonnage => ({
    value: tonnage.toString(),
    label: `${tonnage} T`
  }))

  const tailleOptions: SelectOption[] = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: 'XXXL', label: 'XXXL' }
  ]

  const ouiNonOptions: SelectOption[] = [
    { value: 'Non', label: 'Non' },
    { value: 'Oui', label: 'Oui' }
  ]

  const heureOptions: SelectOption[] = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0')
    const minute = i % 2 === 0 ? '00' : '30'
    const time = `${hour}:${minute}`
    return { value: time, label: time }
  })

  // Reset tonnage when type vehicule changes
  useEffect(() => {
    setTonnage('')
  }, [typeVehicule])

  // Fetch client's depots when component mounts or user changes
  useEffect(() => {
    const fetchDepots = async () => {
      if (user && user.client) {
        setLoadingDepots(true)
        try {
          const depots = await getClientDepots()
          setClientDepots(depots)
        } catch (err) {
          console.error('Error fetching depots:', err)
        } finally {
          setLoadingDepots(false)
        }
      }
    }

    fetchDepots()
  }, [user])

  // Fetch type vehicules when component mounts
  useEffect(() => {
    const fetchTypeVehicules = async () => {
      setLoadingTypeVehicules(true)
      try {
        const types = await getTypeVehicules()
        setTypeVehicules(types)
      } catch (err) {
        console.error('Error fetching type vehicules:', err)
      } finally {
        setLoadingTypeVehicules(false)
      }
    }

    fetchTypeVehicules()
  }, [])

  // Fetch villes when component mounts
  useEffect(() => {
    const fetchVilles = async () => {
      setLoadingVilles(true)
      try {
        const villesData = await getAllVilles()
        console.log('Villes fetched:', villesData)
        setVilles(villesData)
      } catch (err) {
        console.error('Error fetching villes:', err)
      } finally {
        setLoadingVilles(false)
      }
    }

    fetchVilles()
  }, [])

  // Convert data to Select options
  const typeVehiculeOptions: SelectOption[] = typeVehicules.map(type => ({
    value: type.id.toString(),
    label: type.libelle_type_vehicule
  }))

  const villeOptions: SelectOption[] = villes.map(ville => ({
    value: ville.id.toString(),
    label: ville.nom_ville
  }))

  const depotOptions: SelectOption[] = clientDepots.map(depot => ({
    value: depot.id.toString(),
    label: `${depot.nom_depot} - ${depot.ville_depot}`
  }))

  const addTrajet = () => {
    const newTrajet: Trajet = {
      id: Date.now().toString(),
      villeDepart: '',
      villeArrivee: '',
      nombreColies: '',
      taillesColies: '',
      nombreCartons: '',
      heureLivraison: '',
      manutention: 'Non',
      retour: 'Non',
      commentaire: ''
    }
    setTrajets([...trajets, newTrajet])
  }

  const removeTrajet = (id: string) => {
    if (trajets.length > 1) {
      setTrajets(trajets.filter(trajet => trajet.id !== id))
    }
  }

  const updateTrajet = (id: string, field: keyof Trajet, value: string) => {
    setTrajets(trajets.map(trajet =>
      trajet.id === id ? { ...trajet, [field]: value } : trajet
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        error.show('Utilisateur non connecté. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      const clientId = user.client?.id

      if (!clientId) {
        error.show('Impossible de récupérer les informations du client. Veuillez réessayer.')
        setLoading(false)
        return
      }

      for (let i = 0; i < trajets.length; i++) {
        const trajet = trajets[i]

        if (trajet.villeDepart === trajet.villeArrivee) {
          if (typeDemande === 'Transport') {
            error.show(`Trajet ${i + 1}: Le dépôt d'arrivée doit être différent du dépôt de départ`)
          } else {
            error.show(`Trajet ${i + 1}: La ville d'arrivée doit être différente de la ville de départ`)
          }
          setLoading(false)
          return
        }

        if (!trajet.villeDepart || !trajet.villeArrivee) {
          if (typeDemande === 'Transport') {
            error.show(`Trajet ${i + 1}: Veuillez sélectionner les dépôts de départ et d'arrivée`)
          } else {
            error.show(`Trajet ${i + 1}: Veuillez sélectionner les villes de départ et d'arrivée`)
          }
          setLoading(false)
          return
        }
      }

      const firstTrajet = trajets[0]

      let villeDepartId: number
      let villeArriveeId: number

      if (typeDemande === 'Transport') {
        const depotDepartId = parseInt(firstTrajet.villeDepart)
        const depotArriveeId = parseInt(firstTrajet.villeArrivee)

        const depotDepart = clientDepots.find(d => d.id === depotDepartId)
        const depotArrivee = clientDepots.find(d => d.id === depotArriveeId)

        console.log('Depot Depart:', depotDepart)
        console.log('Depot Arrivee:', depotArrivee)

        villeDepartId = depotDepart ? getCityId(depotDepart.ville_depot) : 4
        villeArriveeId = depotArrivee ? getCityId(depotArrivee.ville_depot) : 5

        console.log('Ville Depart ID:', villeDepartId, '(from city:', depotDepart?.ville_depot, ')')
        console.log('Ville Arrivee ID:', villeArriveeId, '(from city:', depotArrivee?.ville_depot, ')')
      } else {
        villeDepartId = parseInt(firstTrajet.villeDepart)
        villeArriveeId = parseInt(firstTrajet.villeArrivee)
      }

      const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day} 00:00:00`
      }

      const demandeData: CreateDemandeDTO = {
        id_client: clientId,
        type_demande: typeDemande as 'Transport' | 'Messagerie',
        nombre_tonne: tonnage && typeDemande === 'Transport' ? parseFloat(tonnage) : 0,
        date_enlevement: dateEnlevement ? formatDate(dateEnlevement) : '',
        status: 'À planifier',
        adresse_enlevement: 'Adresse enlèvement',
        adresse_livraison: 'Adresse livraison',
        id_ville_depart: villeDepartId,
        id_ville_arrivee: villeArriveeId,
        notes: ''
      }

      if (typeVehicule && typeDemande === 'Transport') {
        demandeData.id_type_vehicule = parseInt(typeVehicule)
      }

      // For Messagerie, set date_livraison_souhaitee to date_enlevement + 48h
      if (typeDemande === 'Messagerie' && dateEnlevement) {
        const dateLivraison = new Date(dateEnlevement)
        dateLivraison.setHours(dateLivraison.getHours() + 48)
        demandeData.date_livraison_souhaitee = formatDate(dateLivraison)
      } else if (dateLivraisonSouhaitee) {
        demandeData.date_livraison_souhaitee = formatDate(dateLivraisonSouhaitee)
      }

      console.log('Creating demande:', demandeData)
      const demandeResponse = await createDemande(demandeData)
      const demandeId = demandeResponse.data.id

      console.log('Demande created with ID:', demandeId)

      try {
        for (let i = 0; i < trajets.length; i++) {
          const trajet = trajets[i]

          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }

          let trajetVilleDepartId: number
          let trajetVilleArriveeId: number
          let depotDepartId: number | undefined
          let depotArriveeId: number | undefined

          if (typeDemande === 'Transport') {
            depotDepartId = parseInt(trajet.villeDepart)
            depotArriveeId = parseInt(trajet.villeArrivee)

            const depotDepart = clientDepots.find(d => d.id === depotDepartId)
            const depotArrivee = clientDepots.find(d => d.id === depotArriveeId)

            trajetVilleDepartId = depotDepart ? getCityId(depotDepart.ville_depot) : villeDepartId
            trajetVilleArriveeId = depotArrivee ? getCityId(depotArrivee.ville_depot) : villeArriveeId
          } else {
            trajetVilleDepartId = parseInt(trajet.villeDepart)
            trajetVilleArriveeId = parseInt(trajet.villeArrivee)
          }

          // Calculate date_arrivee based on type_demande
          let dateArrivee = ''
          if (typeDemande === 'Messagerie' && dateEnlevement) {
            // For Messagerie: always set date_arrivee to date_depart + 48 hours
            const dateLivraison = new Date(dateEnlevement)
            dateLivraison.setHours(dateLivraison.getHours() + 48)
            dateArrivee = formatDate(dateLivraison)
          } else if (dateLivraisonSouhaitee) {
            // For Transport: use date_livraison_souhaitee
            dateArrivee = formatDate(dateLivraisonSouhaitee)
          } else if (dateEnlevement) {
            // Fallback: use date_enlevement
            dateArrivee = formatDate(dateEnlevement)
          }

          const trajetData: CreateTrajetDTO = {
            type_voyage: typeDemande as 'Transport' | 'Messagerie',
            id_demande: demandeId,
            id_client: clientId,
            date_depart: dateEnlevement ? formatDate(dateEnlevement) : '',
            date_arrivee: dateArrivee,
            id_ville_depart: trajetVilleDepartId,
            id_ville_arrivee: trajetVilleArriveeId,
            status: 'À planifier',
            nombre_colies: trajet.nombreColies ? parseInt(trajet.nombreColies) : trajet.nombreCartons ? parseInt(trajet.nombreCartons) : undefined,
            tailles_colies: trajet.taillesColies || undefined,
            manutention: trajet.manutention === 'Oui',
            retour: trajet.retour === 'Oui',
            heure_livraison: trajet.heureLivraison || undefined,
            notes: trajet.commentaire || undefined
          }

          if (typeDemande === 'Transport' && depotDepartId && depotArriveeId) {
            trajetData.id_depot_depart = depotDepartId
            trajetData.id_depot_arrivee = depotArriveeId
          }

          console.log('Creating trajet:', trajetData)
          await createTrajet(trajetData)
        }

        success.show('Demande créée avec succès!')

        setTimeout(() => {
          setCurrentStep(1)
          setTypeDemande('')
          setDateEnlevement(null)
          setDateLivraisonSouhaitee(null)
          setTonnage('')
          setTypeVehicule('')
          setTrajets([{
            id: '1',
            villeDepart: '',
            villeArrivee: '',
            nombreColies: '',
            taillesColies: '',
            nombreCartons: '',
            heureLivraison: '',
            manutention: 'Non',
            retour: 'Non',
            commentaire: ''
          }])
          success.hide()
        }, 2000)
      } catch (trajetError: any) {
        console.error('Error creating trajets:', trajetError)

        const trajetErrorMessage = trajetError.response?.data?.message || trajetError.response?.data?.errors || 'Erreur lors de la création des trajets'

        if (typeof trajetErrorMessage === 'object') {
          const errors = Object.values(trajetErrorMessage).flat().join(', ')
          error.show(`Demande créée (ID: ${demandeId}) mais erreur lors de la création des trajets: ${errors}`)
        } else {
          error.show(`Demande créée (ID: ${demandeId}) mais erreur lors de la création des trajets: ${trajetErrorMessage}`)
        }
        throw trajetError
      }

    } catch (err: any) {
      console.error('Error creating demande:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Erreur lors de la création de la demande'

      if (typeof errorMessage === 'object') {
        const errors = Object.values(errorMessage).flat().join(', ')
        error.show(errors)
      } else {
        error.show(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (typeDemande) {
      setCurrentStep(2)
    }
  }

  const handleBackStep = () => {
    setCurrentStep(1)
  }

  return (
    <>
      <ErrorModal
        show={error.isOpen}
        message={error.message}
        onHide={error.hide}
      />

      <SuccessModal
        show={success.isOpen}
        message={success.message}
        onHide={success.hide}
        autoClose={true}
        autoCloseDelay={2000}
      />

      <Form onSubmit={handleSubmit}>
        <CardBody className="p-4">

        {currentStep === 1 && (
          <>
            <h4 className="mb-4">Informations de la Demande</h4>

            <div className="text-center mb-5">
              <p className="text-muted mb-4">Sélectionnez le type de demande pour commencer</p>
            </div>

            <Row className="mb-4">
              <FormGroup as={Col} md={6}>
                <FormLabel>
                  Type de Demande <span className="text-danger">*</span>
                </FormLabel>
                <Select
                  options={typeDemandeOptions}
                  value={typeDemandeOptions.find(opt => opt.value === typeDemande) || null}
                  onChange={(option) => setTypeDemande(option?.value || '')}
                  placeholder="Sélectionner un type"
                  isClearable
                  required
                />
              </FormGroup>
            </Row>

            <div className="d-flex justify-content-between mt-5">
              <div></div>
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={!typeDemande}
              >
                Continuer <TbArrowRight className="ms-2" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="d-flex align-items-center gap-3 mb-4">
              <Button
                variant="light"
                size="sm"
                onClick={handleBackStep}
              >
                ← Retour
              </Button>
              <h4 className="mb-0">Informations de la Demande</h4>
              <span className="badge bg-info">
                {typeDemande === 'Transport' ? '🚚 Transport' : '📦 Messagerie'}
              </span>
            </div>

            <Row className="mb-4">
              <FormGroup as={Col} md={6}>
                <FormLabel>
                  Date d'Enlèvement <span className="text-danger">*</span>
                </FormLabel>
                <Flatpickr
                  className="form-control"
                  placeholder="JJ/MM/AAAA"
                  value={dateEnlevement || undefined}
                  onChange={([date]) => setDateEnlevement(date)}
                  options={{
                    enableTime: false,
                    dateFormat: 'd/m/Y',
                    locale: French.fr,
                    minDate: 'today'
                  }}
                  required
                />
              </FormGroup>

              {typeDemande === 'Transport' && (
                <FormGroup as={Col} md={6}>
                  <FormLabel>
                    Date de Livraison Souhaitée <span className="text-danger">*</span>
                  </FormLabel>
                  <Flatpickr
                    className="form-control"
                    placeholder="JJ/MM/AAAA"
                    value={dateLivraisonSouhaitee || undefined}
                    onChange={([date]) => setDateLivraisonSouhaitee(date)}
                    options={{
                      enableTime: false,
                      dateFormat: 'd/m/Y',
                      locale: French.fr,
                      minDate: 'today'
                    }}
                    required
                  />
                </FormGroup>
              )}
            </Row>

            {typeDemande === 'Transport' && (
              <>
                <Row className="mb-4">
                  <FormGroup as={Col} md={4}>
                    <FormLabel>
                      Type de Véhicule <span className="text-danger">*</span>
                    </FormLabel>
                    <Select
                      options={typeVehiculeOptions}
                      value={typeVehiculeOptions.find(opt => opt.value === typeVehicule) || null}
                      onChange={(option) => setTypeVehicule(option?.value || '')}
                      placeholder={loadingTypeVehicules ? 'Chargement des types...' : 'Sélectionner un type de véhicule'}
                      isLoading={loadingTypeVehicules}
                      isDisabled={loadingTypeVehicules}
                      isClearable
                      required
                    />
                    {typeVehicules.length === 0 && !loadingTypeVehicules && (
                      <small className="text-muted">Aucun type de véhicule disponible</small>
                    )}
                  </FormGroup>
                  <FormGroup as={Col} md={4}>
                    <FormLabel>
                      Tonnage <span className="text-danger">*</span>
                    </FormLabel>
                    <Select
                      options={tonnageOptions}
                      value={tonnageOptions.find(opt => opt.value === tonnage) || null}
                      onChange={(option) => setTonnage(option?.value || '')}
                      placeholder={loadingTonnages ? 'Chargement...' : 'Sélectionner le tonnage'}
                      isClearable
                      required
                      isLoading={loadingTonnages}
                      isDisabled={loadingTonnages}
                    />
                    <small className="text-muted">Poids en tonnes (T)</small>
                  </FormGroup>
                </Row>
              </>
            )}

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Trajets</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addTrajet}
              >
                <TbPlus className="me-1" /> Ajouter un trajet
              </Button>
            </div>

            {trajets.map((trajet, index) => (
              <div key={trajet.id} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Trajet {index + 1}</h6>
                  {trajets.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeTrajet(trajet.id)}
                    >
                      <TbTrash className="me-1" /> Supprimer
                    </Button>
                  )}
                </div>

                <Row>
                  {typeDemande === 'Messagerie' ? (
                    <>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Ville de départ <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={villeOptions}
                          value={villeOptions.find(opt => opt.value === trajet.villeDepart) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'villeDepart', option?.value || '')}
                          placeholder={loadingVilles ? 'Chargement des villes...' : 'Sélectionner une ville'}
                          isLoading={loadingVilles}
                          isDisabled={loadingVilles}
                          isClearable
                          required
                        />
                        {villes.length === 0 && !loadingVilles && (
                          <small className="text-muted">Aucune ville disponible</small>
                        )}
                      </FormGroup>

                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Ville d'arrivée <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={villeOptions}
                          value={villeOptions.find(opt => opt.value === trajet.villeArrivee) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'villeArrivee', option?.value || '')}
                          placeholder={loadingVilles ? 'Chargement des villes...' : 'Sélectionner une ville'}
                          isLoading={loadingVilles}
                          isDisabled={loadingVilles}
                          isClearable
                          required
                        />
                        {villes.length === 0 && !loadingVilles && (
                          <small className="text-muted">Aucune ville disponible</small>
                        )}
                      </FormGroup>
                    </>
                  ) : (
                    <>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Dépôt de Départ <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={depotOptions}
                          value={depotOptions.find(opt => opt.value === trajet.villeDepart) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'villeDepart', option?.value || '')}
                          placeholder={loadingDepots ? 'Chargement des dépôts...' : 'Sélectionner un dépôt'}
                          isLoading={loadingDepots}
                          isDisabled={loadingDepots}
                          isClearable
                          required
                        />
                        {clientDepots.length === 0 && !loadingDepots && (
                          <small className="text-muted">Aucun dépôt disponible</small>
                        )}
                      </FormGroup>

                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Dépôt d'Arrivée <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={depotOptions}
                          value={depotOptions.find(opt => opt.value === trajet.villeArrivee) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'villeArrivee', option?.value || '')}
                          placeholder={loadingDepots ? 'Chargement des dépôts...' : 'Sélectionner un dépôt'}
                          isLoading={loadingDepots}
                          isDisabled={loadingDepots}
                          isClearable
                          required
                        />
                        {clientDepots.length === 0 && !loadingDepots && (
                          <small className="text-muted">Aucun dépôt disponible</small>
                        )}
                      </FormGroup>
                    </>
                  )}
                </Row>

                {typeDemande === 'Messagerie' && (
                  <>
                    <Row className="mt-3">
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Nombre de colis <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl
                          type="number"
                          placeholder="Ex: 15"
                          min="1"
                          value={trajet.nombreColies || ''}
                          onChange={(e) => updateTrajet(trajet.id, 'nombreColies', e.target.value)}
                          required
                        />
                      </FormGroup>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Taille <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={tailleOptions}
                          value={tailleOptions.find(opt => opt.value === trajet.taillesColies) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'taillesColies', option?.value || '')}
                          placeholder="Sélectionner"
                          isClearable
                          required
                        />
                      </FormGroup>
                    </Row>
                    <Row className="mt-3">
                      <FormGroup as={Col} md={6}>
                        <FormLabel>Retour</FormLabel>
                        <Select
                          options={ouiNonOptions}
                          value={ouiNonOptions.find(opt => opt.value === trajet.retour) || ouiNonOptions[0]}
                          onChange={(option) => updateTrajet(trajet.id, 'retour', option?.value || 'Non')}
                          placeholder="Sélectionner"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>Commentaire</FormLabel>
                        <FormControl
                          as="textarea"
                          rows={2}
                          placeholder="Ajouter un commentaire facultatif..."
                          value={trajet.commentaire || ''}
                          onChange={(e) => updateTrajet(trajet.id, 'commentaire', e.target.value)}
                        />
                      </FormGroup>
                    </Row>
                  </>
                )}

                {typeDemande === 'Transport' && (
                  <>
                    <Row className="mt-3">
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Nombre de cartons <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl
                          type="number"
                          placeholder="Ex: 15"
                          min="1"
                          value={trajet.nombreCartons || ''}
                          onChange={(e) => updateTrajet(trajet.id, 'nombreCartons', e.target.value)}
                          required
                        />
                      </FormGroup>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>
                          Heure de Livraison <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          options={heureOptions}
                          value={heureOptions.find(opt => opt.value === trajet.heureLivraison) || null}
                          onChange={(option) => updateTrajet(trajet.id, 'heureLivraison', option?.value || '')}
                          placeholder="Sélectionner une heure"
                          isClearable
                          required
                        />
                      </FormGroup>
                    </Row>
                    <Row className="mt-3">
                      <FormGroup as={Col} md={6}>
                        <FormLabel>Manutention</FormLabel>
                        <Select
                          options={ouiNonOptions}
                          value={ouiNonOptions.find(opt => opt.value === trajet.manutention) || ouiNonOptions[0]}
                          onChange={(option) => updateTrajet(trajet.id, 'manutention', option?.value || 'Non')}
                          placeholder="Sélectionner"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md={6}>
                        <FormLabel>Retour</FormLabel>
                        <Select
                          options={ouiNonOptions}
                          value={ouiNonOptions.find(opt => opt.value === trajet.retour) || ouiNonOptions[0]}
                          onChange={(option) => updateTrajet(trajet.id, 'retour', option?.value || 'Non')}
                          placeholder="Sélectionner"
                        />
                      </FormGroup>
                    </Row>
                  </>
                )}
              </div>
            ))}

            <hr className="my-4" />

            <div className="d-flex justify-content-between mt-5">
              <Button
                variant="secondary"
                onClick={handleBackStep}
                className='btn btn-danger'
                disabled={loading}
              >
                ← Retour
              </Button>
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <TbPlus className="me-1" /> Soumettre la demande
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Form>
    </>
  )
}

export default DemandeForm
