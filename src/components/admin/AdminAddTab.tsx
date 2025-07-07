import React from 'react';
import AdminActionForm, { FormField } from './AdminActionForm';
import { AdminAddPayload } from '../../types';
import { API_PATHS } from '../../utils/apiConstants';

interface AdminAddTabProps {
  onActionSuccess?: () => void;
}

const addFields: FormField[] = [
  { name: 'email', label: '邮箱地址', required: true },
  { name: 'sk', label: 'Session Key (SK)', required: true },
];

const AdminAddTab: React.FC<AdminAddTabProps> = ({ onActionSuccess }) => {
  return (
    <div id="admin-tab-panel-add" role="tabpanel" aria-labelledby="admin-tab-add">
      <AdminActionForm<AdminAddPayload>
        title="添加账户"
        fields={addFields}
        apiPath={API_PATHS.ADMIN_ADD}
        submitButtonText="添加账户"
        loadingMessage="添加中..."
        buildPayload={(formState, adminPassword) => ({
          email: formState.email,
          sk: formState.sk,
          admin_password: adminPassword,
        })}
        onActionSuccess={onActionSuccess}
      />
    </div>
  );
};

export default AdminAddTab;