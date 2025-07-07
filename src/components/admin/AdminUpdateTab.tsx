import React from 'react';
import AdminActionForm, { FormField } from './AdminActionForm';
import { AdminUpdatePayload } from '../../types';
import { API_PATHS } from '../../utils/apiConstants';

interface AdminUpdateTabProps {
  onActionSuccess?: () => void;
}

const updateFields: FormField[] = [
  { name: 'email', label: '当前邮箱地址 (用于定位账户)', required: true },
  { 
    name: 'new_email', 
    label: '新邮箱地址 (可选)',
    validation: {
        validate: (value: string, formValues: Record<string, string>) => {
            return !!formValues.new_sk || !!value || "新邮箱或新SK至少需要提供一个。";
        }
    }
  },
  { 
    name: 'new_sk', 
    label: '新 Session Key (可选)',
    validation: {
        validate: (value: string, formValues: Record<string, string>) => {
            return !!formValues.new_email || !!value || "新邮箱或新SK至少需要提供一个。";
        }
    }
  },
];

const AdminUpdateTab: React.FC<AdminUpdateTabProps> = ({ onActionSuccess }) => {
  return (
    <div id="admin-tab-panel-update" role="tabpanel" aria-labelledby="admin-tab-update">
      <AdminActionForm<AdminUpdatePayload>
        title="更新账户"
        fields={updateFields}
        apiPath={API_PATHS.ADMIN_UPDATE}
        submitButtonText="更新账户"
        loadingMessage="更新中..."
        buildPayload={(formState, adminPassword) => ({
          email: formState.email,
          new_email: formState.new_email || undefined,
          new_sk: formState.new_sk || undefined,
          admin_password: adminPassword,
        })}
        onActionSuccess={onActionSuccess}
      />
    </div>
  );
};

export default AdminUpdateTab;