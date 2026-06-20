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
          content_en: string | null
          copyright_check_notes: string | null
          copyright_check_status: string
          copyright_checked_at: string | null
          copyright_declaration: Json | null
          cover_image_url: string | null
          created_at: string
          excerpt: string
          excerpt_en: string | null
          id: string
          published_at: string
          reply_to_id: string | null
          scheduled_for: string | null
          slug: string
          status: string
          title: string
          title_en: string | null
          translated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          category: string
          content?: string
          content_en?: string | null
          copyright_check_notes?: string | null
          copyright_check_status?: string
          copyright_checked_at?: string | null
          copyright_declaration?: Json | null
          cover_image_url?: string | null
          created_at?: string
          excerpt: string
          excerpt_en?: string | null
          id?: string
          published_at?: string
          reply_to_id?: string | null
          scheduled_for?: string | null
          slug: string
          status?: string
          title: string
          title_en?: string | null
          translated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          content_en?: string | null
          copyright_check_notes?: string | null
          copyright_check_status?: string
          copyright_checked_at?: string | null
          copyright_declaration?: Json | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          excerpt_en?: string | null
          id?: string
          published_at?: string
          reply_to_id?: string | null
          scheduled_for?: string | null
          slug?: string
          status?: string
          title?: string
          title_en?: string | null
          translated_at?: string | null
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
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_deliveries: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          id: string
          issue_id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          issue_id: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          issue_id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_deliveries_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_deliveries_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_issues: {
        Row: {
          content_blocks: Json
          created_at: string
          created_by: string | null
          failed_count: number
          id: string
          preheader: string | null
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          title: string
          total_recipients: number
          updated_at: string
        }
        Insert: {
          content_blocks?: Json
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          preheader?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          title: string
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          content_blocks?: Json
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          preheader?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          title?: string
          total_recipients?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          bounced_at: string | null
          confirmation_token: string
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          last_error: string | null
          locale: string
          source: string
          status: string
          unsubscribe_token: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bounced_at?: string | null
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          last_error?: string | null
          locale?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bounced_at?: string | null
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          last_error?: string | null
          locale?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliation: string | null
          avatar_url: string | null
          bio: string
          consent_public: boolean
          created_at: string
          display_name: string
          display_priority: number | null
          figure_category: string | null
          id: string
          member_type: string | null
          public_email: string | null
          reality_id: string | null
          role_collective: string | null
          role_real_life: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string
          consent_public?: boolean
          created_at?: string
          display_name?: string
          display_priority?: number | null
          figure_category?: string | null
          id?: string
          member_type?: string | null
          public_email?: string | null
          reality_id?: string | null
          role_collective?: string | null
          role_real_life?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string
          consent_public?: boolean
          created_at?: string
          display_name?: string
          display_priority?: number | null
          figure_category?: string | null
          id?: string
          member_type?: string | null
          public_email?: string | null
          reality_id?: string | null
          role_collective?: string | null
          role_real_life?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
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
          categories: string[]
          category: string | null
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
          description_en: string | null
          fb_link: string | null
          history: string
          history_en: string | null
          id: string
          ig_link: string | null
          image_url: string | null
          lat: number
          linkedin_link: string | null
          lng: number
          name: string
          name_en: string | null
          region: string
          status: string
          translated_at: string | null
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
          categories?: string[]
          category?: string | null
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
          description_en?: string | null
          fb_link?: string | null
          history?: string
          history_en?: string | null
          id?: string
          ig_link?: string | null
          image_url?: string | null
          lat: number
          linkedin_link?: string | null
          lng: number
          name: string
          name_en?: string | null
          region: string
          status?: string
          translated_at?: string | null
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
          categories?: string[]
          category?: string | null
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
          description_en?: string | null
          fb_link?: string | null
          history?: string
          history_en?: string | null
          id?: string
          ig_link?: string | null
          image_url?: string | null
          lat?: number
          linkedin_link?: string | null
          lng?: number
          name?: string
          name_en?: string | null
          region?: string
          status?: string
          translated_at?: string | null
          type?: Database["public"]["Enums"]["reality_type"]
          updated_at?: string
          website?: string | null
          year_closed?: number | null
          year_founded?: number
          zip_code?: string | null
        }
        Relationships: []
      }
      reality_bookmarks: {
        Row: {
          created_at: string
          id: string
          reality_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reality_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reality_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_bookmarks_reality_id_fkey"
            columns: ["reality_id"]
            isOneToOne: false
            referencedRelation: "realities"
            referencedColumns: ["id"]
          },
        ]
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
      reality_reports: {
        Row: {
          admin_notes: string | null
          city: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          region: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_user_id: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          city?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          city?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      apply_translation: {
        Args: { _fields: Json; _id: string; _table: string }
        Returns: undefined
      }
      auto_confirm_pending_realities: { Args: never; Returns: number }
      get_public_stats: {
        Args: never
        Returns: {
          articles: number
          mapped: number
          members: number
          regions: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      newsletter_enqueue_issue: { Args: { _issue_id: string }; Returns: number }
      publish_scheduled_posts: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "author" | "coordinatore"
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
      app_role: ["admin", "moderator", "user", "author", "coordinatore"],
      reality_type: ["nomade", "con-sede", "scomparsa"],
    },
  },
} as const
