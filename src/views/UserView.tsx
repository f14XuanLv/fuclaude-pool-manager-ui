
import React, { useState, useEffect, useContext } from 'react';
import useApi from '../hooks/useApi';
import { LoginPayload, LoginResponse } from '../types';
import EmailCard from '../components/EmailCard';
import Modal from '../components/Modal';
import LoadingIndicator from '../components/LoadingIndicator';
import { generateRandomId } from '../utils/randomId';
import { ToastContext } from '../contexts/ToastContext';

const UserView: React.FC = () => {
  const { callApi: fetchEmails, data: emailsData, isLoading: emailsLoading, error: emailsError } = useApi<undefined, { emails: string[] }>();
  const { callApi: loginApi, isLoading: loginLoading } = useApi<LoginPayload, LoginResponse>(); // Removed loginError as useApi handles toast
  const toastCtx = useContext(ToastContext);

  const [emails, setEmails] = useState<string[]>([]);
  const [showUniqueNameModal, setShowUniqueNameModal] = useState<boolean>(false);
  const [selectedEmailForLogin, setSelectedEmailForLogin] = useState<string | null>(null);
  const [uniqueName, setUniqueName] = useState<string>('');

  useEffect(() => {
    fetchEmails('/api/emails')
      .then(data => {
        if (data?.emails) setEmails(data.emails);
      })
      .catch(() => {
        // Error is already handled by useApi hook and displayed via toast
        // emailsError state will be set by useApi
        setEmails([]); // Keep emails empty on error
      });
  }, [fetchEmails]);
  
  const handleLogin = async (mode: 'random' | 'specific', email?: string, uniqueNameVal?: string) => {
    if (!toastCtx) return;
    const payload: LoginPayload = { mode };
    if (mode === 'specific') {
      if (!email || !uniqueNameVal) {
        toastCtx.showToast("邮箱和隔离标识是必需的。", "error");
        return;
      }
      payload.email = email;
      payload.unique_name = uniqueNameVal;
    }

    try {
      const data = await loginApi('/api/login', 'POST', payload);
      if (data?.login_url) {
        window.location.href = data.login_url;
      } else {
        toastCtx.showToast("未能获取登录链接。", "error");
      }
    } catch (e) {
      // Error already handled by useApi and toast context
    }
  };

  const openUniqueNameModal = (email: string) => {
    setSelectedEmailForLogin(email);
    if (!uniqueName.trim()) {
      setUniqueName(generateRandomId());
    }
    setShowUniqueNameModal(true);
  };

  const handleSpecificLoginSubmit = () => {
    if (selectedEmailForLogin && uniqueName) {
      handleLogin('specific', selectedEmailForLogin, uniqueName);
      setShowUniqueNameModal(false);
      setUniqueName(''); // Clear after attempting login
    } else {
      toastCtx?.showToast("请输入有效的隔离标识。", "error");
    }
  };

  const isLoading = emailsLoading || loginLoading;

  return (
    <main className="view-section" aria-labelledby="user-view-title">
      <h2 id="user-view-title">用户登录</h2>
      <div className="form-group">
        <button onClick={() => handleLogin('random')} disabled={isLoading} style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
          {isLoading ? '处理中...' : '🚀 随机登录'}
        </button>
        <p className="hint" style={{ textAlign: 'center', marginTop: '5px' }} id="random-login-hint">
          点击随机选择一个可用账户进行登录。
        </p>
      </div>

      <h3>或选择特定账户登录:</h3>
      {emailsLoading && <LoadingIndicator message="加载可用账户..." />}
      {emailsError && !emailsLoading && <p className="error-message" role="alert">获取账户列表失败: {emailsError}</p>}
      {!emailsLoading && !emailsError && emails.length === 0 && (
        <p className="info-message">当前没有可用的账户。请联系管理员添加。</p>
      )}
      <div className="email-list" role="list">
        {emails.map((emailToList) => ( // Renamed email to emailToList to avoid conflict
          <EmailCard key={emailToList} email={emailToList} onClick={() => openUniqueNameModal(emailToList)} />
        ))}
      </div>

      <Modal
        isOpen={showUniqueNameModal}
        onClose={() => { setShowUniqueNameModal(false); setUniqueName(''); }}
        title="输入会话隔离标识"
      >
        <p>为账户 <strong>{selectedEmailForLogin}</strong> 设置一个唯一的会话标识。</p>
        <div className="form-group">
          <label htmlFor="uniqueNameInput">隔离密码 / Unique Name:</label>
          <input
            type="text"
            id="uniqueNameInput"
            value={uniqueName}
            onChange={(e) => setUniqueName(e.target.value)}
            placeholder="例如: my-session-01"
            autoFocus
            aria-describedby="uniqueNameHint"
          />
          <p className="hint" id="uniqueNameHint">
            此标识用于区分同一账户下的不同会话，请确保其唯一性。可使用系统生成的随机值。
          </p>
        </div>
        <div className="modal-actions">
          <button onClick={handleSpecificLoginSubmit} disabled={isLoading || !uniqueName.trim()}>
            {isLoading ? '登录中...' : '登录'}
          </button>
          <button onClick={() => { setShowUniqueNameModal(false); setUniqueName(''); }} className="secondary" disabled={isLoading}>
            取消
          </button>
        </div>
      </Modal>
    </main>
  );
};

export default UserView;