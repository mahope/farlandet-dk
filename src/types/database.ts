// ============================================================================
// Supabase Database Types
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string | null
          file_path: string | null
          resource_type: Database['public']['Enums']['resource_type']
          category_id: string | null
          submitter_email: string | null
          submitter_id: string | null
          status: Database['public']['Enums']['resource_status']
          vote_score: number
          view_count: number
          rejection_reason: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          resource_type: Database['public']['Enums']['resource_type']
          category_id?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          status?: Database['public']['Enums']['resource_status']
          vote_score?: number
          view_count?: number
          rejection_reason?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          resource_type?: Database['public']['Enums']['resource_type']
          category_id?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          status?: Database['public']['Enums']['resource_status']
          vote_score?: number
          view_count?: number
          rejection_reason?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      resource_tags: {
        Row: {
          resource_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          resource_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          resource_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_tags_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          vote_type: Database['public']['Enums']['vote_type']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          vote_type: Database['public']['Enums']['vote_type']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          vote_type?: Database['public']['Enums']['vote_type']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          resource_id: string
          user_id: string
          content: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id: string
          content: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          user_id?: string
          content?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_resource: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string | null
          url: string | null
          file_path: string | null
          resource_type: Database['public']['Enums']['resource_type']
          category_id: string | null
          submitter_email: string | null
          submitter_id: string | null
          status: Database['public']['Enums']['resource_status']
          vote_score: number
          view_count: number
          rejection_reason: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }[]
      }
      increment_view_count: {
        Args: {
          resource_id: string
        }
        Returns: undefined
      }
      update_vote_score: {
        Args: {
          resource_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'user' | 'moderator' | 'admin'
      resource_status: 'pending' | 'approved' | 'rejected'
      resource_type: 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'
      vote_type: 'up' | 'down'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never