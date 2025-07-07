import React, { useState, useEffect, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { EmailSkMapEntry, AdminAddPayload, AdminUpdatePayload, AdminDeletePayload, AdminApiResponse } from '../../types';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ToastContext } from '../../contexts/ToastContext';
import { API_PATHS } from '../../utils/apiConstants';
import LoadingIndicator from '../LoadingIndicator';

const AccountManagementTab: React.FC = () => {
    const { callApi: fetchList, data: accountList, isLoading: listLoading, error: listError } = useApi<null, EmailSkMapEntry[]>();
    const { callApi: addApi, isLoading: addLoading } = useApi<AdminAddPayload, AdminApiResponse>();
    const { callApi: updateApi, isLoading: updateLoading } = useApi<AdminUpdatePayload, AdminApiResponse>();
    const { callApi: deleteApi, isLoading: deleteLoading } = useApi<AdminDeletePayload, AdminApiResponse>();
    
    const { adminPassword } = useAdminAuth();
    const toastCtx = useContext(ToastContext);

    const [editingRow, setEditingRow] = useState<Record<string, string>>({});
    const [newAccount, setNewAccount] = useState({ email: '', sk: '' });

    const fetchAccounts = () => {
        if (adminPassword) {
            const urlWithAuth = `${API_PATHS.ADMIN_LIST}?admin_password=${encodeURIComponent(adminPassword)}`;
            fetchList(urlWithAuth, 'GET');
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [adminPassword]);

    const handleEdit = (item: EmailSkMapEntry) => {
        setEditingRow({ ...editingRow, [item.email]: item.sk_preview });
    };

    const handleSave = async (originalEmail: string) => {
        if (!adminPassword || !toastCtx) return;
        const newSk = editingRow[originalEmail];
        // For now, we only support updating SK. Updating email is more complex.
        const payload: AdminUpdatePayload = { email: originalEmail, new_sk: newSk, admin_password: adminPassword };
        try {
            await updateApi(API_PATHS.ADMIN_UPDATE, 'POST', payload);
            toastCtx.showToast('更新成功!', 'success');
            setEditingRow({});
            fetchAccounts();
        } catch (e) { /* error handled by useApi */ }
    };

    const handleDelete = async (email: string) => {
        if (!adminPassword || !toastCtx) return;
        if (!window.confirm(`确定要删除账户 ${email} 吗? 此操作无法撤销。`)) return;
        
        const payload: AdminDeletePayload = { email, admin_password: adminPassword };
        try {
            await deleteApi(API_PATHS.ADMIN_DELETE, 'POST', payload);
            toastCtx.showToast('删除成功!', 'success');
            fetchAccounts();
        } catch (e) { /* error handled by useApi */ }
    };

    const handleAdd = async () => {
        if (!adminPassword || !toastCtx) return;
        if (!newAccount.email || !newAccount.sk) {
            toastCtx.showToast('新账户的邮箱和SK都不能为空。', 'error');
            return;
        }
        const payload: AdminAddPayload = { ...newAccount, admin_password: adminPassword };
        try {
            await addApi(API_PATHS.ADMIN_ADD, 'POST', payload);
            toastCtx.showToast('添加成功!', 'success');
            setNewAccount({ email: '', sk: '' });
            fetchAccounts();
        } catch (e) { /* error handled by useApi */ }
    };

    const isLoading = listLoading || addLoading || updateLoading || deleteLoading;

    return (
        <div id="admin-tab-panel-manage" role="tabpanel" aria-labelledby="admin-tab-manage" className="admin-action-section">
            {isLoading && <LoadingIndicator />}
            {listError && <p className="error-message">{listError}</p>}
            <div className="account-table">
                <div className="account-table-header">
                    <span>Email</span>
                    <span>Session Key (SK)</span>
                    <span>Actions</span>
                </div>
                {accountList?.map(item => (
                    <div key={item.email} className="account-table-row">
                        <input type="text" value={item.email} disabled />
                        <input 
                            type="text" 
                            value={editingRow[item.email] !== undefined ? editingRow[item.email] : item.sk_preview} 
                            disabled={editingRow[item.email] === undefined}
                            onChange={(e) => setEditingRow({...editingRow, [item.email]: e.target.value})}
                        />
                        <div className="action-buttons">
                            {editingRow[item.email] !== undefined ? (
                                <button onClick={() => handleSave(item.email)}>保存</button>
                            ) : (
                                <button onClick={() => handleEdit(item)}>编辑</button>
                            )}
                            <button onClick={() => handleDelete(item.email)} className="danger">删除</button>
                        </div>
                    </div>
                ))}
                <div className="account-table-row add-new-row">
                    <input 
                        type="text" 
                        placeholder="new-user@example.com" 
                        value={newAccount.email}
                        onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="sk-ant-session-..."
                        value={newAccount.sk}
                        onChange={(e) => setNewAccount({...newAccount, sk: e.target.value})}
                    />
                    <div className="action-buttons">
                        <button onClick={handleAdd} disabled={!newAccount.email || !newAccount.sk}>+</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountManagementTab;