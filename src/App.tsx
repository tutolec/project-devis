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
import { StepIndicator } from './components/StepIndicator';

// Service d'enregistrement du formulaire (exemple)
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

// Exemple de type pour détailler le type d'interrupteur si besoin
type SwitchType =
  | 'va-et-vient'
  | 'poussoir'
  | 'va-et-vient témoin'
  | 'va-et-vient voyant'
  | 'inconnu';

/**
 * Exemple de type "CustomLighting" si vous avez besoin
 * d'étendre `Lighting` avec plus de champs (ex. switchTypes).
 */
interface CustomLighting extends Lighting {
  // Nombre de détecteurs est déjà dans Lighting (detectors?).
  // On peut ajouter un tableau de type d'interrupteurs :
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
   3. Génération d'ID et création de pièces par défaut
   ------------------------------------------------------------------------- */

/** Génère un ID unique très simple */
function genId() {
  return Date.now().toString() + Math.random();
}

/**
 * Crée une pièce avec la configuration par défaut
 * (éclairages, blocs de prises, prises spécialisées).
 * On ajoute ici `customName` pour nommer l'éclairage par défaut.
 */
function createRoomWithDefaults(roomName: string): Room {
  const ln = roomName.trim().toLowerCase();

  // Par défaut, on initialise trois tableaux (à l'intérieur d'un objet `equipment`).
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
export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CustomFormData>(initialFormData);
  const [submitSuccess, setSubmitSuccess] = useState<{ formPassword: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pour l'étape 4 : gestion de l'ajout de pièce
  const [newRoomType, setNewRoomType] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <img
            src="https://i.imgur.com/O9bLZeR.png"
            alt="Tutolec Logo"
            className="h-16 mx-auto"
          />
        </div>

        <StepIndicator
          currentStep={currentStep}
          totalSteps={7}
          onStepClick={handleStepClick}
        />

        {/* Rest of your component */}
      </div>
    </div>
  );
}