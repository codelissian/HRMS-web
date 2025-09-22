export interface WorkDayRule {
  id: string;
  organisation_id: string;
  name: string;
  workweek: 'five_days' | 'six_days' | 'seven_days';
  created_at?: string;
  updated_at?: string;
}

export interface WorkDayRuleListResponse {
  data: WorkDayRule[];
  total_count: number;
  page_count: number;
  current_page: number;
  page_size: number;
}

export interface WorkDayRuleListParams {
  page?: number;
  page_size?: number;
  search?: string;
}