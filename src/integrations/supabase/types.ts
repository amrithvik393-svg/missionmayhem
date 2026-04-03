export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      game_config: {
        Row: {
          admin_password: string
          boss_active_team_id: string | null
          boss_points: number | null
          boss_room_password: string | null
          boss_time_minutes: number | null
          boss_time_seconds: number | null
          boss_vital_bp: number | null
          boss_vital_hr: number | null
          boss_vital_nr: number | null
          boss_vital_o2: number | null
          boss_volunteer_1: string | null
          boss_volunteer_2: string | null
          boss_volunteer_3: string | null
          current_team: string | null
          id: string
          intelligence_categories: Json | null
          intelligence_correct_number: string | null
          intelligence_gate_code: string | null
          intelligence_points: number | null
          intelligence_room_password: string | null
          intelligence_time_minutes: number | null
          intelligence_time_seconds: number | null
          team_rotation_flow: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_password?: string
          boss_active_team_id?: string | null
          boss_points?: number | null
          boss_room_password?: string | null
          boss_time_minutes?: number | null
          boss_time_seconds?: number | null
          boss_vital_bp?: number | null
          boss_vital_hr?: number | null
          boss_vital_nr?: number | null
          boss_vital_o2?: number | null
          boss_volunteer_1?: string | null
          boss_volunteer_2?: string | null
          boss_volunteer_3?: string | null
          current_team?: string | null
          id?: string
          intelligence_categories?: Json | null
          intelligence_correct_number?: string | null
          intelligence_gate_code?: string | null
          intelligence_points?: number | null
          intelligence_room_password?: string | null
          intelligence_time_minutes?: number | null
          intelligence_time_seconds?: number | null
          team_rotation_flow?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_password?: string
          boss_active_team_id?: string | null
          boss_points?: number | null
          boss_room_password?: string | null
          boss_time_minutes?: number | null
          boss_time_seconds?: number | null
          boss_vital_bp?: number | null
          boss_vital_hr?: number | null
          boss_vital_nr?: number | null
          boss_vital_o2?: number | null
          boss_volunteer_1?: string | null
          boss_volunteer_2?: string | null
          boss_volunteer_3?: string | null
          current_team?: string | null
          id?: string
          intelligence_categories?: Json | null
          intelligence_correct_number?: string | null
          intelligence_gate_code?: string | null
          intelligence_points?: number | null
          intelligence_room_password?: string | null
          intelligence_time_minutes?: number | null
          intelligence_time_seconds?: number | null
          team_rotation_flow?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      point_adjustments: {
        Row: {
          adjusted_by: string
          created_at: string | null
          id: string
          points: number
          reason: string | null
          team_id: string
        }
        Insert: {
          adjusted_by: string
          created_at?: string | null
          id?: string
          points: number
          reason?: string | null
          team_id: string
        }
        Update: {
          adjusted_by?: string
          created_at?: string | null
          id?: string
          points?: number
          reason?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_adjustments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active_team_id: string | null
          id: string
          name: string
          password: string | null
          points: number | null
          sort_order: number | null
          time_minutes: number | null
          time_seconds: number | null
          updated_at: string | null
          volunteer_name: string | null
          volunteer_name_2: string | null
        }
        Insert: {
          active_team_id?: string | null
          id: string
          name: string
          password?: string | null
          points?: number | null
          sort_order?: number | null
          time_minutes?: number | null
          time_seconds?: number | null
          updated_at?: string | null
          volunteer_name?: string | null
          volunteer_name_2?: string | null
        }
        Update: {
          active_team_id?: string | null
          id?: string
          name?: string
          password?: string | null
          points?: number | null
          sort_order?: number | null
          time_minutes?: number | null
          time_seconds?: number | null
          updated_at?: string | null
          volunteer_name?: string | null
          volunteer_name_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_active_team_id_fkey"
            columns: ["active_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_scores: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          points: number | null
          room_id: string
          team_id: string
          time_elapsed: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          points?: number | null
          room_id: string
          team_id: string
          time_elapsed?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          points?: number | null
          room_id?: string
          team_id?: string
          time_elapsed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          member1: string | null
          member2: string | null
          member3: string | null
          member4: string | null
          team_name: string
          total_points: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member1?: string | null
          member2?: string | null
          member3?: string | null
          member4?: string | null
          team_name: string
          total_points?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member1?: string | null
          member2?: string | null
          member3?: string | null
          member4?: string | null
          team_name?: string
          total_points?: number | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          password?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
