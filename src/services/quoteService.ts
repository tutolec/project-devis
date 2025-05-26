import type { Room, QuoteCalculation } from '../lib/types';

const MATERIAL_PRICES = {
  // Points lumineux
  'Point lumineux DCL': 9.55,
  'Point lumineux applique DCL': 6.08,
  'Spots': 7.29,
  'Spots recouvrable tout isolant': 18.81,
  'Spot douche': 25.06,
  'Projecteur étanche': 24.30,
  'Projecteur étanche avec détecteur': 40.37,

  // Interrupteurs et boutons
  'Interrupteur va-et-vient': 3.78,
  'Interrupteur étanche': 8.37,
  'Bouton poussoir': 5.33,

  // Prises
  'Prise de courant': 3.42,
  'Prise RJ45': 15.53,
  'Prise TV': 8.03,
  'Prise étanche': 8.78,

  // Plaques de finition
  'Plaque de finition 1': 1.35,
  'Plaque de finition 2': 2.57,
  'Plaque de finition 3': 4.32,
  'Plaque de finition 4': 5.51,

  // Boîtes d'encastrement
  'Boite d\'encastrement 1': 0.84,
  'Boite d\'encastrement 2': 4.31,
  'Boite d\'encastrement 3': 6.01,
  'Boite d\'encastrement 4': 11.41,
};

export function calculateQuote(rooms: Room[]): QuoteCalculation {
  const materials = new Map<string, number>();

  // Helper to add materials with their associated components
  const addMaterial = (name: string, quantity: number = 1) => {
    materials.set(name, (materials.get(name) || 0) + quantity);
  };

  // Helper to add mounting components
  const addMountingComponents = (elements: number) => {
    const boxType = `Boite d'encastrement ${elements}`;
    const plateType = `Plaque de finition ${elements}`;
    addMaterial(boxType);
    addMaterial(plateType);
  };

  rooms.forEach(room => {
    // Process lighting fixtures
    room.equipment.lighting.forEach(light => {
      addMaterial(light.type, light.quantity);
      // Add switches for each light
      if (light.switches > 0) {
        addMaterial('Interrupteur va-et-vient', light.switches);
        // Each switch needs mounting components
        for (let i = 0; i < light.switches; i++) {
          addMountingComponents(1);
        }
      }
    });

    // Process outlet blocks
    room.equipment.outletBlocks.forEach(block => {
      const totalElements = block.outlets + block.rj45 + block.tv;
      
      // Add outlets
      addMaterial('Prise de courant', block.outlets);
      addMaterial('Prise RJ45', block.rj45);
      addMaterial('Prise TV', block.tv);

      // Add mounting components based on total elements
      addMountingComponents(totalElements);
    });

    // Process specialized outlets
    room.equipment.specializedOutlets.forEach(() => {
      addMaterial('Prise de courant', 1);
      addMountingComponents(1);
    });
  });

  // Calculate totals
  let totalPrice = 0;
  const materialsList = Array.from(materials.entries()).map(([name, quantity]) => {
    const unitPrice = MATERIAL_PRICES[name as keyof typeof MATERIAL_PRICES] || 0;
    const totalMaterialPrice = unitPrice * quantity;
    totalPrice += totalMaterialPrice;

    return {
      name,
      quantity,
      unitPrice,
      totalPrice: totalMaterialPrice
    };
  });

  return {
    materials: materialsList,
    totalPrice
  };
}