
export interface EmailSkMapEntry {
  index: number;
  email: string;
  sk_preview: string;
}

export interface AdminBatchAction {
  action: 'add' | 'delete';
  email: string;
  sk?: string;
}

export interface AdminBatchResultItem {
  email: string;
  status: string;
  reason?: string;
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type LoginPayload = {
  mode: 'random' | 'specific';
  email?: string;
  unique_name?: string;
  expires_in?: number;
};

export type LoginResponse = {
  login_url: string;
  warning?: string;
};

export interface AdminRequestBase {
  admin_password: string;
}

export interface AdminLoginPayload extends LoginPayload, AdminRequestBase {}

export type AdminAddPayload = {
  email: string;
  sk: string;
} & AdminRequestBase;

export type AdminUpdatePayload = {
  email: string;
  new_email?: string;
  new_sk?: string;
} & AdminRequestBase;

export type AdminDeletePayload = {
  email: string;
} & AdminRequestBase;

export type AdminBatchPayload = {
  actions: AdminBatchAction[];
} & AdminRequestBase;

export type AdminApiResponse = {
  message: string;
};

export type AdminBatchApiResponse = AdminApiResponse & {
  results: AdminBatchResultItem[];
};