import { supabase } from '../lib/supabase';
import type { FormData } from '../lib/types';
import { generatePDF } from './pdfService';

function generateUniquePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function saveForm(formData: FormData) {
  try {
    const userId = null;

    if (
      !formData.typeOfWork ||
      !formData.surfaceArea ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      throw new Error('Tous les champs sont obligatoires');
    }

    const formPassword = generateUniquePassword();
    
    // Generate PDF
    const pdfUrl = generatePDF(formData);

    const { data: insertedForm, error: formError } = await supabase
      .from('construction_forms')
      .insert({
        user_id: userId,
        type_of_work: formData.typeOfWork,
        surface_area: formData.surfaceArea,
        vmc_power: formData.vmcPower,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        form_password: formPassword,
      })
      .select()
      .single();

    if (formError) {
      console.error('Erreur lors de la création du formulaire:', formError);
      throw new Error('Erreur lors de la création du formulaire');
    }

    return { ...insertedForm, formPassword, pdfUrl };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du formulaire:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur inattendue');
  }
}