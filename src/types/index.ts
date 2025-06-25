
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
  type: 'success' | 'error';
};

export type LoginPayload = {
  mode: 'random' | 'specific';
  email?: string;
  unique_name?: string;
};

export type LoginResponse = {
  login_url: string;
};

export type AdminAddPayload = {
  email: string;
  sk: string;
  admin_password: string;
};

export type AdminUpdatePayload = {
  email: string;
  new_email?: string;
  new_sk?: string;
  admin_password: string;
};

export type AdminDeletePayload = {
  email: string;
  admin_password: string;
};

export type AdminBatchPayload = {
  actions: AdminBatchAction[];
  admin_password: string;
};

export type AdminApiResponse = {
  message: string;
};

export type AdminBatchApiResponse = AdminApiResponse & {
  results: AdminBatchResultItem[];
};