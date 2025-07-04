import React from 'react';

export type AdminTabKey = 'list' | 'add' | 'update' | 'delete' | 'batch';

interface AdminTabsProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

const tabLabels: Record<AdminTabKey, string> = {
  list: '账户列表',
  add: '添加账户',
  update: '更新账户',
  delete: '删除账户',
  batch: '批量操作',
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
