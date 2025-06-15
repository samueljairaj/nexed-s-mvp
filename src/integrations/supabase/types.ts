export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assistant_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          active: boolean | null
          condition_logic: string
          created_at: string | null
          description: string | null
          group_name: string
          id: string
          name: string
          priority: number | null
          required_documents: Json
        }
        Insert: {
          active?: boolean | null
          condition_logic: string
          created_at?: string | null
          description?: string | null
          group_name: string
          id?: string
          name: string
          priority?: number | null
          required_documents: Json
        }
        Update: {
          active?: boolean | null
          condition_logic?: string
          created_at?: string | null
          description?: string | null
          group_name?: string
          id?: string
          name?: string
          priority?: number | null
          required_documents?: Json
        }
        Relationships: []
      }
      compliance_task_templates: {
        Row: {
          created_at: string | null
          days_from_start: number | null
          description: string | null
          id: string
          is_recurring: boolean | null
          recurring_interval: string | null
          title: string
          visa_type: Database["public"]["Enums"]["visa_type"]
        }
        Insert: {
          created_at?: string | null
          days_from_start?: number | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          recurring_interval?: string | null
          title: string
          visa_type: Database["public"]["Enums"]["visa_type"]
        }
        Update: {
          created_at?: string | null
          days_from_start?: number | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          recurring_interval?: string | null
          title?: string
          visa_type?: Database["public"]["Enums"]["visa_type"]
        }
        Relationships: []
      }
      compliance_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          is_deleted: boolean
          is_recurring: boolean | null
          phase: string | null
          priority: Database["public"]["Enums"]["task_priority_enum"]
          recurring_interval: string | null
          title: string
          updated_at: string | null
          user_id: string
          visa_type: Database["public"]["Enums"]["visa_type"] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_deleted?: boolean
          is_recurring?: boolean | null
          phase?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          recurring_interval?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_deleted?: boolean
          is_recurring?: boolean | null
          phase?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          recurring_interval?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_compliance_tasks_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          document_id: string
          file_url: string
          id: string
          is_current: boolean | null
          notes: string | null
          size: string
          upload_date: string
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          document_id: string
          file_url: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          size: string
          upload_date?: string
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          document_id?: string
          file_url?: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          size?: string
          upload_date?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category_enum"]
          created_at: string | null
          detected_type: string | null
          expiry_date: string | null
          expiry_notification_sent: boolean | null
          file_type: string | null
          file_url: string
          id: string
          is_deleted: boolean
          is_required: boolean | null
          latest_version_id: string | null
          notification_schedule: Json | null
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["document_status_enum"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category_enum"]
          created_at?: string | null
          detected_type?: string | null
          expiry_date?: string | null
          expiry_notification_sent?: boolean | null
          file_type?: string | null
          file_url: string
          id?: string
          is_deleted?: boolean
          is_required?: boolean | null
          latest_version_id?: string | null
          notification_schedule?: Json | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status_enum"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category_enum"]
          created_at?: string | null
          detected_type?: string | null
          expiry_date?: string | null
          expiry_notification_sent?: boolean | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_deleted?: boolean
          is_required?: boolean | null
          latest_version_id?: string | null
          notification_schedule?: Json | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status_enum"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_latest_version_id_fkey"
            columns: ["latest_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dso_profiles: {
        Row: {
          approval_status: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          department: string | null
          id: string
          is_admin: boolean | null
          office_hours: string | null
          office_location: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id: string
          is_admin?: boolean | null
          office_hours?: string | null
          office_location?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_admin?: boolean | null
          office_hours?: string | null
          office_location?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dso_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          auth_end_date: string | null
          auth_start_date: string | null
          auth_type: string | null
          country: string | null
          course_start_date: string | null
          created_at: string | null
          date_of_birth: string | null
          degree_level: string | null
          e_verify_number: string | null
          ead_number: string | null
          email: string | null
          employer_name: string | null
          employment_start_date: string | null
          employment_status: string | null
          field_of_study: string | null
          id: string
          is_stem: boolean | null
          job_title: string | null
          name: string | null
          nationality: string | null
          onboarding_complete: boolean | null
          opt_status: string | null
          passport_expiry_date: string | null
          passport_number: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          unemployment_days: string | null
          university: string | null
          university_id: string | null
          updated_at: string | null
          us_entry_date: string | null
          visa_expiry_date: string | null
          visa_type: Database["public"]["Enums"]["visa_type"] | null
        }
        Insert: {
          address?: string | null
          auth_end_date?: string | null
          auth_start_date?: string | null
          auth_type?: string | null
          country?: string | null
          course_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          degree_level?: string | null
          e_verify_number?: string | null
          ead_number?: string | null
          email?: string | null
          employer_name?: string | null
          employment_start_date?: string | null
          employment_status?: string | null
          field_of_study?: string | null
          id: string
          is_stem?: boolean | null
          job_title?: string | null
          name?: string | null
          nationality?: string | null
          onboarding_complete?: boolean | null
          opt_status?: string | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unemployment_days?: string | null
          university?: string | null
          university_id?: string | null
          updated_at?: string | null
          us_entry_date?: string | null
          visa_expiry_date?: string | null
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Update: {
          address?: string | null
          auth_end_date?: string | null
          auth_start_date?: string | null
          auth_type?: string | null
          country?: string | null
          course_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          degree_level?: string | null
          e_verify_number?: string | null
          ead_number?: string | null
          email?: string | null
          employer_name?: string | null
          employment_start_date?: string | null
          employment_status?: string | null
          field_of_study?: string | null
          id?: string
          is_stem?: boolean | null
          job_title?: string | null
          name?: string | null
          nationality?: string | null
          onboarding_complete?: boolean | null
          opt_status?: string | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unemployment_days?: string | null
          university?: string | null
          university_id?: string | null
          updated_at?: string | null
          us_entry_date?: string | null
          visa_expiry_date?: string | null
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_notes_author"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_notes_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          country: string
          created_at: string | null
          id: string
          name: string
          sevis_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          id?: string
          name: string
          sevis_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          sevis_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_university_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_approved_dso: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_dso: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_my_student: {
        Args: { student_id: string }
        Returns: boolean
      }
      is_same_university: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_same_university_as_student: {
        Args: { student_id: string }
        Returns: boolean
      }
      is_university_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          entity_type: string
          entity_id: string
          action: string
          details?: Json
        }
        Returns: undefined
      }
      log_dso_data_access: {
        Args: { entity_type: string; entity_id: string }
        Returns: undefined
      }
      policy_exists: {
        Args: { policy_name: string; table_name: string }
        Returns: boolean
      }
    }
    Enums: {
      document_category_enum:
        | "immigration"
        | "education"
        | "employment"
        | "personal"
        | "financial"
        | "other"
        | "academic"
      document_status_enum:
        | "valid"
        | "expiring"
        | "expired"
        | "pending"
        | "rejected"
        | "approved"
      task_priority_enum: "low" | "medium" | "high"
      user_role: "student" | "dso" | "admin"
      visa_type: "F1" | "OPT" | "H1B" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_category_enum: [
        "immigration",
        "education",
        "employment",
        "personal",
        "financial",
        "other",
        "academic",
      ],
      document_status_enum: [
        "valid",
        "expiring",
        "expired",
        "pending",
        "rejected",
        "approved",
      ],
      task_priority_enum: ["low", "medium", "high"],
      user_role: ["student", "dso", "admin"],
      visa_type: ["F1", "OPT", "H1B", "Other"],
    },
  },
} as const
