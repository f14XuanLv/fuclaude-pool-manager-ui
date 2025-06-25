
import React, { useState, FormEvent, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { AdminAddPayload, AdminApiResponse } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminAddTabProps {
  onActionSuccess?: () => void;
}

const AdminAddTab: React.FC<AdminAddTabProps> = ({ onActionSuccess }) => {
  const [email, setEmail] = useState('');
  const [sk, setSk] = useState('');
  const { callApi, isLoading, error } = useApi<AdminAddPayload, AdminApiResponse>();
  const toastCtx = useContext(ToastContext);
  const { adminPassword } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toastCtx || !adminPassword) {
        toastCtx?.showToast("管理员未登录或会话已过期。", "error");
        return;
    }
    if (!email || !sk) {
      toastCtx.showToast("邮箱和SK都不能为空。", "error");
      return;
    }
    try {
      const payload: AdminAddPayload = { email, sk, admin_password: adminPassword };
      const data = await callApi('/api/admin/add', 'POST', payload, adminPassword);
      toastCtx.showToast(data.message, "success");
      setEmail('');
      setSk('');
      onActionSuccess?.();
    } catch (e) {
      // error already handled by useApi and toast context
    }
  };

  return (
    <div id="admin-tab-panel-add" role="tabpanel" aria-labelledby="admin-tab-add" className="admin-action-section">
      <h3>添加账户</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="addEmail">邮箱地址:</label>
          <input type="text" id="addEmail" value={email} onChange={e => setEmail(e.target.value)} required aria-required="true" />
        </div>
        <div className="form-group">
          <label htmlFor="addSk">Session Key (SK):</label>
          <input type="text" id="addSk" value={sk} onChange={e => setSk(e.target.value)} required aria-required="true" />
        </div>
        {isLoading && <LoadingIndicator message="添加中..." />}
        {error && !isLoading && <p className="error-message" role="alert">添加失败: {error}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? '添加中...' : '添加账户'}</button>
      </form>
    </div>
  );
};

export default AdminAddTab;