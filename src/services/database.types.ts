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
    PostgrestVersion: "14.18"
  }
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_clear_week: { Args: { p_week_start: string }; Returns: Json }
      admin_delete_lesson: { Args: { p_id: number }; Returns: Json }
      admin_delete_reply: { Args: { p_reply_id: number }; Returns: Json }
      admin_dismiss_reports: {
        Args: { p_target_id: number; p_target_type: string }
        Returns: Json
      }
      admin_explanations_page: {
        Args: {
          p_cursor?: Json
          p_filter?: string
          p_limit?: number
          p_question_id: number
        }
        Returns: Json
      }
      admin_get_app_config: { Args: never; Returns: Json }
      admin_get_lesson: { Args: { p_id: number }; Returns: Json }
      admin_get_today: { Args: never; Returns: Json }
      admin_get_user: { Args: { p_id: string }; Returns: Json }
      admin_lesson_translation: {
        Args: { p_lesson_id: number; p_locale: string }
        Returns: Json
      }
      admin_lesson_translations: {
        Args: { p_lesson_id: number }
        Returns: Json
      }
      admin_lesson_weeks: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      admin_list_explanations: {
        Args: { p_limit?: number; p_question_id: number }
        Returns: Json
      }
      admin_list_pushes: { Args: { p_limit?: number }; Returns: Json }
      admin_list_questions: { Args: never; Returns: Json }
      admin_list_users: {
        Args: {
          p_joined_month?: string
          p_page?: number
          p_page_size?: number
          p_plan?: string
          p_provider?: string
          p_query?: string
          p_sort?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_mark_locale_reviewed: {
        Args: { p_lesson_id: number; p_locale: string }
        Returns: Json
      }
      admin_move_week: { Args: { p_from: string; p_to: string }; Returns: Json }
      admin_question_history: { Args: { p_question_id: number }; Returns: Json }
      admin_remove_explanation: { Args: { p_answer_id: number }; Returns: Json }
      admin_replies_page: {
        Args: { p_answer_id: number; p_cursor?: Json; p_limit?: number }
        Returns: Json
      }
      admin_save_app_config: { Args: { p_values: Json }; Returns: Json }
      admin_save_card_translation: {
        Args: { p_card_id: number; p_content: Json; p_locale: string }
        Returns: Json
      }
      admin_save_question: {
        Args: {
          p_answer_key: Json
          p_author_name: string
          p_content: Json
          p_date: string
          p_explanation: string
          p_id: number
          p_prompt: string
          p_publish: boolean
          p_type: string
        }
        Returns: Json
      }
      admin_save_vocab_translation: {
        Args: {
          p_example?: string
          p_locale: string
          p_meaning: string
          p_vocab_item_id: number
        }
        Returns: Json
      }
      admin_save_week_lesson: {
        Args: { p_lesson: Json; p_week_start: string }
        Returns: Json
      }
      admin_schedule_question: {
        Args: { p_date: string; p_question_id: number }
        Returns: Json
      }
      admin_search_questions: {
        Args: {
          p_cursor?: Json
          p_limit?: number
          p_offset?: number
          p_pickable?: boolean
          p_query?: string
          p_sort?: string
          p_source?: string
          p_status?: string
          p_type?: string
        }
        Returns: Json
      }
      admin_set_question_card: {
        Args: { p_card_id: number; p_question_id: number }
        Returns: Json
      }
      admin_set_question_lesson: {
        Args: { p_lesson_id: number; p_question_id: number }
        Returns: Json
      }
      admin_set_translation_status: {
        Args: {
          p_id: number
          p_kind: string
          p_locale: string
          p_status: string
        }
        Returns: Json
      }
      admin_week_dashboard: { Args: { p_week_start?: string }; Returns: Json }
      admin_weeks_needing_work: { Args: never; Returns: Json }
      apply_ai_moderation: {
        Args: {
          p_id: number
          p_reason: string
          p_target: string
          p_text: string
        }
        Returns: boolean
      }
      claim_daily_push: {
        Args: {
          p_body: string
          p_local_date: string
          p_title: string
          p_topic: string
        }
        Returns: number
      }
      claim_legacy_gift: {
        Args: { p_grant?: boolean; p_transactions: Json; p_user_id: string }
        Returns: Json
      }
      create_reply: {
        Args: { p_answer_id: number; p_text: string }
        Returns: Json
      }
      daily_push_question: { Args: never; Returns: Json }
      delete_account: { Args: never; Returns: Json }
      delete_reply: { Args: { p_reply_id: number }; Returns: Json }
      finish_push: {
        Args: { p_error?: string; p_id: number }
        Returns: undefined
      }
      get_answer_replies: {
        Args: { p_answer_id: number; p_cursor?: Json; p_limit?: number }
        Returns: Json
      }
      get_app_config: { Args: never; Returns: Json }
      get_apple_refresh_token: { Args: { p_user_id: string }; Returns: string }
      get_community_answers: {
        Args: { p_cursor?: Json; p_limit?: number; p_question_id: number }
        Returns: Json
      }
      get_daily_question: { Args: { p_day?: string }; Returns: Json }
      get_day_question: { Args: { p_date: string }; Returns: Json }
      get_me: { Args: never; Returns: Json }
      get_week: { Args: { p_locale?: string; p_which?: string }; Returns: Json }
      is_admin_user: { Args: { p_user: string }; Returns: boolean }
      log_admin_push: {
        Args: { p_body: string; p_title: string; p_user: string }
        Returns: number
      }
      mark_answer_trial_seen: { Args: never; Returns: Json }
      mark_legacy_gift_seen: { Args: never; Returns: Json }
      moderation_target: {
        Args: { p_id: number; p_target: string }
        Returns: Json
      }
      register_push_token: {
        Args: { p_app_version?: string; p_platform: string; p_token: string }
        Returns: Json
      }
      report_content: {
        Args: {
          p_note?: string
          p_reason: string
          p_target_id: number
          p_target_type: string
        }
        Returns: Json
      }
      save_apple_sign_in: {
        Args: {
          p_full_name?: string
          p_refresh_token?: string
          p_user_id: string
        }
        Returns: Json
      }
      save_lesson_progress: {
        Args: {
          p_card_ids: number[]
          p_completed?: boolean
          p_lesson_id: number
        }
        Returns: Json
      }
      submit_answer: {
        Args: {
          p_explanation?: string
          p_question_id: number
          p_require_lesson?: boolean
          p_response: Json
        }
        Returns: Json
      }
      sync_revenuecat_entitlements: {
        Args: { p_entitlements: Json; p_event_id: string; p_user_id: string }
        Returns: Json
      }
      toggle_like: { Args: { p_answer_id: number }; Returns: Json }
      translate_jobs: {
        Args: { p_force?: boolean; p_lesson_id: number; p_locales?: string[] }
        Returns: Json
      }
      translate_save_card: {
        Args: { p_card_id: number; p_content: Json; p_locale: string }
        Returns: Json
      }
      translate_save_word: {
        Args: {
          p_example: string
          p_locale: string
          p_meaning: string
          p_vocab_item_id: number
        }
        Returns: Json
      }
      unregister_push_token: { Args: { p_token: string }; Returns: Json }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  api: {
    Enums: {},
  },
} as const
