import React from 'react';

export type AdminTabKey = 'manage' | 'batch_add' | 'batch_delete';

interface AdminTabsProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

const tabLabels: Record<AdminTabKey, string> = {
  manage: '账户管理',
  batch_add: '批量添加',
  batch_delete: '批量删除',
};

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="admin-tabs" role="tablist">
      {(Object.keys(tabLabels) as AdminTabKey[]).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls={`admin-tab-panel-${tab}`}
          id={`admin-tab-${tab}`}
          className={activeTab === tab ? 'active' : ''}
          onClick={() => onTabChange(tab)}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;
