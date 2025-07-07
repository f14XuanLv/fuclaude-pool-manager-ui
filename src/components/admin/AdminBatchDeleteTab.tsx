import React, { useState, useEffect, useMemo, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { EmailSkMapEntry, AdminBatchPayload, AdminBatchApiResponse, AdminBatchAction } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { API_PATHS } from '../../utils/apiConstants';

interface AdminBatchDeleteTabProps {
  onActionSuccess?: () => void;
}

const AdminBatchDeleteTab: React.FC<AdminBatchDeleteTabProps> = ({ onActionSuccess }) => {
  const { callApi: fetchList, data: accountList, isLoading: listLoading, error: listError } = useApi<null, EmailSkMapEntry[]>();
  const { callApi: batchDelete, isLoading: deleteLoading, error: deleteError } = useApi<AdminBatchPayload, AdminBatchApiResponse>();
  const { adminPassword } = useAdminAuth();
  const toastCtx = useContext(ToastContext);

  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (adminPassword) {
      const urlWithAuth = `${API_PATHS.ADMIN_LIST}?admin_password=${encodeURIComponent(adminPassword)}`;
      fetchList(urlWithAuth, 'GET');
    }
  }, [adminPassword, fetchList]);

  const filteredList = useMemo(() => {
    if (!accountList) return [];
    return accountList.filter(item => item.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [accountList, searchTerm]);

  const handleSelectionChange = (email: string, isSelected: boolean) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(email);
      } else {
        newSet.delete(email);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredList.length) {
      setSelectedEmails(new Set()); // Deselect all
    } else {
      setSelectedEmails(new Set(filteredList.map(item => item.email))); // Select all
    }
  };

  const handleSelectInvert = () => {
    const currentSelection = new Set(selectedEmails);
    const allVisibleEmails = new Set(filteredList.map(item => item.email));
    allVisibleEmails.forEach(email => {
        if(currentSelection.has(email)) {
            currentSelection.delete(email);
        } else {
            currentSelection.add(email);
        }
    });
    setSelectedEmails(currentSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedEmails.size === 0) {
      toastCtx?.showToast("请至少选择一个要删除的账户。", "error");
      return;
    }
    if (!window.confirm(`确定要删除选中的 ${selectedEmails.size} 个账户吗? 此操作无法撤销。`)) {
      return;
    }
    if (!adminPassword) {
        toastCtx?.showToast("管理员未登录或会话已过期。", "error");
        return;
    }

    const actions: AdminBatchAction[] = Array.from(selectedEmails).map(email => ({ action: 'delete', email }));
    const payload: AdminBatchPayload = { actions, admin_password: adminPassword };

    try {
      const data = await batchDelete(API_PATHS.ADMIN_BATCH, 'POST', payload);
      toastCtx?.showToast(data.message, "success");
      setSelectedEmails(new Set());
      onActionSuccess?.();
      // Refetch list after deletion
      const urlWithAuth = `${API_PATHS.ADMIN_LIST}?admin_password=${encodeURIComponent(adminPassword)}`;
      fetchList(urlWithAuth, 'GET');
    } catch (e) {
      // error handled by useApi
    }
  };

  const isLoading = listLoading || deleteLoading;

  return (
    <div id="admin-tab-panel-batch-delete" role="tabpanel" aria-labelledby="admin-tab-batch_delete" className="admin-action-section">
      <h3>批量删除账户</h3>
      <div className="batch-delete-controls">
        <input
          type="text"
          placeholder="按邮箱搜索..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSelectAll}>{selectedEmails.size === filteredList.length ? '全不选' : '全选'}</button>
        <button onClick={handleSelectInvert}>反选</button>
        <button onClick={handleDeleteSelected} disabled={deleteLoading || selectedEmails.size === 0} className="danger">
          {deleteLoading ? '删除中...' : `删除选中 (${selectedEmails.size})`}
        </button>
      </div>
      {listLoading && <LoadingIndicator message="加载账户列表..." />}
      {listError && <p className="error-message">{listError}</p>}
      <div className="batch-delete-list">
        {filteredList.map(item => (
          <div key={item.email} className="batch-delete-item">
            <input
              type="checkbox"
              id={`cb-${item.email}`}
              checked={selectedEmails.has(item.email)}
              onChange={e => handleSelectionChange(item.email, e.target.checked)}
            />
            <label htmlFor={`cb-${item.email}`}>{item.email}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBatchDeleteTab;