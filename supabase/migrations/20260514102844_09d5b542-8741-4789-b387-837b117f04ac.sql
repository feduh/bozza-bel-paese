-- 1. Add 'collaborator' role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'collaborator';
