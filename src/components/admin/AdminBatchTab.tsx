
import React, { useState, FormEvent, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { AdminBatchPayload, AdminBatchApiResponse, AdminBatchAction, AdminBatchResultItem } from '../../types';
import { API_PATHS } from '../../utils/apiConstants';
import LoadingIndicator from '../LoadingIndicator';
import { ToastContext } from '../../contexts/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminBatchTabProps {
  onActionSuccess?: () => void;
}

const AdminBatchTab: React.FC<AdminBatchTabProps> = ({ onActionSuccess }) => {
  const [batchJson, setBatchJson] = useState('');
  const [batchResults, setBatchResults] = useState<AdminBatchResultItem[] | null>(null);
  const { callApi, isLoading, error: apiCallError, clearError } = useApi<AdminBatchPayload, AdminBatchApiResponse>();
  const toastCtx = useContext(ToastContext);
  const { adminPassword } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toastCtx || !adminPassword) {
        toastCtx?.showToast("管理员未登录或会话已过期。", "error");
        return;
    }
    clearError();
    setBatchResults(null);

    let parsedActions: AdminBatchAction[];
    try {
      const parsedInput = JSON.parse(batchJson);
      if (parsedInput && Array.isArray(parsedInput)) {
        parsedActions = parsedInput;
      } else if (parsedInput && Array.isArray(parsedInput.actions)) {
        // Support structure like {"actions": [...]} as well as just [...]
        parsedActions = parsedInput.actions;
      } else {
        throw new Error("JSON 格式错误: 'actions' 数组未找到或格式不正确。请提供一个 action 对象数组，或一个包含 'actions' 键 (其值为 action 对象数组) 的对象。");
      }
    } catch (err: any) {
      toastCtx.showToast(err.message || "批量操作的JSON格式无效。", "error");
      return;
    }

    try {
      const payload: AdminBatchPayload = { actions: parsedActions, admin_password: adminPassword };
      const data = await callApi(API_PATHS.ADMIN_BATCH, 'POST', payload);
      toastCtx.showToast(data.message, "success");
      setBatchResults(data.results || []);
      setBatchJson('');
      onActionSuccess?.();
    } catch (e) {
        setBatchResults(null);
     /* error handled by useApi */
    }
  };

  return (
    <div id="admin-tab-panel-batch" role="tabpanel" aria-labelledby="admin-tab-batch" className="admin-action-section">
      <h3>批量操作</h3>
      <p>请提供 JSON 格式的批量操作指令。例如: <code aria-label="JSON example for batch operations">{`[{"action": "add", "email": "user1@example.com", "sk": "sk-..."}, {"action": "delete", "email": "user2@example.com"}]`}</code> 或 <code aria-label="Alternative JSON example">{`{"actions": [{"action": "add", "email": "user@example.com", "sk": "sk-..."}] }`}</code></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="batchJson">操作指令 (JSON):</label>
          <textarea id="batchJson" value={batchJson} onChange={e => setBatchJson(e.target.value)} rows={10} required aria-required="true" />
        </div>
        {isLoading && <LoadingIndicator message="处理中..." />}
        {apiCallError && !isLoading && <p className="error-message" role="alert">批量操作失败: {apiCallError}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? '处理中...' : '执行批量操作'}</button>
      </form>
      {batchResults && (
        <div style={{ marginTop: '20px' }} role="status" aria-live="polite">
          <h4>批量操作结果:</h4>
          <ul>
            {batchResults.map((result, index) => (
              <li key={index} className={result.status.includes('fail') || result.status.includes('skipped') ? 'error-message' : 'success-message'} style={{ marginBottom: '5px', padding: '5px' }}>
                {result.email}: {result.status} {result.reason && `(${result.reason})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminBatchTab;