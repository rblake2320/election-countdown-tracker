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
      candidates: {
        Row: {
          created_at: string
          election_id: string
          id: string
          image_url: string | null
          incumbent: boolean
          intent_pct: number | null
          last_polled: string | null
          name: string
          party: string
          poll_pct: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          election_id: string
          id?: string
          image_url?: string | null
          incumbent?: boolean
          intent_pct?: number | null
          last_polled?: string | null
          name: string
          party: string
          poll_pct?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          election_id?: string
          id?: string
          image_url?: string | null
          incumbent?: boolean
          intent_pct?: number | null
          last_polled?: string | null
          name?: string
          party?: string
          poll_pct?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          comparison_id: string
          created_at: string
          id: string
          reason: string
          resolved_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          comparison_id: string
          created_at?: string
          id?: string
          reason: string
          resolved_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          comparison_id?: string
          created_at?: string
          id?: string
          reason?: string
          resolved_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comparisons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_tags: {
        Row: {
          credential_id: string
          tag_id: string
        }
        Insert: {
          credential_id: string
          tag_id: string
        }
        Update: {
          credential_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credential_tags_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "stored_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credential_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      election_cycles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          slug: string
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          start_date: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      elections: {
        Row: {
          created_at: string
          description: string | null
          election_cycle_id: string | null
          election_dt: string
          id: string
          is_special: boolean
          office_level: string
          office_name: string
          party_filter: string[] | null
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          election_cycle_id?: string | null
          election_dt: string
          id?: string
          is_special?: boolean
          office_level: string
          office_name: string
          party_filter?: string[] | null
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          election_cycle_id?: string | null
          election_dt?: string
          id?: string
          is_special?: boolean
          office_level?: string
          office_name?: string
          party_filter?: string[] | null
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elections_election_cycle_id_fkey"
            columns: ["election_cycle_id"]
            isOneToOne: false
            referencedRelation: "election_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_metrics: {
        Row: {
          created_at: string
          election_id: string | null
          id: string
          interactions_count: number | null
          scroll_depth: number | null
          session_id: string | null
          shares_count: number | null
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          election_id?: string | null
          id?: string
          interactions_count?: number | null
          scroll_depth?: number | null
          session_id?: string | null
          shares_count?: number | null
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          election_id?: string | null
          id?: string
          interactions_count?: number | null
          scroll_depth?: number | null
          session_id?: string | null
          shares_count?: number | null
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_metrics_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_logs: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      non_voter_tracking: {
        Row: {
          barriers: string[] | null
          created_at: string
          id: string
          interest_level: number | null
          last_voted_year: number | null
          reason: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          barriers?: string[] | null
          created_at?: string
          id?: string
          interest_level?: number | null
          last_voted_year?: number | null
          reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          barriers?: string[] | null
          created_at?: string
          id?: string
          interest_level?: number | null
          last_voted_year?: number | null
          reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_verified?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          id: string
          results_count: number | null
          search_query: string
          search_type: string | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          results_count?: number | null
          search_query: string
          search_type?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stored_credentials: {
        Row: {
          category_id: string | null
          created_at: string | null
          encrypted_password: string
          favicon: string | null
          id: string
          last_used: string | null
          notes: string | null
          strength: number | null
          title: string
          updated_at: string | null
          url: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          encrypted_password: string
          favicon?: string | null
          id?: string
          last_used?: string | null
          notes?: string | null
          strength?: number | null
          title: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          encrypted_password?: string
          favicon?: string | null
          id?: string
          last_used?: string | null
          notes?: string | null
          strength?: number | null
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          id: string
          metadata: Json | null
          page_viewed: string
          session_id: string | null
          time_spent: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          page_viewed: string
          session_id?: string | null
          time_spent?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          page_viewed?: string
          session_id?: string | null
          time_spent?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_demographics: {
        Row: {
          age_range: string | null
          created_at: string
          district: string | null
          id: string
          registration_status: string | null
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          district?: string | null
          id?: string
          registration_status?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string
          district?: string | null
          id?: string
          registration_status?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          analytics_consent: boolean | null
          created_at: string
          id: string
          interests: string[] | null
          notification_settings: Json | null
          political_affiliation: string | null
          privacy_consent: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analytics_consent?: boolean | null
          created_at?: string
          id?: string
          interests?: string[] | null
          notification_settings?: Json | null
          political_affiliation?: string | null
          privacy_consent?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analytics_consent?: boolean | null
          created_at?: string
          id?: string
          interests?: string[] | null
          notification_settings?: Json | null
          political_affiliation?: string | null
          privacy_consent?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_copy: boolean | null
          auto_fill: boolean | null
          clear_clipboard: number | null
          created_at: string | null
          password_length: number | null
          theme: string | null
          updated_at: string | null
          use_numbers: boolean | null
          use_special_chars: boolean | null
          user_id: string
        }
        Insert: {
          auto_copy?: boolean | null
          auto_fill?: boolean | null
          clear_clipboard?: number | null
          created_at?: string | null
          password_length?: number | null
          theme?: string | null
          updated_at?: string | null
          use_numbers?: boolean | null
          use_special_chars?: boolean | null
          user_id: string
        }
        Update: {
          auto_copy?: boolean | null
          auto_fill?: boolean | null
          clear_clipboard?: number | null
          created_at?: string | null
          password_length?: number | null
          theme?: string | null
          updated_at?: string | null
          use_numbers?: boolean | null
          use_special_chars?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          comparison_id: string
          created_at: string
          id: string
          is_verified: boolean | null
          user_id: string
        }
        Insert: {
          comparison_id: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          user_id: string
        }
        Update: {
          comparison_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes_intent: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          user_uid: string | null
          weight: number | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          user_uid?: string | null
          weight?: number | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          user_uid?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_intent_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          election_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          election_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          election_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
