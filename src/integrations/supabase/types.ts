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
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          visa_type: Database["public"]["Enums"]["visa_type"] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          file_type: string | null
          file_url: string
          id: string
          is_required: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          is_required?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_required?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          country: string | null
          course_start_date: string | null
          created_at: string | null
          date_of_birth: string | null
          degree_level: string | null
          email: string | null
          employment_start_date: string | null
          field_of_study: string | null
          id: string
          is_stem: boolean | null
          name: string | null
          onboarding_complete: boolean | null
          passport_expiry_date: string | null
          passport_number: string | null
          phone: string | null
          university: string | null
          updated_at: string | null
          us_entry_date: string | null
          visa_type: Database["public"]["Enums"]["visa_type"] | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          course_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          degree_level?: string | null
          email?: string | null
          employment_start_date?: string | null
          field_of_study?: string | null
          id: string
          is_stem?: boolean | null
          name?: string | null
          onboarding_complete?: boolean | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone?: string | null
          university?: string | null
          updated_at?: string | null
          us_entry_date?: string | null
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Update: {
          address?: string | null
          country?: string | null
          course_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          degree_level?: string | null
          email?: string | null
          employment_start_date?: string | null
          field_of_study?: string | null
          id?: string
          is_stem?: boolean | null
          name?: string | null
          onboarding_complete?: boolean | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone?: string | null
          university?: string | null
          updated_at?: string | null
          us_entry_date?: string | null
          visa_type?: Database["public"]["Enums"]["visa_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      visa_type: ["F1", "OPT", "H1B", "Other"],
    },
  },
} as const
