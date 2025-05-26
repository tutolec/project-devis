/**
 * @file types.ts
 * Fichier de définition des types et interfaces pour l'application.
 */

// Liste étendue des types de devices possibles
export type DeviceType =
  // Prises classiques
  | "prise-classique"
  | "prise-rj45"
  | "prise-tv"
  | "prise-etanche"

  // Éclairage
  | "point-lumineux-dcl"
  | "point-lumineux-applique"
  | "spot"
  | "spot-recouvrable"
  | "spot-douche"
  | "projecteur-exterieur"
  | "projecteur-detecteur"

  // Commandes
  | "interrupteur-va-et-vient"
  | "interrupteur-etanche"
  | "bouton-poussoir"

  // Spécialisées
  | "four"
  | "hotte"
  | "lave-vaisselle"
  | "lave-linge"
  | "plaque-de-cuisson"
  | "chauffe-eau"
  | "seche-linge"
  | "congelateur";

/**
 * Types spécifiques au projet
 */

export type LightingType =
  | "Point lumineux DCL"
  | "Point lumineux applique DCL"
  | "Spots"
  | "Spots recouvrable tout isolant"
  | "Spot douche"
  | "Projecteur étanche"
  | "Projecteur étanche avec détecteur";

export type OutletBlockType = "simple" | "double" | "triple" | "quadruple";

export type SpecializedOutletType =
  | "Hotte"
  | "Four"
  | "Lave-vaisselle"
  | "Lave-linge"
  | "Sèche-linge"
  | "Congélateur"
  | "Plaque de cuisson"
  | "Chauffe-eau";

export interface Lighting {
  id: string;
  type: LightingType;
  quantity: number;
  switches: number;
  customName?: string;
  detectors?: number;
}

export interface OutletBlock {
  id: string;
  type: OutletBlockType;
  outlets: number;
  rj45: number;
  tv: number;
}

export interface DeviceInBlock {
  id: string;
  deviceType: DeviceType;
  quantity: number;
  customName?: string;
}

export interface EquipmentBlock {
  id: string;
  blockName: string;
  devices: DeviceInBlock[];
}

export interface Room {
  id: string;
  name: string;
  equipment: {
    lighting: Lighting[];
    outletBlocks: OutletBlock[];
    specializedOutlets: SpecializedOutletType[];
  };
}

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

export interface MaterialPrice {
  name: string;
  price: number;
}

export interface QuoteCalculation {
  materials: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalPrice: number;
}