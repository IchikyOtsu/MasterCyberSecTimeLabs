export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          ulb_ics_url: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          ulb_ics_url?: string | null;
          updated_at?: string;
        };
        Update: {
          ulb_ics_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      unamur_courses: {
        Row: {
          id: string;
          user_id: string;
          course_code: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          course_code: string;
        };
        Update: {
          course_code?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
