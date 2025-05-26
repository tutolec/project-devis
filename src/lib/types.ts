/**
 * @file types.ts
 * Fichier de définition des types et interfaces pour l’application.
 */

// Liste étendue des types de devices possibles
export type DeviceType =
  // Prises classiques
  | "prise-classique"
  | "prise-rj45"
  | "prise-tv"

  // Éclairage
  | "point-lumineux-dcl"
  | "spot"
  | "alimentation-eclairage"

  // Commandes
  | "interrupteur"
  | "bouton-poussoir"

  // Spécialisées
  | "four"
  | "hotte"
  | "lave-vaisselle"
  | "lave-linge"
  | "plaque-de-cuisson"
  | "chauffe-eau"
  | "Sèche-linge"
  | "Congélateur";

/**
 * Types spécifiques au projet
 */

// Par exemple, si vous gardez la notion de LightingType dans vos sélecteurs
export type LightingType =
  | "Point lumineux DCL"
  | "Spots recouvrable tout isolant"
  | "Spots"
  | "Spot douche"
  | "DCL applique"
  | "Alimentation éclairage"
  | "Projecteur étanche";

// Même principe pour les blocs de prises
export type OutletBlockType = "simple" | "double" | "triple" | "quadruple";

/**
 * Liste des prises spécialisées (anciennement `SpecializedOutletType`).
 * On peut l’utiliser pour gérer le select des prises spécialisées.
 */
export type SpecializedOutletType =
  | "Hotte"
  | "Four"
  | "Lave-vaisselle"
  | "Lave-linge"
  | "Sèche-linge"
  | "Congélateur"
  | "Plaque de cuisson"
  | "Chauffe-eau";

/**
 * Interface d’un éclairage basique (Lighting)
 * avec un champ `customName` pour le nom personnalisé,
 * et `detectors?` pour gérer le nombre de détecteurs.
 */
export interface Lighting {
  id: string;
  type: LightingType;
  quantity: number;
  switches: number;
  customName?: string;
  detectors?: number;
}

/**
 * Interface d’un bloc de prises.
 * Prises (outlets), rj45, tv.
 */
export interface OutletBlock {
  id: string;
  type: OutletBlockType; // ex. 'simple'
  outlets: number;       // nombre de prises classiques
  rj45: number;          // nombre de RJ45
  tv: number;            // nombre de prises TV
}

/**
 * Exemple de structure plus générique pour regrouper des devices
 * (non utilisée directement dans l’exemple App.tsx,
 *  mais potentiellement utile si vous voulez unifier éclairages/prises/etc.)
 */
export interface DeviceInBlock {
  id: string;             // ID unique
  deviceType: DeviceType; // Type parmi la liste ci-dessus
  quantity: number;       // nombre d'items (prises, spots, etc.)
  customName?: string;    // nom personnalisable
  // Autres champs si besoin (ex. intensité, détecteurs, etc.)
}

export interface EquipmentBlock {
  id: string;
  blockName: string;
  devices: DeviceInBlock[];
}

/**
 * Chaque pièce (Room) contient un `equipment` qui lui-même contient
 * - un tableau d’éclairages
 * - un tableau de blocs de prises
 * - un tableau de prises spécialisées
 */
export interface Room {
  id: string;
  name: string;
  equipment: {
    lighting: Lighting[];
    outletBlocks: OutletBlock[];
    specializedOutlets: SpecializedOutletType[];
  };
}

/**
 * Structure du formulaire global :
 */
export interface FormData {
  typeOfWork: string;
  surfaceArea: string;
  rooms: Room[];
  vmcPower: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Fin du fichier types.ts
 */
