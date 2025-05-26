import jsPDF from 'jspdf';
import type { FormData } from '../lib/types';

export async function generatePDF(formData: FormData): Promise<string> {
  // Create PDF with blue color scheme
  const doc = new jsPDF();
  const margin = 20;
  let yPos = margin;
  const lineHeight = 7;
  const primaryBlue = '#1e3a8a'; // Tailwind blue-900

  // Helper function to add text with custom styling
  const addText = (text: string, fontSize = 12, color = '#2c3e50', isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    if (yPos > doc.internal.pageSize.height - margin * 2) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };

  // Add section divider
  const addDivider = () => {
    doc.setDrawColor(primaryBlue);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
    yPos += lineHeight;
  };

  // Header with logo and contact
  doc.addImage('https://tutolec.fr/wp-content/uploads/2024/11/logo-tutolec.webp', 'JPEG', margin, yPos, 50, 25);
  yPos += 30;
  addText('TUTOLEC', 18, primaryBlue, true);
  addText('contact@tutolec.fr — 06 01 36 57 35', 11, '#666666');
  yPos += lineHeight;

  // Title
  addText(`Devis Électrique – ${formData.firstName} ${formData.lastName}`, 20, primaryBlue, true);
  yPos += lineHeight;
  addDivider();

  // General Information
  addText('📍 Informations générales', 16, primaryBlue, true);
  addText(`Type de travaux : ${formData.typeOfWork}`, 12, '#2c3e50', true);
  addText(`Surface : ${formData.surfaceArea}`, 12);
  addText(`VMC : ${formData.vmcPower}`, 12);
  yPos += lineHeight;
  addDivider();

  // Client Information
  addText('👤 Informations client', 16, primaryBlue, true);
  addText(`Nom complet : ${formData.firstName} ${formData.lastName}`, 12, '#2c3e50', true);
  addText(`Email : ${formData.email}`, 12);
  addText(`Téléphone : ${formData.phone}`, 12);
  yPos += lineHeight;
  addDivider();

  // Rooms & Equipment
  addText('🏠 Pièces & équipements', 16, primaryBlue, true);
  formData.rooms.forEach(room => {
    addText(`${room.name}`, 14, primaryBlue, true);
    
    if (room.equipment.lighting.length > 0) {
      addText('Éclairages :', 12, '#2c3e50', true);
      room.equipment.lighting.forEach(light => {
        addText(`  • ${light.type} - ${light.quantity} point(s), ${light.switches} interrupteur(s)`, 11);
      });
    }

    if (room.equipment.outletBlocks.length > 0) {
      addText('Blocs de prises :', 12, '#2c3e50', true);
      room.equipment.outletBlocks.forEach(block => {
        addText(`  • ${block.type} - ${block.outlets} prise(s), ${block.rj45} RJ45`, 11);
      });
    }

    if (room.equipment.specializedOutlets.length > 0) {
      addText('Prises spécialisées :', 12, '#2c3e50', true);
      room.equipment.specializedOutlets.forEach(outlet => {
        addText(`  • ${outlet}`, 11);
      });
    }
    yPos += lineHeight / 2;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    
    // Add page number
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width - margin - 20,
      doc.internal.pageSize.height - margin - 10
    );
    
    // Add footer text
    doc.text(
      'Tutolec – SIRET 123 456 789 00010 – www.tutolec.fr',
      margin,
      doc.internal.pageSize.height - margin - 10
    );
    
    doc.text(
      'Ce devis est valable 30 jours à compter de la date d'émission.',
      margin,
      doc.internal.pageSize.height - margin
    );
  }

  // Convert to base64
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
}