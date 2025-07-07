import React, { useState, FormEvent, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { AdminBatchPayload, AdminBatchApiResponse, AdminBatchAction } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { API_PATHS } from '../../utils/apiConstants';

interface AdminBatchAddTabProps {
  onActionSuccess?: () => void;
}

const AdminBatchAddTab: React.FC<AdminBatchAddTabProps> = ({ onActionSuccess }) => {
  const [plainText, setPlainText] = useState('');
  const { callApi, isLoading, error } = useApi<AdminBatchPayload, AdminBatchApiResponse>();
  const toastCtx = useContext(ToastContext);
  const { adminPassword } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toastCtx || !adminPassword) {
      toastCtx?.showToast("管理员未登录或会话已过期。", "error");
      return;
    }

    const lines = plainText.split('\n').filter(line => line.trim() !== '');
    const actions: AdminBatchAction[] = [];
    let parseError = false;

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 2 && parts[0] && parts[1]) {
        actions.push({ action: 'add', email: parts[0], sk: parts[1] });
      } else {
        toastCtx.showToast(`格式错误: "${line}"。应为 "email,sk" 格式。`, "error");
        parseError = true;
        break;
      }
    }

    if (parseError || actions.length === 0) {
      return;
    }

    try {
      const payload: AdminBatchPayload = { actions, admin_password: adminPassword };
      const data = await callApi(API_PATHS.ADMIN_BATCH, 'POST', payload);
      toastCtx.showToast(data.message, "success");
      setPlainText('');
      onActionSuccess?.();
    } catch (e) {
      // error handled by useApi
    }
  };

  return (
    <div id="admin-tab-panel-batch-add" role="tabpanel" aria-labelledby="admin-tab-batch_add" className="admin-action-section">
      <h3>批量添加账户</h3>
      <p>每行输入一个账户，格式为 <code>email,sk</code>。例如:</p>
      <pre><code>user1@example.com,sk-abc...<br/>user2@example.com,sk-def...</code></pre>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="batchAddText">账户列表:</label>
          <textarea
            id="batchAddText"
            value={plainText}
            onChange={e => setPlainText(e.target.value)}
            rows={10}
            required
            aria-required="true"
            placeholder="user1@example.com,sk-abc..."
          />
        </div>
        {isLoading && <LoadingIndicator message="处理中..." />}
        {error && !isLoading && <p className="error-message" role="alert">批量添加失败: {error}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? '处理中...' : '执行批量添加'}</button>
      </form>
    </div>
  );
};

export default AdminBatchAddTab;