import React, { useState, FormEvent, useContext } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import LoadingIndicator from '../LoadingIndicator';

const AdminLoginForm: React.FC = () => {
  const { login, tempAdminPassword, setTempAdminPassword, authLoading, authError, clearAuthError } = useAdminAuth();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAuthError();
    await login(tempAdminPassword);
  };

  return (
    <div className="auth-section">
      <h3>管理员登录</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="adminPass">管理员密码:</label>
          <input
            type="password"
            id="adminPass"
            value={tempAdminPassword}
            onChange={(e) => setTempAdminPassword(e.target.value)}
            placeholder="输入管理员密码"
            required
            aria-required="true"
            aria-describedby={authError ? "admin-auth-error" : undefined}
          />
        </div>
        {authLoading && <LoadingIndicator message="登录中..." />}
        {authError && <p id="admin-auth-error" className="error-message" role="alert">{authError}</p>}
        <button type="submit" disabled={authLoading}>
          {authLoading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
