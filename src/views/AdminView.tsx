
import React, { useState, useContext } from 'react';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import AdminTabs, { AdminTabKey } from '../components/admin/AdminTabs';
import AdminListTab from '../components/admin/AdminListTab';
import AdminAddTab from '../components/admin/AdminAddTab';
import AdminUpdateTab from '../components/admin/AdminUpdateTab';
import AdminDeleteTab from '../components/admin/AdminDeleteTab';
import AdminBatchTab from '../components/admin/AdminBatchTab';
import { useAdminAuth } from '../hooks/useAdminAuth';
// ToastContext import removed as it's not directly used here

const AdminView: React.FC = () => {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('list');
  const [refreshKey, setRefreshKey] = useState<number>(0); // Used to trigger list refresh

  const handleActionSuccess = () => {
    // Increment refreshKey to trigger a re-fetch in AdminListTab
    setRefreshKey(prevKey => prevKey + 1);
    // Optionally, switch to the list tab if not already there
    // if (activeTab !== 'list') {
    //   setActiveTab('list');
    // }
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
      {activeTab === 'batch' && <AdminBatchTab onActionSuccess={handleActionSuccess} />}
    </main>
  );
};

export default AdminView;