-- Complete schema creation
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text,
    name text,
    role text DEFAULT 'student',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id),
    title text,
    category text,
    status text DEFAULT 'pending',
    file_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id),
    title text,
    priority text DEFAULT 'medium',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id),
    entity_type text,
    entity_id text,
    action text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid REFERENCES public.documents(id),
    file_url text,
    version_number integer,
    size text,
    notes text,
    upload_date timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES public.profiles(id),
    is_current boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.student_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.profiles(id),
    author_id uuid REFERENCES public.profiles(id),
    content text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dso_profiles (
    id uuid PRIMARY KEY REFERENCES public.profiles(id),
    title text,
    department text,
    contact_email text,
    contact_phone text,
    office_location text,
    office_hours text,
    approval_status text,
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.universities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    country text NOT NULL,
    sevis_id text,
    website text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assistant_messages (
    id text PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_rules (
    id text PRIMARY KEY,
    name text NOT NULL,
    group_name text NOT NULL,
    condition_logic text NOT NULL,
    required_documents jsonb NOT NULL,
    description text,
    priority integer,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_task_templates (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    days_from_start integer,
    is_recurring boolean DEFAULT false,
    recurring_interval text,
    visa_type text,
    created_at timestamptz DEFAULT now()
);

-- Create enum types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category_enum') THEN
        CREATE TYPE public.document_category_enum AS ENUM ('immigration', 'education', 'employment', 'personal', 'financial', 'other', 'academic');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status_enum') THEN
        CREATE TYPE public.document_status_enum AS ENUM ('valid', 'expiring', 'expired', 'pending', 'rejected', 'approved');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum') THEN
        CREATE TYPE public.task_priority_enum AS ENUM ('low', 'medium', 'high');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('student', 'dso', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visa_type') THEN
        CREATE TYPE public.visa_type AS ENUM ('F1', 'OPT', 'H1B', 'Other');
    END IF;
END$$;
