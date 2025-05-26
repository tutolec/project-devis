import { CheckCircle, Copy, Home, FileDown } from 'lucide-react';
import type { FormData } from '../lib/types';

interface SuccessPageProps {
  formPassword: string;
  onReset: () => void;
  formData: FormData;
  pdfUrl?: string; // Ajout de l'URL du PDF comme prop
}

export function SuccessPage({ formPassword, onReset, pdfUrl }: SuccessPageProps) {
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Formulaire envoyé avec succès !
          </h1>
          
          <p className="text-gray-600 mb-8">
            Votre demande a été enregistrée et sera traitée dans les plus brefs délais.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Votre mot de passe unique
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Conservez ce mot de passe précieusement, il vous permettra d'accéder à votre formulaire ultérieurement.
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="bg-gray-100 px-4 py-2 rounded text-lg font-mono">
                {formPassword}
              </code>
              <button
                onClick={handleCopyPassword}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                title="Copier le mot de passe"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Télécharger le PDF
              </a>
            ) : (
              <p className="text-gray-500">Le PDF est en cours de génération...</p>
            )}

            <button
              onClick={onReset}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
