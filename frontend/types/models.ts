export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Department extends BaseEntity {
  name: string;
  code: string;
  head_id?: number | null;
}

export interface Student extends BaseEntity {
  enrollment_number: string;
  name: string;
  email?: string | null;
  department_id: number;
  section_id?: number | null;
  batch: string;
  status: string;
}

export interface UploadedFile extends BaseEntity {
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  uploaded_by?: number | null;
  status: string;
  import_summary?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: int;
  skip: number;
  limit: number;
}
