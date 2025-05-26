import { jsPDF } from 'jspdf';
import type { FormData, Room } from '../lib/types';
import { FileDown, Home, Lightbulb, Power, Plug } from 'lucide-react';

export function generatePDF(formData: FormData): string {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 10;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Helper functions
  const addTitle = (text: string) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += lineHeight * 1.5;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };

  const addText = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };

  const checkPageBreak = () => {
    if (yPos > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Header
  doc.setFillColor(25, 45, 95); // Dark blue color
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Devis Express - Récapitulatif', margin, 25);
  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Informations générales
  addTitle('Informations Générales');
  addText(`Type de travaux: ${formData.typeOfWork}`);
  addText(`Surface: ${formData.surfaceArea}`);
  addText(`VMC: ${formData.vmcPower}`);
  yPos += lineHeight;

  // Contact
  addTitle('Contact');
  addText(`${formData.firstName} ${formData.lastName}`);
  addText(`Email: ${formData.email}`);
  addText(`Téléphone: ${formData.phone}`);
  yPos += lineHeight;

  // Pièces et équipements
  addTitle('Détail des Pièces');

  formData.rooms.forEach((room: Room) => {
    checkPageBreak();
    
    // Room header with blue background
    doc.setFillColor(240, 245, 255);
    doc.rect(margin - 5, yPos - 5, pageWidth - (margin * 2) + 10, 20, 'F');
    
    addSubtitle(`${room.name}`);
    
    // Éclairage
    if (room.equipment.lighting.length > 0) {
      addText('Éclairage:');
      room.equipment.lighting.forEach(light => {
        addText(`  • ${light.type} (${light.quantity}x) - ${light.switches} interrupteur(s)`);
        checkPageBreak();
      });
    }

    // Prises
    if (room.equipment.outletBlocks.length > 0) {
      addText('Prises:');
      room.equipment.outletBlocks.forEach(block => {
        addText(`  • Bloc ${block.type}: ${block.outlets} prise(s), ${block.rj45} RJ45`);
        checkPageBreak();
      });
    }

    // Prises spécialisées
    if (room.equipment.specializedOutlets.length > 0) {
      addText('Prises spécialisées:');
      room.equipment.specializedOutlets.forEach(outlet => {
        addText(`  • ${outlet}`);
        checkPageBreak();
      });
    }

    yPos += lineHeight;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Generate PDF URL
  return doc.output('datauristring');
}