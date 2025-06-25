
import React, { useEffect, useCallback, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { EmailSkMapEntry } from '../../types';
import LoadingIndicator from '../LoadingIndicator';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminListTabProps {
  refreshKey: number; // Add refreshKey prop
}

const AdminListTab: React.FC<AdminListTabProps> = ({ refreshKey }) => {
  const { callApi, data: adminSkList, isLoading, error } = useApi<null, EmailSkMapEntry[]>();
  const { adminPassword } = useAdminAuth();

  const fetchAdminSkList = useCallback(async () => {
    if (!adminPassword) return;
    // For GET /api/admin/list, adminPassword is the 4th arg (for query param), 5th arg (isAdminGetList) is true
    await callApi('/api/admin/list', 'GET', null, adminPassword, true);
  }, [callApi, adminPassword]);

  useEffect(() => {
    fetchAdminSkList();
  }, [fetchAdminSkList, refreshKey]); // Add refreshKey to dependency array

  return (
    <div id="admin-tab-panel-list" role="tabpanel" aria-labelledby="admin-tab-list" className="admin-action-section">
      <h3>账户列表 <button onClick={fetchAdminSkList} disabled={isLoading} className="refresh-button">刷新</button></h3>
      {isLoading && <LoadingIndicator />}
      {error && !isLoading && <p className="error-message" role="alert">获取列表失败: {error}</p>}
      {!isLoading && !error && (!adminSkList || adminSkList.length === 0) && <p>当前没有账户记录。</p>}
      {!isLoading && !error && adminSkList && adminSkList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>邮箱</th>
              <th>SK 预览</th>
            </tr>
          </thead>
          <tbody>
            {adminSkList.map((item) => (
              <tr key={item.email}>
                <td>{item.index}</td>
                <td>{item.email}</td>
                <td>{item.sk_preview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminListTab;