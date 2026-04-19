-- Bootstrap : a executer UNE SEULE FOIS dans le SQL Editor de Supabase
-- si votre base existait avant l'ajout de cette fonction dans schema.sql

CREATE OR REPLACE FUNCTION run_migration(sql TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
