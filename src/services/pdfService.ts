import jsPDF from 'jspdf';
import type { FormData } from '../lib/types';

export async function generatePDF(formData: FormData): Promise<string> {
  const doc = new jsPDF();
  const margin = 20;
  let yPos = margin;
  const lineHeight = 7;

  // Helper function to add text and handle page breaks
  const addText = (text: string, fontSize = 12) => {
    doc.setFontSize(fontSize);
    if (yPos > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };

  // Header
  doc.addImage('https://tutolec.fr/wp-content/uploads/2024/11/logo-tutolec.webp', 'JPEG', margin, yPos, 40, 20);
  yPos += 30;
  addText('TUTOLEC', 16);
  addText('contact@tutolec.fr — 06 01 36 57 35');
  yPos += lineHeight;

  // Title
  addText(`Devis Électrique – ${formData.firstName} ${formData.lastName}`, 16);
  yPos += lineHeight;

  // General Information
  addText('Informations générales', 14);
  addText(`Type de travaux: ${formData.typeOfWork}`);
  addText(`Surface: ${formData.surfaceArea}`);
  addText(`VMC: ${formData.vmcPower}`);
  yPos += lineHeight;

  // Client Information
  addText('Informations client', 14);
  addText(`Nom: ${formData.firstName} ${formData.lastName}`);
  addText(`Email: ${formData.email}`);
  addText(`Téléphone: ${formData.phone}`);
  yPos += lineHeight;

  // Rooms & Equipment
  addText('Pièces & équipements', 14);
  formData.rooms.forEach(room => {
    addText(`${room.name}`, 13);
    
    if (room.equipment.lighting.length > 0) {
      addText('Éclairages:');
      room.equipment.lighting.forEach(light => {
        addText(`  • ${light.type} - ${light.quantity} point(s), ${light.switches} interrupteur(s)`);
      });
    }

    if (room.equipment.outletBlocks.length > 0) {
      addText('Blocs de prises:');
      room.equipment.outletBlocks.forEach(block => {
        addText(`  • ${block.type} - ${block.outlets} prise(s), ${block.rj45} RJ45`);
      });
    }

    if (room.equipment.specializedOutlets.length > 0) {
      addText('Prises spécialisées:');
      room.equipment.specializedOutlets.forEach(outlet => {
        addText(`  • ${outlet}`);
      });
    }
    yPos += lineHeight;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      'Tutolec – SIRET 123 456 789 00010 – www.tutolec.fr',
      margin,
      doc.internal.pageSize.height - margin
    );
  }

  // Convert to base64
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
}