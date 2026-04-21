-- Migration : ajoute la colonne `active` sur categories
-- A executer dans l'editeur SQL de Supabase

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
