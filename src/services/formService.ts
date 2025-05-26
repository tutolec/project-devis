import { supabase } from '../lib/supabase';
import type { CustomFormData } from '../lib/types';

function generateUniquePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendToWebhook(formData: CustomFormData) {
  try {
    const response = await fetch('https://hook.eu2.make.com/dvtignppd733ifsyeol97qgculx4n5fq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Erreur Webhook: ${response.statusText}`);
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Webhook response is not JSON:', await response.text());
      return null;
    }

    try {
      const data = await response.json();
      return data.pdfUrl;
    } catch (parseError) {
      console.error('Failed to parse webhook response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi au webhook:', error);
    return null;
  }
}

export async function saveForm(formData: CustomFormData) {
  try {
    const userId = null;

    if (
      !formData.typeOfWork ||
      !formData.lodgingType ||
      !formData.department ||
      !formData.surfaceArea ||
      !formData.disjoncteurLocation ||
      !formData.highTensionLine ||
      !formData.tableauType ||
      !formData.aluminumJoinery ||
      !formData.vmcNeeded ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      throw new Error('Tous les champs sont obligatoires');
    }

    const formPassword = generateUniquePassword();

    const { data: insertedForm, error: formError } = await supabase
      .from('construction_forms')
      .insert({
        user_id: userId,
        type_of_work: formData.typeOfWork,
        lodging_type: formData.lodgingType,
        department: formData.department,
        surface_area: formData.surfaceArea,
        disjoncteur_location: formData.disjoncteurLocation,
        high_tension_line: formData.highTensionLine,
        tableau_type: formData.tableauType,
        aluminum_joinery: formData.aluminumJoinery,
        vmc_needed: formData.vmcNeeded, // Updated to use vmc_needed instead of vmc_power
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        heating_types: formData.heatingTypes,
        equipment: formData.equipment,
        form_password: formPassword,
      })
      .select()
      .single();

    if (formError) {
      console.error('Erreur lors de la création du formulaire:', formError);
      throw new Error('Erreur lors de la création du formulaire');
    }

    const pdfUrl = await sendToWebhook(formData);

    return { ...insertedForm, formPassword, pdfUrl };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du formulaire:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur inattendue');
  }
}