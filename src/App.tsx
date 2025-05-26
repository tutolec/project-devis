import { useState } from 'react';
import {
  Building2,
  Home as HomeIcon,
  Ruler,
  Fan,
  ArrowRight,
  LayoutDashboard,
  Plus,
  Minus,
  Power,
  User,
  Mail,
  Phone,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';

// Composant de page de succès
import { SuccessPage } from './components/SuccessPage';

// Service d’enregistrement du formulaire (exemple)
import { saveForm } from './services/formService';

// Import des types nécessaires
import type {
  FormData as FormDataType,
  Room,
  Lighting,
  SpecializedOutletType,
  OutletBlock,
} from './lib/types';

/* -------------------------------------------------------------------------
   1. Interfaces supplémentaires et état initial
   ------------------------------------------------------------------------- */

// Exemple de type pour détailler le type d’interrupteur si besoin
type SwitchType =
  | 'va-et-vient'
  | 'poussoir'
  | 'va-et-vient témoin'
  | 'va-et-vient voyant'
  | 'inconnu';

/**
 * Exemple de type "CustomLighting" si vous avez besoin
 * d’étendre `Lighting` avec plus de champs (ex. switchTypes).
 */
interface CustomLighting extends Lighting {
  // Nombre de détecteurs est déjà dans Lighting (detectors?).
  // On peut ajouter un tableau de type d’interrupteurs :
  switchTypes?: SwitchType[];
}

/**
 * On étend la structure de base `FormDataType` pour ajouter
 * tous les champs supplémentaires dont on a besoin.
 */
interface CustomFormData extends FormDataType {
  // Étape 1
  lodgingType: string;
  department: string;

  // Étape 2
  disjoncteurLocation: string; // 'inside' | 'edge'
  highTensionLine: string;     // 'aerienne' | 'souterraine' | 'unknown'
  tableauType: string;         // 'saillie' | 'encastre'
  aluminumJoinery: string;     // 'oui' | 'non' | 'unknown'
  vmcNeeded: string;           // 'oui' | 'non'

  // Étape 3 : équipements divers (volets, etc.)
  equipment: {
    voletsRoulants: boolean;
    voletsRoulantsType: string;
    voletsRoulantsNumber: string;
    veluxElectrique: boolean;
    veluxNumber: string;
    sonnette: boolean;
    visiophone: boolean;
    portailElectrique: boolean;
    priseVehiculeElectrique: boolean;
    prisesTV: boolean;
    tableauCommunication: boolean;
  };

  // Étape 5 : Chauffage
  heatingTypes: {
    radiateurs: boolean;
    pac: boolean;
    autre: boolean;
    poele: boolean;
    unknown: boolean;
  };
  radiateursNumber: string;
  pacReference: string;
  autreChauffage: string;
}

/* -------------------------------------------------------------------------
   2. Liste de départements et menu "ajouter une pièce"
   ------------------------------------------------------------------------- */
const DEPARTMENTS = [
  { code: '01', name: 'Ain' },
  { code: '02', name: 'Aisne' },
  // etc.
  { code: '32', name: 'Gers' }
];

const addableRoomTypes = [
  { value: 'entrée', label: 'Entrée' },
  { value: 'salle à manger', label: 'Salle à manger' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'chambre', label: 'Chambre' },
  { value: 'buanderie', label: 'Buanderie' },
  { value: 'couloir', label: 'Couloir' },
  { value: 'escalier', label: 'Escalier' },
  { value: 'garage', label: 'Garage' },
  { value: 'sdb', label: 'Salle de bain' },
  { value: 'WC', label: 'WC' },
  { value: 'extérieur entrée', label: 'Extérieur entrée' },
  { value: 'exterieur', label: 'Extérieur' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'autre', label: 'Autre (libre)' },
  { value: 'autre-exterieur', label: 'Autre extérieur (libre)' },
  { value: 'salon', label: 'Salon' },
  { value: 'cuisine', label: 'Cuisine' }
];

/* -------------------------------------------------------------------------
   3. Génération d’ID et création de pièces par défaut
   ------------------------------------------------------------------------- */

/** Génère un ID unique très simple */
function genId() {
  return Date.now().toString() + Math.random();
}

/**
 * Crée une pièce avec la configuration par défaut
 * (éclairages, blocs de prises, prises spécialisées).
 * On ajoute ici `customName` pour nommer l’éclairage par défaut.
 */
function createRoomWithDefaults(roomName: string): Room {
  const ln = roomName.trim().toLowerCase();

  // Par défaut, on initialise trois tableaux (à l’intérieur d’un objet `equipment`).
  const lighting: CustomLighting[] = [];
  const outletBlocks: OutletBlock[] = [];
  const specializedOutlets: SpecializedOutletType[] = [];

  // Exemple : Chambre
  if (ln === 'chambre') {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 2,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    // 3 blocs de prises
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });

  } else if (ln === 'salon') {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 2,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 2, rj45: 0, tv: 0 });

  } else if (ln === 'cuisine') {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 2,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 2, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 2, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    specializedOutlets.push('Hotte', 'Four', 'Lave-vaisselle', 'Plaque de cuisson');

  } else if (ln === 'salle de bain') {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 1,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });

  } else if (ln === 'wc') {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 1,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });

  } else if (ln.includes('buanderie')) {
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 1,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
    specializedOutlets.push('Lave-linge', 'Chauffe-eau');

  } else if (
    ln.includes('garage') ||
    ln.includes('terrasse') ||
    ln.includes('exterieur') ||
    ln.includes('extérieur')
  ) {
    lighting.push({
      id: genId(),
      type: 'Alimentation éclairage',
      quantity: 1,
      switches: 1,
      detectors: 0,
      customName: `Alimentation éclairage-${roomName} 1`
    });

  } else {
    // Par défaut
    lighting.push({
      id: genId(),
      type: 'Point lumineux DCL',
      quantity: 1,
      switches: 2,
      detectors: 0,
      customName: `Point lumineux DCL-${roomName} 1`
    });
    outletBlocks.push({ id: genId(), type: 'simple', outlets: 1, rj45: 0, tv: 0 });
  }

  return {
    id: genId(),
    name: roomName.trim(),
    equipment: { lighting, outletBlocks, specializedOutlets },
  };
}

/** Génère les 5 pièces par défaut. */
function getDefaultRooms(): Room[] {
  return [
    createRoomWithDefaults('Cuisine'),
    createRoomWithDefaults('Salon'),
    createRoomWithDefaults('Salle de bain'),
    createRoomWithDefaults('WC'),
    createRoomWithDefaults('Chambre')
  ];
}

/* -------------------------------------------------------------------------
   4. État initial du formulaire
   ------------------------------------------------------------------------- */
const initialFormData: CustomFormData = {
  typeOfWork: '',
  lodgingType: '',
  department: '',
  surfaceArea: '',
  rooms: getDefaultRooms(),
  vmcPower: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  disjoncteurLocation: '',
  highTensionLine: '',
  tableauType: '',
  aluminumJoinery: '',
  vmcNeeded: '',
  equipment: {
    voletsRoulants: false,
    voletsRoulantsType: '',
    voletsRoulantsNumber: '',
    veluxElectrique: false,
    veluxNumber: '',
    sonnette: false,
    visiophone: false,
    portailElectrique: false,
    priseVehiculeElectrique: false,
    prisesTV: false,
    tableauCommunication: false
  },
  heatingTypes: {
    radiateurs: false,
    pac: false,
    autre: false,
    poele: false,
    unknown: false
  },
  radiateursNumber: '',
  pacReference: '',
  autreChauffage: ''
};

/* -------------------------------------------------------------------------
   5. Composant principal App
   ------------------------------------------------------------------------- */
function App() {
  // On passe de l’étape 1 à l’étape 8
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CustomFormData>(initialFormData);
  const [submitSuccess, setSubmitSuccess] = useState<{ formPassword: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pour l’étape 4 : gestion de l'ajout de pièce
  const [newRoomType, setNewRoomType] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');

  /* -----------------------------------------------------------------------
     5.1 Vérification qu’on peut passer à l’étape suivante
     ----------------------------------------------------------------------- */
  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return (
          !!formData.typeOfWork &&
          !!formData.lodgingType &&
          !!formData.department &&
          !!formData.surfaceArea
        );
      case 2:
        return (
          !!formData.disjoncteurLocation &&
          !!formData.highTensionLine &&
          !!formData.tableauType &&
          !!formData.aluminumJoinery &&
          !!formData.vmcNeeded
        );
      case 3:
        return true;
      case 4:
        return formData.rooms.length > 0;
      case 5:
        // Au moins un type de chauffage coché
        return Object.values(formData.heatingTypes).includes(true);
      case 6:
        // Étape de synthèse -> pas de blocage
        return true;
      case 7:
        // Étape contact
        return (
          !!formData.lastName &&
          !!formData.firstName &&
          !!formData.email &&
          !!formData.phone
        );
      case 8:
        // Page de succès
        return true;
      default:
        return false;
    }
  };

  /* -----------------------------------------------------------------------
     5.2 Soumission finale du formulaire
     ----------------------------------------------------------------------- */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Appel à un service d’enregistrement (ex.: requête HTTP).
      const result = await saveForm(formData);
      setSubmitSuccess({ formPassword: result.formPassword });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setSubmitSuccess(null);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  /* -----------------------------------------------------------------------
     5.3 Gestion de l’ajout / suppression de pièces (étape 4)
     ----------------------------------------------------------------------- */
  const handleAddRoom = () => {
    if (!newRoomType) return;

    let label = '';
    if (newRoomType === 'autre') {
      label = customRoomName.trim() ? customRoomName.trim() : 'Autre';
    } else if (newRoomType === 'autre-exterieur') {
      label = customRoomName.trim()
        ? `Extérieur : ${customRoomName.trim()}`
        : 'Autre extérieur';
    } else {
      const item = addableRoomTypes.find((it) => it.value === newRoomType);
      label = item ? item.label : newRoomType;
    }

    // Si on a déjà une pièce de ce nom, on incrémente un compteur
    const existingCount = formData.rooms.filter(
      (r) => r.name.toLowerCase() === label.toLowerCase()
    ).length;

    let finalLabel = label;
    if (existingCount > 0) {
      finalLabel = `${label} ${existingCount + 1}`;
    }

    // Crée la nouvelle pièce avec sa config par défaut
    const newRoom = createRoomWithDefaults(finalLabel);

    setFormData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));

    setNewRoomType('');
    setCustomRoomName('');
  };

  const handleRemoveRoom = (roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId)
    }));
  };

  // Déplacement (haut / bas) d’une pièce dans la liste
  const handleMoveRoomUp = (index: number) => {
    if (index <= 0) return;
    setFormData((prev) => {
      const newRooms = [...prev.rooms];
      const temp = newRooms[index];
      newRooms[index] = newRooms[index - 1];
      newRooms[index - 1] = temp;
      return { ...prev, rooms: newRooms };
    });
  };

  const handleMoveRoomDown = (index: number) => {
    if (index >= formData.rooms.length - 1) return;
    setFormData((prev) => {
      const newRooms = [...prev.rooms];
      const temp = newRooms[index];
      newRooms[index] = newRooms[index + 1];
      newRooms[index + 1] = temp;
      return { ...prev, rooms: newRooms };
    });
  };

  /* -----------------------------------------------------------------------
     5.4 Fonctions d’édition de l’éclairage, des prises et des prises spécialisées
     ----------------------------------------------------------------------- */
  // Ajouter un nouvel éclairage
  const handleAddLighting = (roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;

        const newLighting: CustomLighting = {
          id: genId(),
          type: 'Point lumineux DCL',
          quantity: 1,
          switches: 1,
          detectors: 0,
          customName: `Point lumineux DCL-${room.name} ${
            room.equipment.lighting.length + 1
          }`
        };

        return {
          ...room,
          equipment: {
            ...room.equipment,
            lighting: [...room.equipment.lighting, newLighting]
          }
        };
      })
    }));
  };

  // Mettre à jour un éclairage
  const handleUpdateLighting = (
    roomId: string,
    lightId: string,
    updates: Partial<CustomLighting>
  ) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          equipment: {
            ...room.equipment,
            lighting: room.equipment.lighting.map((l) =>
              l.id === lightId ? { ...l, ...updates } : l
            )
          }
        };
      })
    }));
  };

  // Supprimer un éclairage
  const handleRemoveLighting = (roomId: string, lightId: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          equipment: {
            ...room.equipment,
            lighting: room.equipment.lighting.filter((li) => li.id !== lightId)
          }
        };
      })
    }));
  };

  // Ajouter un bloc de prises
  const handleAddOutletBlock = (roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const newBlock: OutletBlock = {
          id: genId(),
          type: 'simple',
          outlets: 1,
          rj45: 0,
          tv: 0
        };
        return {
          ...room,
          equipment: {
            ...room.equipment,
            outletBlocks: [...room.equipment.outletBlocks, newBlock]
          }
        };
      })
    }));
  };

  // Mettre à jour un bloc de prises
  const handleUpdateOutletBlock = (
    roomId: string,
    blockId: string,
    updates: Partial<OutletBlock>
  ) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          equipment: {
            ...room.equipment,
            outletBlocks: room.equipment.outletBlocks.map((block) => {
              if (block.id !== blockId) return block;

              let newOutlets = updates.outlets ?? block.outlets;
              let newRj45 = updates.rj45 ?? block.rj45;
              let newTv = updates.tv ?? block.tv;

              // Contrôle : prises + RJ45 + TV ≤ 4
              const newSum = newOutlets + newRj45 + newTv;
              if (newSum > 4) {
                // On regarde quel champ a provoqué le dépassement
                if (updates.outlets !== undefined) {
                  const delta = newSum - 4;
                  newOutlets -= delta;
                  if (newOutlets < 0) newOutlets = 0;
                } else if (updates.rj45 !== undefined) {
                  const delta = newSum - 4;
                  newRj45 -= delta;
                  if (newRj45 < 0) newRj45 = 0;
                } else if (updates.tv !== undefined) {
                  const delta = newSum - 4;
                  newTv -= delta;
                  if (newTv < 0) newTv = 0;
                }
              }

              return {
                ...block,
                outlets: newOutlets,
                rj45: newRj45,
                tv: newTv
              };
            })
          }
        };
      })
    }));
  };

  // Supprimer un bloc de prises
  const handleRemoveOutletBlock = (roomId: string, blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          equipment: {
            ...room.equipment,
            outletBlocks: room.equipment.outletBlocks.filter((b) => b.id !== blockId)
          }
        };
      })
    }));
  };

  // Activer/désactiver une prise spécialisée
  const handleToggleSpecializedOutlet = (
    roomId: string,
    outletType: SpecializedOutletType
  ) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const hasOutlet = room.equipment.specializedOutlets.includes(outletType);
        return {
          ...room,
          equipment: {
            ...room.equipment,
            specializedOutlets: hasOutlet
              ? room.equipment.specializedOutlets.filter((o) => o !== outletType)
              : [...room.equipment.specializedOutlets, outletType]
          }
        };
      })
    }));
  };

  /* -----------------------------------------------------------------------
     5.5 Rendu d’une pièce à l’étape 4
     ----------------------------------------------------------------------- */
  const renderRoomEquipment = (room: Room, index: number) => {
    const lowerName = room.name.toLowerCase();

    // On masque les prises spécialisées pour WC, exterieur, garage...
    const hideSpecialized =
      lowerName.includes('wc') ||
      lowerName.includes('exterieur') ||
      lowerName.includes('extérieur') ||
      lowerName.includes('terrasse') ||
      lowerName.includes('garage');

    return (
      <div key={room.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* En-tête de la pièce (titre, boutons, etc.) */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <LayoutDashboard className="h-5 w-5 mr-2 text-blue-500" />
            {room.name}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleMoveRoomUp(index)}
              disabled={index === 0}
              className="p-1 text-gray-600 hover:text-blue-600"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveRoomDown(index)}
              disabled={index === formData.rooms.length - 1}
              className="p-1 text-gray-600 hover:text-blue-600"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleRemoveRoom(room.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Éclairage */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium">Éclairage</h4>
            <button
              onClick={() => handleAddLighting(room.id)}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {room.equipment.lighting.map((light) => {
            const customLight = light as CustomLighting;
            return (
              <div
                key={customLight.id}
                className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Sélecteur de type d’éclairage */}
                <select
                  value={customLight.type}
                  onChange={(e) =>
                    handleUpdateLighting(room.id, customLight.id, {
                      type: e.target.value as any
                    })
                  }
                  className="rounded-md border-gray-300 text-sm"
                >
                  {/* Exemple de logique : on propose un certain type si c’est la sdb, etc. */}
                  {lowerName.includes('salle de bain') ? (
                    <>
                      <option value="Point lumineux DCL">Point lumineux DCL</option>
                      <option value="DCL applique">DCL applique</option>
                      <option value="Spots recouvrable tout isolant">
                        Spots recouvrable tout isolant
                      </option>
                      <option value="Spot douche">Spot douche</option>
                      <option value="Spots">Spots</option>
                    </>
                  ) : lowerName.includes('garage') ||
                    lowerName.includes('terrasse') ||
                    lowerName.includes('extérieur') ? (
                    <>
                      <option value="Alimentation éclairage">
                        Alimentation éclairage
                      </option>
                      <option value="Projecteur étanche">Projecteur étanche</option>
                      <option value="Projecteur étanche avec détecteur">Projecteur étanche avec détecteur</option>
                    </>
                  ) : (
                    <>
                      <option value="Point lumineux DCL">Point lumineux DCL</option>
                      <option value="DCL applique">DCL applique</option>
                      <option value="Spots recouvrable tout isolant">
                        Spots recouvrable tout isolant
                      </option>
                      <option value="Spots">Spots</option>
                    </>
                  )}
                </select>

                {/* Quantité (ex. si on veut plusieurs points lumineux identiques) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        quantity: customLight.quantity + 1
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{customLight.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        quantity: Math.max(1, customLight.quantity - 1)
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Nombre d’interrupteurs ou BP */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {customLight.switches > 2 ? 'Boutons poussoirs:' : 'Interrupteurs:'}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        switches: customLight.switches + 1
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{customLight.switches}</span>
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        switches: Math.max(0, customLight.switches - 1)
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Détecteurs */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">Détecteurs:</span>
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        detectors: (customLight.detectors || 0) + 1
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{customLight.detectors || 0}</span>
                  <button
                    onClick={() =>
                      handleUpdateLighting(room.id, customLight.id, {
                        detectors: Math.max(0, (customLight.detectors || 0) - 1)
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Nom personnalisable (customName) */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={customLight.customName || ''}
                    onChange={(e) =>
                      handleUpdateLighting(room.id, customLight.id, {
                        customName: e.target.value
                      })
                    }
                    placeholder="Nom de l'éclairage"
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </div>

                {/* Bouton de suppression */}
                <button
                  onClick={() => handleRemoveLighting(room.id, customLight.id)}
                  className="ml-auto text-red-500 hover:bg-red-50 p-2 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Blocs de prises */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium">Prises</h4>
            <button
              onClick={() => handleAddOutletBlock(room.id)}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {room.equipment.outletBlocks.map((block, bIndex) => (
            <div
              key={block.id}
              className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="font-medium text-gray-700 min-w-[80px]">
                Bloc {bIndex + 1}
              </div>

              {/* Nombre de prises classiques */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Prises:</span>
                <button
                  onClick={() =>
                    handleUpdateOutletBlock(room.id, block.id, {
                      outlets: block.outlets + 1
                    })
                  }
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{block.outlets}</span>
                <button
                  onClick={() =>
                    handleUpdateOutletBlock(room.id, block.id, {
                      outlets: Math.max(0, block.outlets - 1)
                    })
                  }
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              {/* RJ45 (affiché uniquement si "tableauCommunication" coché) */}
              {formData.equipment.tableauCommunication && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">RJ45:</span>
                  <button
                    onClick={() =>
                      handleUpdateOutletBlock(room.id, block.id, {
                        rj45: block.rj45 + 1
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{block.rj45}</span>
                  <button
                    onClick={() =>
                      handleUpdateOutletBlock(room.id, block.id, {
                        rj45: Math.max(0, block.rj45 - 1)
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* TV (affiché uniquement si "prisesTV" coché) */}
              {formData.equipment.prisesTV && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">TV:</span>
                  <button
                    onClick={() =>
                      handleUpdateOutletBlock(room.id, block.id, {
                        tv: block.tv + 1
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{block.tv}</span>
                  <button
                    onClick={() =>
                      handleUpdateOutletBlock(room.id, block.id, {
                        tv: Math.max(0, block.tv - 1)
                      })
                    }
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Suppression du bloc */}
              <button
                onClick={() => handleRemoveOutletBlock(room.id, block.id)}
                className="ml-auto text-red-500 hover:bg-red-50 p-2 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Prises spécialisées (on les masque si c’est un WC, garage, etc.) */}
        {hideSpecialized ? null : (
          <div>
            <h4 className="text-lg font-medium mb-3">Prises spécialisées</h4>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleToggleSpecializedOutlet(room.id, e.target.value as SpecializedOutletType);
                }
              }}
              className="w-full rounded-md border-gray-300 mb-2"
            >
              <option value="">Sélectionner une prise spécialisée</option>
              {(
                [
                  'Lave-linge',
                  'Sèche-linge',
                  'Plaque de cuisson',
                  'Chauffe-eau',
                  'Lave-vaisselle',
                  'Congélateur',
                  'Hotte',
                  'Four'
                ] as SpecializedOutletType[]
              )
                .filter((ot) => !room.equipment.specializedOutlets.includes(ot))
                .map((ot) => (
                  <option key={ot} value={ot}>
                    {ot}
                  </option>
                ))}
            </select>

            {room.equipment.specializedOutlets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {room.equipment.specializedOutlets.map((ot) => (
                  <div
                    key={ot}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    <Power className="h-4 w-4" />
                    {ot}
                    <button
                      onClick={() => handleToggleSpecializedOutlet(room.id, ot)}
                      className="hover:bg-blue-200 rounded-full p-1"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* -----------------------------------------------------------------------
     5.6 Rendu de l’étape 6 : Synthèse
     ----------------------------------------------------------------------- */

  // Petite fonction utilitaire pour raccourcir le type d’éclairage dans la synthèse
  function getShortLightingType(type: string): string {
    switch (type) {
      case 'Point lumineux DCL':
        return 'PL DCL';
      case 'DCL applique':
        return 'Applique';
      case 'Spots recouvrable tout isolant':
      case 'Spots':
        return 'Spots';
      default:
        return type;
    }
  }

  const renderSummaryStep = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Synthèse du logement
        </h2>
        {formData.rooms.map((room) => {
          // S’il n’y a rien dans la pièce, on ne l’affiche pas
          const hasLighting = room.equipment.lighting && room.equipment.lighting.length > 0;
          const hasOutletBlocks =
            room.equipment.outletBlocks && room.equipment.outletBlocks.length > 0;
          const hasSpecializedOutlets =
            room.equipment.specializedOutlets && room.equipment.specializedOutlets.length > 0;
          if (!hasLighting && !hasOutletBlocks && !hasSpecializedOutlets) {
            return null;
          }

          // Compter le nombre d’occurrences par type d’éclairage
          const countPerType: Record<string, number> = {};

          return (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-300 p-4 rounded-lg shadow mb-4 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-medium mb-3">{room.name}</h3>

              {/* Éclairage */}
              {hasLighting && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Éclairage</h4>
                  {room.equipment.lighting.map((light) => {
                    if (light.quantity === 0) return null;

                    const shortType = getShortLightingType(light.type);
                    if (!countPerType[shortType]) {
                      countPerType[shortType] = 1;
                    } else {
                      countPerType[shortType] += 1;
                    }
                    const indexType = countPerType[shortType];
                    const suffix = indexType > 1 ? ` ${indexType}` : '';
                    // Ex. "Salon PL DCL 2"
                    const lightingName = `${room.name} ${shortType}${suffix}`;

                    // Interrupteurs ou BP
                    const isPushButton = light.switches > 2;
                    const switchLabel = isPushButton ? 'Bouton poussoir' : 'Interrupteur';

                    return (
                      <div key={light.id} className="mb-4">
                        <div className="font-semibold mb-1">
                          {light.type} x{light.quantity} ({lightingName})
                          {light.customName && (
                            <span className="ml-2 italic text-sm">
                            </span>
                          )}
                        </div>
                        {light.switches > 0 &&
                          Array.from({ length: light.switches }, (_, i) => (
                            <div key={i} className="ml-4 text-sm text-gray-700">
                              {switchLabel} {i + 1} ({lightingName})
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Blocs de prises */}
              {hasOutletBlocks && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Blocs de prises</h4>
                  {room.equipment.outletBlocks.map((block, bIndex) => {
                    // On n’affiche pas le bloc s’il est entièrement vide
                    if (block.outlets === 0 && block.rj45 === 0 && block.tv === 0) {
                      return null;
                    }
                    return (
                      <div key={block.id} className="mb-3 ml-4 text-sm text-gray-700">
                        <div className="font-medium">
                          Bloc {bIndex + 1} :
                        </div>
                        <div>
                          {block.outlets === 1 && `${block.outlets} Prise de courant`}
                          {block.outlets > 1 && `${block.outlets} Prises de courant`}
                          {block.outlets > 0 && (block.rj45 > 0 || block.tv > 0) && ' + '}
                          {block.rj45 > 0 && `${block.rj45} RJ45`}
                          {block.rj45 > 0 && block.tv > 0 && ', '}
                          {block.tv === 1 && `${block.tv} Prise TV`}
                          {block.tv > 1 && `${block.tv} Prises TV`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prises spécialisées */}
              {hasSpecializedOutlets && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Prises spécialisées</h4>
                  <div className="ml-4 text-sm text-gray-700">
                    {room.equipment.specializedOutlets.join(', ')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* -----------------------------------------------------------------------
     5.7 Rendu final : multi-étapes
     ----------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8">
          {/* Votre logo ou équivalent */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="https://tutolec.fr/wp-content/uploads/2024/10/Logo-TUTOLEC-arrondi-ss-contour-scaled.webp"
              alt="LogoTutolec"
              className="w-64 mb-4 mr-4 rounded shadow"
            />
          </div>

          {/* Bandeau de progression : 1 à 8 */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6, 7 ].map((step) => (
                <div key={step} className={`flex items-center ${step < 8 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step <= currentStep
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 7 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire multi-étapes */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Étape 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Type de travaux */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                    Type de travaux
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Construction', 'Rénovation'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, typeOfWork: type }))
                        }
                        className={`${
                          formData.typeOfWork === type
                            ? 'bg-blue-900 text-white ring-2 ring-blue-900 ring-offset-2'
                            : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                        } px-4 py-3 rounded-lg font-medium transition-all duration-200`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type de logement */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Type de logement
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Maison', 'Appartement'].map((logType) => (
                      <button
                        key={logType}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, lodgingType: logType }))
                        }
                        className={`${
                          formData.lodgingType === logType
                            ? 'bg-blue-900 text-white ring-2 ring-blue-600 ring-offset-2'
                            : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                        } px-4 py-3 rounded-lg font-medium transition-all duration-200`}
                      >
                        {logType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Département */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    Département du logement
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value
                      }))
                    }
                    className="w-full rounded-md border-gray-300"
                  >
                    <option value="">-- Sélectionnez un département --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.code} - {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surface */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <Ruler className="h-5 w-5 mr-2 text-blue-500" />
                    Surface du logement (m²)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.surfaceArea}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        surfaceArea: e.target.value
                      }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-4"
                    placeholder="Ex: 75"
                  />
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Localisation disjoncteur */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-2">
                    Où est situé le disjoncteur général (ENEDIS) ?
                  </label>
                  <img
                    src="https://www.legrand.fr/sites/default/files/ecat/th_LG-092870-WEB-R.jpg"
                    alt="Visuel disjoncteur ENEDIS"
                    className="w-64 mb-4 rounded shadow"
                  />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          disjoncteurLocation: 'inside'
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.disjoncteurLocation === 'inside'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      À l'intérieur du logement
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          disjoncteurLocation: 'edge'
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.disjoncteurLocation === 'edge'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      À la limite de propriété
                    </button>
                  </div>
                </div>

                {/* Ligne haute tension */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-2">
                    La ligne haute tension alimentant le logement est...
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          highTensionLine: 'aerienne'
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.highTensionLine === 'aerienne'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Aérienne
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          highTensionLine: 'souterraine'
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.highTensionLine === 'souterraine'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Souterraine
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          highTensionLine: 'unknown'
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.highTensionLine === 'unknown'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Je ne sais pas
                    </button>
                  </div>
                </div>

                {/* Tableau électrique */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-2">
                    Comment souhaitez-vous le tableau électrique ?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, tableauType: 'saillie' }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.tableauType === 'saillie'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      En saillie
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, tableauType: 'encastre' }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.tableauType === 'encastre'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Encastré
                    </button>
                  </div>
                </div>

                {/* Menuiseries alu */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-2">
                    Le logement possède-t-il des menuiseries en aluminium ?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, aluminumJoinery: 'oui' }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.aluminumJoinery === 'oui'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, aluminumJoinery: 'non' }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.aluminumJoinery === 'non'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Non
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, aluminumJoinery: 'unknown' }))
                      }
                      className={`px-4 py-2 rounded ${
                        formData.aluminumJoinery === 'unknown'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Je ne sais pas
                    </button>
                  </div>
                </div>

                {/* VMC */}
                <div>
                  <label className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <Fan className="h-5 w-5 mr-2 text-blue-500" />
                    Faut-il prévoir l'alimentation pour une VMC ?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, vmcNeeded: 'oui' }))}
                      className={`px-4 py-2 rounded ${
                        formData.vmcNeeded === 'oui'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, vmcNeeded: 'non' }))}
                      className={`px-4 py-2 rounded ${
                        formData.vmcNeeded === 'non'
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : équipements divers */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <label className="text-lg font-medium text-gray-900">
                  Sélectionnez les équipements souhaités :
                </label>
                {[
                  {
                    key: 'voletsRoulants',
                    label: 'Volets roulants',
                    subfields: (
                      <div className="ml-4 mt-2 space-y-2">
                        <div>
                          <span className="block mb-1 font-medium">
                            Type de commande :
                          </span>
                          <div className="flex gap-2 mt-1">
                            {['manuelle', 'radio', 'Je ne sais pas'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    equipment: {
                                      ...prev.equipment,
                                      voletsRoulantsType: type
                                    }
                                  }))
                                }
                                className={`px-3 py-1 rounded ${
                                  formData.equipment.voletsRoulantsType === type
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-gray-200'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">
                            Nombre de volets :
                          </label>
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-48"
                            value={formData.equipment.voletsRoulantsNumber}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                equipment: {
                                  ...prev.equipment,
                                  voletsRoulantsNumber: e.target.value
                                }
                              }))
                            }
                          />
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'veluxElectrique',
                    label: 'Velux électrique',
                    subfields: (
                      <div className="ml-4 mt-2 space-y-2">
                        <label className="block mb-1 font-medium">
                          Nombre de Velux :
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-48"
                          value={formData.equipment.veluxNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              equipment: {
                                ...prev.equipment,
                                veluxNumber: e.target.value
                              }
                            }))
                          }
                        />
                      </div>
                    )
                  },
                  { key: 'sonnette', label: 'Sonnette' },
                  { key: 'visiophone', label: 'Visiophone' },
                  { key: 'portailElectrique', label: 'Portail électrique' },
                  { key: 'priseVehiculeElectrique', label: 'Prise Véhicule Électrique' },
                  { key: 'prisesTV', label: 'Prises TV' },
                  { key: 'tableauCommunication', label: 'Tableau de communication (RJ45)' }
                ].map((item) => {
                  const isSelected =
                    formData.equipment[item.key as keyof typeof formData.equipment];
                  return (
                    <div key={item.key} className="mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            equipment: {
                              ...prev.equipment,
                              [item.key]: !isSelected
                            }
                          }))
                        }
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                      {isSelected && item.subfields}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Étape 4 : gestion des pièces (éclairages, prises, etc.) */}
            {currentStep === 4 && (
              <div>
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Vous disposez déjà des 5 pièces par défaut (Cuisine, Salon, Salle de bain, WC, Chambre).
                    <br />
                    Vous pouvez en ajouter d’autres ci-dessous :
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      className="rounded-md border-gray-300"
                    >
                      <option value="">-- Sélectionner un type de pièce --</option>
                      {addableRoomTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {['autre', 'autre-exterieur'].includes(newRoomType) && (
                      <input
                        type="text"
                        value={customRoomName}
                        onChange={(e) => setCustomRoomName(e.target.value)}
                        placeholder="Nom de la pièce"
                        className="rounded-md border-gray-300"
                      />
                    )}
                    <button
                      onClick={handleAddRoom}
                      disabled={!newRoomType}
                      className="px-4 py-2 bg-blue-900 text-white rounded-lg disabled:bg-gray-300"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {formData.rooms.map((room, index) => renderRoomEquipment(room, index))}
                </div>
              </div>
            )}

            {/* Étape 5 : chauffage */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <label className="text-lg font-medium text-gray-900">
                  Quel(s) type(s) de chauffage seront installés ?
                </label>
                {[
                  {
                    key: 'radiateurs',
                    label: 'Radiateurs électriques',
                    subfields: (
                      <div className="ml-4 mt-2 space-y-2">
                        <label className="block mb-1 font-medium">
                          Nombre de radiateurs :
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-48"
                          value={formData.radiateursNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              radiateursNumber: e.target.value
                            }))
                          }
                        />
                      </div>
                    )
                  },
                  {
                    key: 'pac',
                    label: 'Pompe à chaleur',
                    subfields: (
                      <div className="ml-4 mt-2 space-y-2">
                        <label className="block mb-1 font-medium">
                          Si connu, référence :
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-64"
                          value={formData.pacReference}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pacReference: e.target.value
                            }))
                          }
                        />
                      </div>
                    )
                  },
                  {
                    key: 'autre',
                    label: 'Autre',
                    subfields: (
                      <div className="ml-4 mt-2 space-y-2">
                        <label className="block mb-1 font-medium">
                          Indiquer votre choix :
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-64"
                          value={formData.autreChauffage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              autreChauffage: e.target.value
                            }))
                          }
                        />
                      </div>
                    )
                  },
                  {
                    key: 'poele',
                    label: 'Poêle à granulés'
                  },
                  {
                    key: 'unknown',
                    label: 'Je ne sais pas'
                  }
                ].map((item) => {
                  const isSelected = formData.heatingTypes[item.key as keyof typeof formData.heatingTypes];
                  return (
                    <div key={item.key} className="mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            heatingTypes: {
                              ...prev.heatingTypes,
                              [item.key]: !isSelected
                            }
                          }))
                        }
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                      {isSelected && item.subfields}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Étape 6 : Synthèse */}
            {currentStep === 6 && renderSummaryStep()}

            {/* Étape 7 : contact */}
            {currentStep === 7 && !submitSuccess && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Informations de contact
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value
                        }))
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value
                        }))
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value
                        }))
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 8 : page de succès (si le formulaire a été envoyé avec succès) */}
            {currentStep === 8 && submitSuccess && (
              <SuccessPage
                formPassword={submitSuccess.formPassword}
                onReset={handleReset}
                formData={formData} // Pour générer le PDF ou autre
              />
            )}

            {submitError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{submitError}</div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              {currentStep > 1 && currentStep < 8 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Retour
                </button>
              )}

              {currentStep < 7 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceedToNextStep()}
                  className={`ml-auto flex items-center px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    canProceedToNextStep()
                      ? 'bg-blue-900 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              )}

              {/* Si on est à l’étape 7, on propose l’envoi du formulaire */}
              {currentStep === 7 && !submitSuccess && (
                <button
                  type="submit"
                  onClick={async () => {
                    await handleSubmit();
                    if (!submitError) {
                      setCurrentStep(8);
                    }
                  }}
                  disabled={!canProceedToNextStep() || isSubmitting}
                  className={`ml-auto px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    canProceedToNextStep() && !isSubmitting
                      ? 'bg-blue-900 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
