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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          created_at: string | null
          id: string
          last_seen_at: string | null
          session: string | null
          short_code: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          last_seen_at?: string | null
          session?: string | null
          short_code?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          session?: string | null
          short_code?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      legislators: {
        Row: {
          active: boolean | null
          chamber: string | null
          created_at: string | null
          district_code: string | null
          email: string | null
          id: number
          name: string | null
          party: string | null
          phone: string | null
          profile_url: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          chamber?: string | null
          created_at?: string | null
          district_code?: string | null
          email?: string | null
          id?: number
          name?: string | null
          party?: string | null
          phone?: string | null
          profile_url?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          chamber?: string | null
          created_at?: string | null
          district_code?: string | null
          email?: string | null
          id?: number
          name?: string | null
          party?: string | null
          phone?: string | null
          profile_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      member_votes: {
        Row: {
          decision: string | null
          legislator_district: string
          legislator_name: string | null
          vote_id: number
        }
        Insert: {
          decision?: string | null
          legislator_district: string
          legislator_name?: string | null
          vote_id: number
        }
        Update: {
          decision?: string | null
          legislator_district?: string
          legislator_name?: string | null
          vote_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "member_votes_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          mode: string | null
          quiet_hours: Json | null
          subscriber_id: number
        }
        Insert: {
          mode?: string | null
          quiet_hours?: Json | null
          subscriber_id: number
        }
        Update: {
          mode?: string | null
          quiet_hours?: Json | null
          subscriber_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: true
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_dedup: {
        Row: {
          channel: string
          sent_at: string | null
          subscriber_id: number
          vote_id: number
        }
        Insert: {
          channel: string
          sent_at?: string | null
          subscriber_id: number
          vote_id: number
        }
        Update: {
          channel?: string
          sent_at?: string | null
          subscriber_id?: number
          vote_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "outbound_dedup_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_dedup_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_districts: {
        Row: {
          added_via: string | null
          chamber: string
          district_code: string
          subscriber_id: number
        }
        Insert: {
          added_via?: string | null
          chamber: string
          district_code: string
          subscriber_id: number
        }
        Update: {
          added_via?: string | null
          chamber?: string
          district_code?: string
          subscriber_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_districts_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          consent_checkbox_at: string | null
          created_at: string | null
          email: string | null
          email_confirmed_at: string | null
          id: number
          phone_e164: string | null
          sms_confirmed_at: string | null
        }
        Insert: {
          consent_checkbox_at?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          id?: number
          phone_e164?: string | null
          sms_confirmed_at?: string | null
        }
        Update: {
          consent_checkbox_at?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          id?: number
          phone_e164?: string | null
          sms_confirmed_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          absent: number | null
          action_text: string | null
          bill_id: string | null
          chamber: string | null
          created_at: string | null
          excused: number | null
          external_key: string | null
          id: number
          nays: number | null
          result: string | null
          source_url: string | null
          taken_at: string | null
          yeas: number | null
        }
        Insert: {
          absent?: number | null
          action_text?: string | null
          bill_id?: string | null
          chamber?: string | null
          created_at?: string | null
          excused?: number | null
          external_key?: string | null
          id?: number
          nays?: number | null
          result?: string | null
          source_url?: string | null
          taken_at?: string | null
          yeas?: number | null
        }
        Update: {
          absent?: number | null
          action_text?: string | null
          bill_id?: string | null
          chamber?: string | null
          created_at?: string | null
          excused?: number | null
          external_key?: string | null
          id?: number
          nays?: number | null
          result?: string | null
          source_url?: string | null
          taken_at?: string | null
          yeas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
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
