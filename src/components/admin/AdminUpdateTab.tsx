
import React, { useState, FormEvent, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { AdminUpdatePayload, AdminApiResponse } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminUpdateTabProps {
  onActionSuccess?: () => void;
}

const AdminUpdateTab: React.FC<AdminUpdateTabProps> = ({ onActionSuccess }) => {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSk, setNewSk] = useState('');
  const { callApi, isLoading, error } = useApi<AdminUpdatePayload, AdminApiResponse>();
  const toastCtx = useContext(ToastContext);
  const { adminPassword } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toastCtx || !adminPassword) {
        toastCtx?.showToast("管理员未登录或会话已过期。", "error");
        return;
    }

    if (!currentEmail) {
      toastCtx.showToast("当前邮箱不能为空。", "error");
      return;
    }
    if (!newEmail && !newSk) {
      toastCtx.showToast("新邮箱或新SK至少需要提供一个。", "error");
      return;
    }
    
    const payload: AdminUpdatePayload = { 
        email: currentEmail, 
        admin_password: adminPassword 
    };
    if (newEmail) payload.new_email = newEmail;
    if (newSk) payload.new_sk = newSk;

    try {
      const data = await callApi('/api/admin/update', 'POST', payload, adminPassword);
      toastCtx.showToast(data.message, "success");
      setCurrentEmail('');
      setNewEmail('');
      setNewSk('');
      onActionSuccess?.();
    } catch (e) { /* error handled by useApi */ }
  };

  return (
    <div id="admin-tab-panel-update" role="tabpanel" aria-labelledby="admin-tab-update" className="admin-action-section">
      <h3>更新账户</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="updateCurrentEmail">当前邮箱地址 (用于定位账户):</label>
          <input type="text" id="updateCurrentEmail" value={currentEmail} onChange={e => setCurrentEmail(e.target.value)} required aria-required="true" />
        </div>
        <div className="form-group">
          <label htmlFor="updateNewEmail">新邮箱地址 (可选):</label>
          <input type="text" id="updateNewEmail" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="updateNewSk">新 Session Key (可选):</label>
          <input type="text" id="updateNewSk" value={newSk} onChange={e => setNewSk(e.target.value)} />
        </div>
        {isLoading && <LoadingIndicator message="更新中..." />}
        {error && !isLoading && <p className="error-message" role="alert">更新失败: {error}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? '更新中...' : '更新账户'}</button>
      </form>
    </div>
  );
};

export default AdminUpdateTab;