import React, { useState } from 'react';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import AdminTabs, { AdminTabKey } from '../components/admin/AdminTabs';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminBatchAddTab from '../components/admin/AdminBatchAddTab';
import AccountManagementTab from '../components/admin/AccountManagementTab';

const AdminView: React.FC = () => {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('manage');

  const handleActionSuccess = () => {
    // This function might need to be passed down to the management tab
    // to trigger a refresh within it. For now, it's a placeholder.
  };

  if (!isAdminAuthenticated) {
    return (
      <main className="view-section" aria-labelledby="admin-view-title">
        <h2 id="admin-view-title">管理后台</h2>
        <AdminLoginForm />
      </main>
    );
  }

  return (
    <main className="view-section" aria-labelledby="admin-view-title">
      <h2 id="admin-view-title">管理后台</h2>
      <div className="info-message" role="status">
        管理员已登录。
        <button onClick={logout} className="secondary logout-button">
          退出登录
        </button>
      </div>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'manage' && <AccountManagementTab />}
      {activeTab === 'batch_add' && <AdminBatchAddTab onActionSuccess={() => setActiveTab('manage')} />}
    </main>
  );
};

export default AdminView;