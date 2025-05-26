/*
  # Correction des contraintes de la table construction_forms

  1. Changements
    - Ajout de contraintes de validation pour les champs email et phone
    - Ajout d'index pour améliorer les performances des recherches
    - Optimisation des contraintes existantes

  2. Sécurité
    - Maintien des politiques RLS existantes
    - Ajout de validation supplémentaire pour les données sensibles
*/

-- Ajout de contraintes de validation pour email et phone
ALTER TABLE construction_forms
ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT phone_format CHECK (phone ~* '^\+?[0-9\s-]{10,}$');

-- Ajout d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_construction_forms_user_id ON construction_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_forms_email ON construction_forms(email);
CREATE INDEX IF NOT EXISTS idx_construction_forms_form_password ON construction_forms(form_password);

-- Optimisation des contraintes existantes
ALTER TABLE construction_forms
ALTER COLUMN type_of_work SET DEFAULT 'Construction',
ALTER COLUMN surface_area SET DEFAULT '0 - 30 m²',
ALTER COLUMN vmc_power SET DEFAULT 'unknown';

-- Ajout de commentaires sur les colonnes pour la documentation
COMMENT ON COLUMN construction_forms.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN construction_forms.last_name IS 'Nom de l''utilisateur';
COMMENT ON COLUMN construction_forms.email IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN construction_forms.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN construction_forms.form_password IS 'Mot de passe unique du formulaire';