-- Migration : ajoute le champ `is_specialite` sur menu_items
-- A executer dans l'editeur SQL de Supabase

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS is_specialite BOOLEAN NOT NULL DEFAULT FALSE;
