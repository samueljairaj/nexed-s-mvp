
export interface DsoProfile {
  id: string;
  university_id: string;
  role: 'dso_admin' | 'dso_viewer';
  title: string | null;
  department: string | null;
  office_location: string | null;
  office_hours: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}
