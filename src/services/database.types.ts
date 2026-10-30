export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      admin_get_today: { Args: never; Returns: Json }
      admin_list_explanations: {
        Args: { p_limit?: number; p_question_id: number }
        Returns: Json
      }
      admin_list_pushes: { Args: { p_limit?: number }; Returns: Json }
      admin_list_questions: { Args: never; Returns: Json }
      admin_question_history: { Args: { p_question_id: number }; Returns: Json }
      admin_remove_explanation: { Args: { p_answer_id: number }; Returns: Json }
      admin_replies_page: {
        Args: { p_answer_id: number; p_cursor?: Json; p_limit?: number }
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
      get_community_answers: {
        Args: { p_cursor?: Json; p_limit?: number; p_question_id: number }
        Returns: Json
      }
      get_daily_question: { Args: { p_day?: string }; Returns: Json }
      get_me: { Args: never; Returns: Json }
      log_admin_push: {
        Args: { p_body: string; p_title: string; p_user: string }
        Returns: number
      }
      mark_legacy_gift_seen: { Args: never; Returns: Json }
      report_content: {
        Args: {
          p_note?: string
          p_reason: string
          p_target_id: number
          p_target_type: string
        }
        Returns: Json
      }
      submit_answer: {
        Args: {
          p_explanation?: string
          p_question_id: number
          p_response: Json
        }
        Returns: Json
      }
      sync_revenuecat_entitlements: {
        Args: { p_entitlements: Json; p_event_id: string; p_user_id: string }
        Returns: Json
      }
      toggle_like: { Args: { p_answer_id: number }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  api: {
    Enums: {},
  },
} as const
