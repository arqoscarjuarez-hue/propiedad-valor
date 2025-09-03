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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      authorized_users: {
        Row: {
          created_at: string
          created_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          moderation_flags: string[] | null
          moderation_status: string
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          moderation_flags?: string[] | null
          moderation_status?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          moderation_flags?: string[] | null
          moderation_status?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_comparables: {
        Row: {
          address: string
          age_years: number | null
          apartment_area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          construction_area: number | null
          country: string | null
          created_at: string
          estrato_social: Database["public"]["Enums"]["estrato_social"] | null
          id: string
          land_area: number | null
          latitude: number | null
          location_type: string | null
          longitude: number | null
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string | null
          state: string | null
          total_area: number
          updated_at: string
        }
        Insert: {
          address: string
          age_years?: number | null
          apartment_area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          construction_area?: number | null
          country?: string | null
          created_at?: string
          estrato_social?: Database["public"]["Enums"]["estrato_social"] | null
          id?: string
          land_area?: number | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date?: string | null
          state?: string | null
          total_area: number
          updated_at?: string
        }
        Update: {
          address?: string
          age_years?: number | null
          apartment_area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          construction_area?: number | null
          country?: string | null
          created_at?: string
          estrato_social?: Database["public"]["Enums"]["estrato_social"] | null
          id?: string
          land_area?: number | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          price_per_sqm_usd?: number
          price_usd?: number
          property_type?: string
          sale_date?: string | null
          state?: string | null
          total_area?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_area_prioritized_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          max_distance_km?: number
          prop_type: string
          target_area: number
        }
        Returns: {
          address: string
          area_difference: number
          area_similarity_score: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          months_old: number
          overall_similarity_score: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
        }[]
      }
      find_best_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          max_distance_km?: number
          prop_type: string
          target_area: number
        }
        Returns: {
          address: string
          area_similarity_score: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          overall_similarity_score: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
        }[]
      }
      find_comparables_progressive_radius: {
        Args: {
          target_estrato: Database["public"]["Enums"]["estrato_social"]
          target_lat: number
          target_lng: number
          target_property_type?: string
        }
        Returns: {
          address: string
          distance_km: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          total_area: number
        }[]
      }
      find_comparables_public: {
        Args: {
          target_estrato: Database["public"]["Enums"]["estrato_social"]
          target_lat: number
          target_lng: number
          target_property_type?: string
        }
        Returns: {
          approximate_latitude: number
          approximate_longitude: number
          distance_km: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          general_location: string
          id: string
          price_range: string
          property_type: string
          total_area: number
        }[]
      }
      find_comparables_within_radius: {
        Args: {
          center_lat: number
          center_lng: number
          prop_type: string
          radius_km: number
        }
        Returns: {
          address: string
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
        }[]
      }
      find_exact_type_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          prop_type: string
          target_area: number
          target_price_range?: number
        }
        Returns: {
          address: string
          adjusted_price_per_sqm: number
          adjusted_price_usd: number
          area_difference: number
          area_similarity_score: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          market_adjustment_factor: number
          months_old: number
          overall_similarity_score: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
          type_match_score: number
        }[]
      }
      find_flexible_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          max_distance_km?: number
          prop_type: string
          target_area: number
        }
        Returns: {
          address: string
          area_similarity_score: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          months_old: number
          overall_similarity_score: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
        }[]
      }
      find_market_adjusted_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          prop_type: string
          target_area: number
          target_price_range?: number
        }
        Returns: {
          address: string
          adjusted_price_per_sqm: number
          adjusted_price_usd: number
          area_difference: number
          area_similarity_score: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          id: string
          latitude: number
          longitude: number
          market_adjustment_factor: number
          months_old: number
          overall_similarity_score: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          total_area: number
        }[]
      }
      find_professional_comparables: {
        Args: {
          center_lat: number
          center_lng: number
          prop_type: string
          target_age_years?: number
          target_area: number
          target_bathrooms?: number
          target_bedrooms?: number
        }
        Returns: {
          address: string
          adjusted_price_per_sqm: number
          adjusted_price_usd: number
          age_years: number
          area_adjustment_factor: number
          bathrooms: number
          bedrooms: number
          condition_adjustment_factor: number
          distance: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          gross_adjustment_amount: number
          id: string
          latitude: number
          location_adjustment_factor: number
          longitude: number
          months_old: number
          net_adjustment_amount: number
          overall_adjustment_factor: number
          price_per_sqm_usd: number
          price_usd: number
          property_type: string
          sale_date: string
          selection_reason: string
          similarity_score: number
          time_adjustment_factor: number
          total_area: number
        }[]
      }
      get_property_comparables_public: {
        Args: { limit_rows?: number; offset_rows?: number }
        Returns: {
          approximate_latitude: number
          approximate_longitude: number
          estrato_social: Database["public"]["Enums"]["estrato_social"]
          general_location: string
          id: string
          price_range: string
          property_type: string
          total_area: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authorized: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      estrato_social:
        | "alto_alto"
        | "alto_medio"
        | "alto_bajo"
        | "medio_alto"
        | "medio_medio"
        | "medio_bajo"
        | "bajo_alto"
        | "bajo_medio"
        | "bajo_bajo"
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
    Enums: {
      estrato_social: [
        "alto_alto",
        "alto_medio",
        "alto_bajo",
        "medio_alto",
        "medio_medio",
        "medio_bajo",
        "bajo_alto",
        "bajo_medio",
        "bajo_bajo",
      ],
    },
  },
} as const
