
import React, { useState, FormEvent, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { AdminDeletePayload, AdminApiResponse } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminDeleteTabProps {
  onActionSuccess?: () => void;
}

const AdminDeleteTab: React.FC<AdminDeleteTabProps> = ({ onActionSuccess }) => {
  const [email, setEmail] = useState('');
  const { callApi, isLoading, error } = useApi<AdminDeletePayload, AdminApiResponse>();
  const toastCtx = useContext(ToastContext);
  const { adminPassword } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toastCtx || !adminPassword) {
        toastCtx?.showToast("管理员未登录或会话已过期。", "error");
        return;
    }
    if (!email) {
      toastCtx.showToast("要删除的邮箱不能为空。", "error");
      return;
    }
    if (!window.confirm(`确定要删除账户 ${email} 吗? 此操作无法撤销。`)) {
      return;
    }
    try {
      const payload: AdminDeletePayload = { email, admin_password: adminPassword };
      const data = await callApi('/api/admin/delete', 'POST', payload, adminPassword);
      toastCtx.showToast(data.message, "success");
      setEmail('');
      onActionSuccess?.();
    } catch (e) { /* error handled by useApi */ }
  };

  return (
    <div id="admin-tab-panel-delete" role="tabpanel" aria-labelledby="admin-tab-delete" className="admin-action-section">
      <h3>删除账户</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deleteEmail">要删除的邮箱地址:</label>
          <input type="text" id="deleteEmail" value={email} onChange={e => setEmail(e.target.value)} required aria-required="true" />
        </div>
        {isLoading && <LoadingIndicator message="删除中..." />}
        {error && !isLoading && <p className="error-message" role="alert">删除失败: {error}</p>}
        <button type="submit" className="danger" disabled={isLoading}>{isLoading ? '删除中...' : '删除账户'}</button>
      </form>
    </div>
  );
};

export default AdminDeleteTab;