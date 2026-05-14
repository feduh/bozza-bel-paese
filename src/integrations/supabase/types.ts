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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          published_at: string
          reply_to_id: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          category: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string
          reply_to_id?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string
          reply_to_id?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          affiliation: string | null
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          reality_id: string | null
          social_instagram: string | null
          social_twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          reality_id?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          reality_id?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reality_id_fkey"
            columns: ["reality_id"]
            isOneToOne: false
            referencedRelation: "realities"
            referencedColumns: ["id"]
          },
        ]
      }
      realities: {
        Row: {
          address: string | null
          auto_confirm_at: string | null
          city: string
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_status: string
          contact_email: string | null
          contacted_at: string | null
          country: string
          created_at: string
          created_by: string | null
          description: string
          fb_link: string | null
          history: string
          id: string
          ig_link: string | null
          image_url: string | null
          lat: number
          linkedin_link: string | null
          lng: number
          name: string
          region: string
          status: string
          type: Database["public"]["Enums"]["reality_type"]
          updated_at: string
          website: string | null
          year_closed: number | null
          year_founded: number
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          auto_confirm_at?: string | null
          city: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_status?: string
          contact_email?: string | null
          contacted_at?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string
          fb_link?: string | null
          history?: string
          id?: string
          ig_link?: string | null
          image_url?: string | null
          lat: number
          linkedin_link?: string | null
          lng: number
          name: string
          region: string
          status?: string
          type: Database["public"]["Enums"]["reality_type"]
          updated_at?: string
          website?: string | null
          year_closed?: number | null
          year_founded: number
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          auto_confirm_at?: string | null
          city?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_status?: string
          contact_email?: string | null
          contacted_at?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string
          fb_link?: string | null
          history?: string
          id?: string
          ig_link?: string | null
          image_url?: string | null
          lat?: number
          linkedin_link?: string | null
          lng?: number
          name?: string
          region?: string
          status?: string
          type?: Database["public"]["Enums"]["reality_type"]
          updated_at?: string
          website?: string | null
          year_closed?: number | null
          year_founded?: number
          zip_code?: string | null
        }
        Relationships: []
      }
      reality_images: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          credit: string | null
          id: string
          reality_id: string
          sort_order: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          id?: string
          reality_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          id?: string
          reality_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_images_reality_id_fkey"
            columns: ["reality_id"]
            isOneToOne: false
            referencedRelation: "realities"
            referencedColumns: ["id"]
          },
        ]
      }
      reality_tags: {
        Row: {
          id: string
          reality_id: string
          tag: string
        }
        Insert: {
          id?: string
          reality_id: string
          tag: string
        }
        Update: {
          id?: string
          reality_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_tags_reality_id_fkey"
            columns: ["reality_id"]
            isOneToOne: false
            referencedRelation: "realities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_confirm_pending_realities: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "author" | "collaborator"
      reality_type: "nomade" | "con-sede" | "scomparsa"
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
      app_role: ["admin", "moderator", "user", "author", "collaborator"],
      reality_type: ["nomade", "con-sede", "scomparsa"],
    },
  },
} as const
