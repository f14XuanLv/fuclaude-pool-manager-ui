import React, { useState } from 'react';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import AdminTabs, { AdminTabKey } from '../components/admin/AdminTabs';
import AdminListTab from '../components/admin/AdminListTab';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminAddTab from '../components/admin/AdminAddTab';
import AdminUpdateTab from '../components/admin/AdminUpdateTab';
import AdminDeleteTab from '../components/admin/AdminDeleteTab';
import AdminBatchAddTab from '../components/admin/AdminBatchAddTab';
import AdminBatchDeleteTab from '../components/admin/AdminBatchDeleteTab';

const AdminView: React.FC = () => {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('list');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleActionSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1);
    if (activeTab !== 'list') {
      setActiveTab('list');
    }
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
      {activeTab === 'list' && <AdminListTab refreshKey={refreshKey} />}
      {activeTab === 'add' && <AdminAddTab onActionSuccess={handleActionSuccess} />}
      {activeTab === 'update' && <AdminUpdateTab onActionSuccess={handleActionSuccess} />}
      {activeTab === 'delete' && <AdminDeleteTab onActionSuccess={handleActionSuccess} />}
      {activeTab === 'batch_add' && <AdminBatchAddTab onActionSuccess={handleActionSuccess} />}
      {activeTab === 'batch_delete' && <AdminBatchDeleteTab onActionSuccess={handleActionSuccess} />}
    </main>
  );
};

export default AdminView;