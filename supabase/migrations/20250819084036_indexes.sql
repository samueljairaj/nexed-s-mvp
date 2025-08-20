-- Phase 3: Fix remaining function security warnings

-- Fix all remaining functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.is_same_university_as_student(student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  student_uni_id UUID;
  dso_uni_id UUID;
BEGIN
  SELECT university_id INTO student_uni_id FROM public.profiles WHERE id = student_id;
  SELECT university_id INTO dso_uni_id FROM public.profiles WHERE id = auth.uid();
  
  RETURN student_uni_id = dso_uni_id AND dso_uni_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_university_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dso_profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
    AND approval_status = 'approved'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_dso_data_access(entity_type text, entity_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.is_dso() THEN
    PERFORM public.log_audit_event(
      entity_type, 
      entity_id, 
      'accessed', 
      jsonb_build_object('accessed_by', auth.uid())
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.policy_exists(policy_name text, table_name text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_dso()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dso_profiles 
    WHERE id = auth.uid() 
    AND approval_status = 'approved'
  );
END;
$$;