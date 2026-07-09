export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole          = 'super_admin' | 'user'
export type TaskStatus        = 'pending' | 'completed' | 'skipped' | 'postponed'
export type GoalType          = 'life' | 'annual' | 'quarterly' | 'monthly'
export type GoalStatus        = 'not_started' | 'in_progress' | 'completed' | 'on_hold'
export type PlanType          = 'A' | 'B' | 'C'
export type FinanceType       = 'income' | 'expense'
export type LeadStage         = 'cold' | 'warm' | 'hot' | 'proposal' | 'client' | 'lost'
export type CallOutcome       = 'no_answer' | 'callback' | 'interested' | 'not_interested' | 'converted'
export type ProposalStatus    = 'draft' | 'sent' | 'negotiating' | 'won' | 'lost'
export type ContentPostStatus = 'idea' | 'draft' | 'scheduled' | 'published'
export type LearningStatus    = 'not_started' | 'in_progress' | 'completed' | 'on_hold'
export type FreelanceProjectStatus = 'lead' | 'proposal' | 'active' | 'completed' | 'cancelled'

export interface TimetableBlock {
  id: string
  time: string
  emoji: string
  name: string
  activity: string
  duration: string
  fixed?: boolean
}

export interface Database {
  public: {
    // Required by @supabase/supabase-js type system
    Views: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          role: UserRole
          avatar_url: string | null
          linkedin_url: string | null
          github_url: string | null
          twitter_url: string | null
          portfolio_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          role?: UserRole
          avatar_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          portfolio_url?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string | null
          bio?: string | null
          role?: UserRole
          avatar_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          portfolio_url?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications_enabled: boolean
          daily_reminder_time: string | null
          timezone: string
          week_start: string
          debt_remaining: number
          debt_total: number
          weekly_review_checks: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          daily_reminder_time?: string | null
          timezone?: string
          week_start?: string
          debt_remaining?: number
          debt_total?: number
          weekly_review_checks?: Json
        }
        Update: {
          theme?: string
          notifications_enabled?: boolean
          daily_reminder_time?: string | null
          timezone?: string
          week_start?: string
          debt_remaining?: number
          debt_total?: number
          weekly_review_checks?: Json
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          is_default: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          is_default?: boolean
          sort_order?: number
        }
        Update: {
          name?: string
          description?: string | null
          icon?: string | null
          is_default?: boolean
          sort_order?: number
        }
      }
      user_module_settings: {
        Row: {
          id: string
          user_id: string
          module_id: string
          is_enabled: boolean
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          is_enabled?: boolean
        }
        Update: {
          is_enabled?: boolean
        }
      }
      ninety_day_cycles: {
        Row: {
          id: string
          user_id: string
          cycle_number: number
          title: string | null
          goal: string | null
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_number?: number
          title?: string | null
          goal?: string | null
          start_date: string
          end_date: string
          is_active?: boolean
        }
        Update: {
          title?: string | null
          goal?: string | null
          is_active?: boolean
        }
      }
      days: {
        Row: {
          id: string
          cycle_id: string
          user_id: string
          day_number: number
          date: string
          plan_type: PlanType
          theme: string | null
          notes: string | null
          rentlyf_hours: number
        }
        Insert: {
          id?: string
          cycle_id: string
          user_id: string
          day_number: number
          date: string
          plan_type?: PlanType
          theme?: string | null
          notes?: string | null
          rentlyf_hours?: number
        }
        Update: {
          plan_type?: PlanType
          theme?: string | null
          notes?: string | null
          rentlyf_hours?: number
        }
      }
      tasks: {
        Row: {
          id: string
          day_id: string
          user_id: string
          title: string
          category: string
          platform: string | null
          status: TaskStatus
          content: string | null
          notes: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          day_id: string
          user_id: string
          title: string
          category: string
          platform?: string | null
          status?: TaskStatus
          content?: string | null
          notes?: string | null
          sort_order?: number
        }
        Update: {
          title?: string
          category?: string
          platform?: string | null
          status?: TaskStatus
          content?: string | null
          notes?: string | null
          sort_order?: number
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_type: GoalType
          title: string
          description: string | null
          status: GoalStatus
          target_value: string | null
          current_value: string | null
          unit: string | null
          deadline: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type?: GoalType
          title: string
          description?: string | null
          status?: GoalStatus
          target_value?: string | null
          current_value?: string | null
          unit?: string | null
          deadline?: string | null
          sort_order?: number
        }
        Update: {
          goal_type?: GoalType
          title?: string
          description?: string | null
          status?: GoalStatus
          target_value?: string | null
          current_value?: string | null
          unit?: string | null
          deadline?: string | null
          sort_order?: number
        }
      }
      timetable_plans: {
        Row: {
          id: string
          user_id: string
          plan_type: PlanType
          name: string
          blocks: TimetableBlock[]
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: PlanType
          name: string
          blocks?: TimetableBlock[]
        }
        Update: {
          name?: string
          blocks?: TimetableBlock[]
        }
      }
      timetable_checks: {
        Row: {
          id: string
          user_id: string
          date: string
          block_ids: string[]
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          block_ids?: string[]
        }
        Update: {
          block_ids?: string[]
        }
      }
      health_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          exercise_done: boolean
          yoga_done: boolean
          meditation_done: boolean
          skincare_done: boolean
          exercise_notes: string | null
          exercise_minutes: number | null
          weight_kg: number | null
          water_glasses: number | null
          sleep_hours: number | null
          mood: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          exercise_done?: boolean
          yoga_done?: boolean
          meditation_done?: boolean
          skincare_done?: boolean
          exercise_notes?: string | null
          exercise_minutes?: number | null
          weight_kg?: number | null
          water_glasses?: number | null
          sleep_hours?: number | null
          mood?: number | null
          notes?: string | null
        }
        Update: {
          exercise_done?: boolean
          yoga_done?: boolean
          meditation_done?: boolean
          skincare_done?: boolean
          exercise_notes?: string | null
          exercise_minutes?: number | null
          weight_kg?: number | null
          water_glasses?: number | null
          sleep_hours?: number | null
          mood?: number | null
          notes?: string | null
        }
      }
      finance_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          type: FinanceType
          category: string | null
          description: string | null
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          type: FinanceType
          category?: string | null
          description?: string | null
          amount: number
          currency?: string
        }
        Update: {
          date?: string
          type?: FinanceType
          category?: string | null
          description?: string | null
          amount?: number
          currency?: string
        }
      }
      crm_leads: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          phone: string | null
          email: string | null
          stage: LeadStage
          service: string | null
          source: string | null
          deal_value: number | null
          next_followup: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          phone?: string | null
          email?: string | null
          stage?: LeadStage
          service?: string | null
          source?: string | null
          deal_value?: number | null
          next_followup?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          company?: string | null
          phone?: string | null
          email?: string | null
          stage?: LeadStage
          service?: string | null
          source?: string | null
          deal_value?: number | null
          next_followup?: string | null
          notes?: string | null
        }
      }
      cold_calls: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          date: string
          name: string
          phone: string
          outcome: CallOutcome
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          date?: string
          name: string
          phone: string
          outcome?: CallOutcome
          notes?: string | null
        }
        Update: {
          outcome?: CallOutcome
          notes?: string | null
        }
      }
      content_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          platform: string | null
          status: ContentPostStatus
          content: string | null
          hook: string | null
          tags: string | null
          url: string | null
          scheduled_date: string | null
          pillar: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          platform?: string | null
          status?: ContentPostStatus
          content?: string | null
          hook?: string | null
          tags?: string | null
          url?: string | null
          scheduled_date?: string | null
          pillar?: string | null
        }
        Update: {
          title?: string
          platform?: string | null
          status?: ContentPostStatus
          content?: string | null
          hook?: string | null
          tags?: string | null
          url?: string | null
          scheduled_date?: string | null
          pillar?: string | null
        }
      }
      learning_resources: {
        Row: {
          id: string
          user_id: string
          title: string
          resource_type: string | null
          topic: string | null
          status: LearningStatus
          url: string | null
          notes: string | null
          total_lessons: string | null
          completed_lessons: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          resource_type?: string | null
          topic?: string | null
          status?: LearningStatus
          url?: string | null
          notes?: string | null
          total_lessons?: string | null
          completed_lessons?: string | null
        }
        Update: {
          title?: string
          resource_type?: string | null
          topic?: string | null
          status?: LearningStatus
          url?: string | null
          notes?: string | null
          total_lessons?: string | null
          completed_lessons?: string | null
        }
      }
      rentlyf_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          hours: number
          category: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          hours: number
          category?: string | null
          notes?: string | null
        }
        Update: {
          hours?: number
          category?: string | null
          notes?: string | null
        }
      }
      freelance_projects: {
        Row: {
          id: string
          user_id: string
          title: string
          client_name: string | null
          platform: string | null
          status: FreelanceProjectStatus
          budget: number | null
          paid_amount: number | null
          currency: string
          deadline: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          client_name?: string | null
          platform?: string | null
          status?: FreelanceProjectStatus
          budget?: number | null
          paid_amount?: number | null
          currency?: string
          deadline?: string | null
          notes?: string | null
        }
        Update: {
          title?: string
          client_name?: string | null
          platform?: string | null
          status?: FreelanceProjectStatus
          budget?: number | null
          paid_amount?: number | null
          currency?: string
          deadline?: string | null
          notes?: string | null
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string
          color: string
          category: string
          frequency: string
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji?: string
          color?: string
          category?: string
          frequency?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          name?: string
          emoji?: string
          color?: string
          category?: string
          frequency?: string
          is_active?: boolean
          sort_order?: number
        }
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          done: boolean
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          date: string
          done?: boolean
        }
        Update: {
          done?: boolean
        }
      }
      brand_metrics: {
        Row: {
          id: string
          user_id: string
          week_of: string
          followers: number
          profile_views: number
          search_appearances: number
          post_impressions: number
          connections: number
        }
        Insert: {
          id?: string
          user_id: string
          week_of: string
          followers?: number
          profile_views?: number
          search_appearances?: number
          post_impressions?: number
          connections?: number
        }
        Update: {
          week_of?: string
          followers?: number
          profile_views?: number
          search_appearances?: number
          post_impressions?: number
          connections?: number
        }
      }
      brand_profile_checklist: {
        Row: {
          user_id: string
          checklist: Json
        }
        Insert: {
          user_id: string
          checklist?: Json
        }
        Update: {
          checklist?: Json
        }
      }
      brand_daily_actions: {
        Row: {
          user_id: string
          date: string
          actions_done: Json
        }
        Insert: {
          user_id: string
          date: string
          actions_done?: Json
        }
        Update: {
          actions_done?: Json
        }
      }
    }
    Functions: {
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      set_super_admin: {
        Args: { admin_email: string }
        Returns: void
      }
    }
  }
}

// Convenience row types
export type UserProfile        = Database['public']['Tables']['user_profiles']['Row']
export type UserSettings       = Database['public']['Tables']['user_settings']['Row']
export type Module             = Database['public']['Tables']['modules']['Row']
export type UserModuleSetting  = Database['public']['Tables']['user_module_settings']['Row']
export type NinetyDayCycle     = Database['public']['Tables']['ninety_day_cycles']['Row']
export type Day                = Database['public']['Tables']['days']['Row']
export type Task               = Database['public']['Tables']['tasks']['Row']
export type Goal               = Database['public']['Tables']['goals']['Row']
export type TimetablePlan      = Database['public']['Tables']['timetable_plans']['Row']
export type TimetableCheck     = Database['public']['Tables']['timetable_checks']['Row']
export type HealthLog          = Database['public']['Tables']['health_logs']['Row']
export type FinanceEntry       = Database['public']['Tables']['finance_entries']['Row']
export type CrmLead            = Database['public']['Tables']['crm_leads']['Row']
export type ColdCall           = Database['public']['Tables']['cold_calls']['Row']
export type ContentPost        = Database['public']['Tables']['content_posts']['Row']
export type LearningResource   = Database['public']['Tables']['learning_resources']['Row']
export type RentlyfLog         = Database['public']['Tables']['rentlyf_logs']['Row']
export type FreelanceProject   = Database['public']['Tables']['freelance_projects']['Row']
export type Habit              = Database['public']['Tables']['habits']['Row']
export type HabitLog           = Database['public']['Tables']['habit_logs']['Row']
export type BrandMetric        = Database['public']['Tables']['brand_metrics']['Row']
export type BrandDailyAction   = Database['public']['Tables']['brand_daily_actions']['Row']
