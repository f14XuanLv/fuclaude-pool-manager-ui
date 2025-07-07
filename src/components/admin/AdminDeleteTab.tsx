import React from 'react';
import AdminActionForm, { FormField } from './AdminActionForm';
import { AdminDeletePayload } from '../../types';
import { API_PATHS } from '../../utils/apiConstants';

interface AdminDeleteTabProps {
  onActionSuccess?: () => void;
}

const deleteFields: FormField[] = [
  { name: 'email', label: '要删除的邮箱地址', required: true },
];

const AdminDeleteTab: React.FC<AdminDeleteTabProps> = ({ onActionSuccess }) => {
  return (
    <div id="admin-tab-panel-delete" role="tabpanel" aria-labelledby="admin-tab-delete">
      <AdminActionForm<AdminDeletePayload>
        title="删除账户"
        fields={deleteFields}
        apiPath={API_PATHS.ADMIN_DELETE}
        submitButtonText="删除账户"
        loadingMessage="删除中..."
        buildPayload={(formState, adminPassword) => ({
          email: formState.email,
          admin_password: adminPassword,
        })}
        onBeforeSubmit={(formState) => {
          return window.confirm(`确定要删除账户 ${formState.email} 吗? 此操作无法撤销。`);
        }}
        onActionSuccess={onActionSuccess}
      />
    </div>
  );
};

export default AdminDeleteTab;