export interface Holiday {
  id: string;
  name: string;
  organisation_id: string;
  type: 'normal' | 'special';
  date: string;
  description: string;
  is_recurring: boolean;
  active_flag: boolean;
  delete_flag: boolean;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
}

export interface CreateHolidayRequest {
  name: string;
  date: string;
  description: string;
  is_recurring: boolean;
  active_flag: boolean;
}

export interface UpdateHolidayRequest extends CreateHolidayRequest {
  id: string;
}

export interface HolidayListRequest {
  page: number;
  page_size: number;
}

export interface HolidayDetailRequest {
  id: string;
}

export interface HolidayDeleteRequest {
  id: string;
}

export interface HolidayListResponse {
  data: Holiday[];
  total_count: number;
  page_count: number;
  page_size: number;
  page: number;
}

export interface HolidayFormData {
  name: string;
  date: string;
  description: string;
  is_recurring: boolean;
}
