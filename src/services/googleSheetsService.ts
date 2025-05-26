import type { FormData } from '../lib/types';

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxIn0JiM9ytKwUN0wNyszw-itYAHSDSwuF8xY2InoNWBY0re6WIz-tzxkkNmN6dteUE/exec';

export async function sendToGoogleSheets(formData: FormData, formId: string) {
  try {
    // Format the data as expected by Google Apps Script
    const formattedData = {
      formId, // Ajout de l'ID du formulaire
      date: new Date().toISOString(),
      typeOfWork: formData.typeOfWork,
      surfaceArea: formData.surfaceArea,
      vmcPower: formData.vmcPower,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    };

    // Add room data
    formData.rooms.forEach((room, index) => {
      formattedData[`piece${index + 1}_nom`] = room.name;
      
      // Format éclairage standardisé : "type 1, quantité 1, nombre interrupteur 1 / type 2, quantité 2, nombre interrupteur 2"
      formattedData[`piece${index + 1}_eclairage`] = room.equipment.lighting
        .map(l => `${l.type}, ${l.quantity}, ${l.switches}`)
        .join(' / ');
      
      formattedData[`piece${index + 1}_prises`] = room.equipment.outletBlocks
        .map(o => `${o.type} (${o.outlets}x, RJ45: ${o.rj45})`)
        .join(', ');
        
      formattedData[`piece${index + 1}_prises_specialisees`] = room.equipment.specializedOutlets.join(', ');
    });

    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Important pour les requêtes cross-origin vers Google Apps Script
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Changed to text/plain for compatibility
      },
      body: JSON.stringify(formattedData)
    });

    // Due to no-cors mode, we can't check response.ok
    return { success: true };
  } catch (error) {
    console.error('Erreur Google Sheets:', error);
    throw error;
  }
}