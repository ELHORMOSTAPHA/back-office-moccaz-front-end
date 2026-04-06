#!/bin/bash

# Fix unused imports and variables by commenting them out or removing them

# Fix Invoices.tsx - comment out unused function
sed -i '358s/^/    \/\/ /' src/views/apps/invoice/invoices/components/Invoices.tsx

# Fix DriverTable.tsx - remove Spinner from import
sed -i 's/Spinner,$//' src/views/apps/menu/chaufeurs/components/DriverTable.tsx
sed -i 's/Spinner$//' src/views/apps/menu/chaufeurs/components/DriverTable.tsx

# Fix Ajouter_Entreprise_modal.tsx - rename field to _field
sed -i '98s/\[field,/[_field,/' src/views/apps/menu/chaufeurs/components/Modals/Ajouter_Entreprise_modal.tsx

# Fix Ajouter_chaffeur_modal.tsx - rename field to _field
sed -i '129s/\[field,/[_field,/' src/views/apps/menu/chaufeurs/components/Modals/Ajouter_chaffeur_modal.tsx

# Fix CarTable.tsx - remove unused imports
sed -i "1s/import { cars }/\/\/ import { cars }/" src/views/apps/menu/vehicules/components/CarTable.tsx
sed -i 's/Spinner,$//' src/views/apps/menu/vehicules/components/CarTable.tsx
sed -i 's/Spinner$//' src/views/apps/menu/vehicules/components/CarTable.tsx

# Fix Ajouter_Vehicule_modal.tsx - rename field to _field
sed -i '144s/\[field,/[_field,/' src/views/apps/menu/vehicules/components/Modals/Ajouter_Vehicule_modal.tsx

# Fix Ajouter_Profile_Modal.tsx - rename field to _field
sed -i '84s/\[field,/[_field,/' src/views/apps/parametres/profiles/components/Modals/Ajouter_Profile_Modal.tsx

# Fix ProfileTable.tsx
sed -i "1s/import { users }/\/\/ import { users }/" src/views/apps/parametres/profiles/components/ProfileTable.tsx
sed -i 's/Col,$//' src/views/apps/parametres/profiles/components/ProfileTable.tsx
sed -i 's/Spinner,$//' src/views/apps/parametres/profiles/components/ProfileTable.tsx
sed -i 's/Spinner$//' src/views/apps/parametres/profiles/components/ProfileTable.tsx

# Fix Ajouter_User_modal.tsx - rename field to _field
sed -i '98s/\[field,/[_field,/' src/views/apps/parametres/utilisateurs/components/Modals/Ajouter_User_modal.tsx

# Fix UserTable.tsx
sed -i "1s/import { users }/\/\/ import { users }/" src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/Col,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/FormControl,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/FormLabel,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/Modal,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/ModalBody,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/ModalFooter,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/ModalHeader,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/ModalTitle,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/Row,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/Spinner,$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx
sed -i 's/Spinner$//' src/views/apps/parametres/utilisateurs/components/UserTable.tsx

# Fix Planification.tsx
sed -i 's/getTrajetsByDemande, getTrajetsByVehicule,/getTrajetsByDemande,/' src/views/apps/planification/components/Planification.tsx

# Fix creer_demande/index.tsx
sed -i 's/{Button, Card, CardBody,/{Card,/' src/views/apps/portiel-client/creer_demande/index.tsx
sed -i "2s/import {TbSend}/\/\/ import {TbSend}/" src/views/apps/portiel-client/creer_demande/index.tsx

echo "Fixed unused variables"
