import React, { useState, useEffect, useMemo, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { EmailSkMapEntry, AdminAddPayload, AdminUpdatePayload, AdminDeletePayload, AdminBatchPayload, AdminBatchApiResponse, AdminBatchAction, AdminApiResponse } from '../../types';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ToastContext } from '../../contexts/ToastContext';
import { API_PATHS } from '../../utils/apiConstants';
import LoadingIndicator from '../LoadingIndicator';

const AccountManagementTab: React.FC = () => {
    const { callApi: fetchList, data: accountList, isLoading: listLoading, error: listError } = useApi<null, EmailSkMapEntry[]>();
    const { callApi: addApi, isLoading: addLoading } = useApi<AdminAddPayload, AdminApiResponse>();
    const { callApi: updateApi, isLoading: updateLoading } = useApi<AdminUpdatePayload, AdminApiResponse>();
    const { callApi: batchDeleteApi, isLoading: deleteLoading } = useApi<AdminBatchPayload, AdminBatchApiResponse>();
    
    const { adminPassword } = useAdminAuth();
    const toastCtx = useContext(ToastContext);

    const [editingRow, setEditingRow] = useState<Record<string, { email: string; sk: string }>>({});
    const [newAccount, setNewAccount] = useState({ email: '', sk: '' });
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAccounts = () => {
        if (adminPassword) {
            const urlWithAuth = `${API_PATHS.ADMIN_LIST}?admin_password=${encodeURIComponent(adminPassword)}`;
            fetchList(urlWithAuth, 'GET');
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [adminPassword]);

    const filteredList = useMemo(() => {
        if (!accountList) return [];
        return accountList.filter(item => item.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [accountList, searchTerm]);

    const handleEdit = (item: EmailSkMapEntry) => {
        setEditingRow({ ...editingRow, [item.email]: { email: item.email, sk: item.sk_preview } });
    };

    const handleSave = async (originalEmail: string) => {
        if (!adminPassword || !toastCtx) return;
        const editedAccount = editingRow[originalEmail];
        const payload: AdminUpdatePayload = { 
            email: originalEmail, 
            new_email: editedAccount.email !== originalEmail ? editedAccount.email : undefined,
            new_sk: editedAccount.sk, // Always send SK for update
            admin_password: adminPassword 
        };
        try {
            await updateApi(API_PATHS.ADMIN_UPDATE, 'POST', payload);
            toastCtx.showToast('更新成功!', 'success');
            setEditingRow({});
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

    const handleBatchDelete = async () => {
        if (selectedEmails.size === 0) {
            toastCtx?.showToast("请至少选择一个要删除的账户。", "error");
            return;
        }
        if (!window.confirm(`确定要删除选中的 ${selectedEmails.size} 个账户吗? 此操作无法撤销。`)) return;
        if (!adminPassword || !toastCtx) return;

        const actions: AdminBatchAction[] = Array.from(selectedEmails).map(email => ({ action: 'delete', email }));
        const payload: AdminBatchPayload = { actions, admin_password: adminPassword };

        try {
            await batchDeleteApi(API_PATHS.ADMIN_BATCH, 'POST', payload);
            toastCtx.showToast(`${selectedEmails.size} 个账户删除成功!`, 'success');
            setSelectedEmails(new Set());
            fetchAccounts();
        } catch (e) { /* error handled by useApi */ }
    };
    
    const handleSelectionChange = (email: string, isSelected: boolean) => {
        setSelectedEmails(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(email);
            else newSet.delete(email);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedEmails.size === filteredList.length) setSelectedEmails(new Set());
        else setSelectedEmails(new Set(filteredList.map(item => item.email)));
    };

    const handleSelectInvert = () => {
        const currentSelection = new Set(selectedEmails);
        const allVisibleEmails = new Set(filteredList.map(item => item.email));
        allVisibleEmails.forEach(email => {
            if (currentSelection.has(email)) currentSelection.delete(email);
            else currentSelection.add(email);
        });
        setSelectedEmails(currentSelection);
    };

    const isLoading = listLoading || addLoading || updateLoading || deleteLoading;

    return (
        <div id="admin-tab-panel-manage" role="tabpanel" aria-labelledby="admin-tab-manage" className="admin-action-section">
            <div className="account-management-controls">
                <input
                    type="text"
                    placeholder="按邮箱搜索..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button onClick={handleSelectAll}>{selectedEmails.size === filteredList.length && filteredList.length > 0 ? '全不选' : '全选'}</button>
                <button onClick={handleSelectInvert}>反选</button>
                <button onClick={handleBatchDelete} disabled={deleteLoading || selectedEmails.size === 0} className="danger">
                    {deleteLoading ? '删除中...' : `删除选中 (${selectedEmails.size})`}
                </button>
            </div>

            {listLoading && <LoadingIndicator />}
            {listError && <p className="error-message">{listError}</p>}
            
            <div className="account-table">
                <div className="account-table-header">
                    <input type="checkbox" readOnly style={{visibility: 'hidden'}} />
                    <span>Email</span>
                    <span>Session Key (SK)</span>
                    <span>Actions</span>
                </div>
                {filteredList.map(item => (
                    <div key={item.email} className="account-table-row">
                        <input type="checkbox" checked={selectedEmails.has(item.email)} onChange={e => handleSelectionChange(item.email, e.target.checked)} />
                        <input 
                            type="text" 
                            value={editingRow[item.email]?.email ?? item.email} 
                            disabled={!editingRow[item.email]}
                            onChange={(e) => setEditingRow({...editingRow, [item.email]: {...editingRow[item.email], email: e.target.value}})}
                        />
                        <input 
                            type="text" 
                            value={editingRow[item.email]?.sk ?? item.sk_preview} 
                            disabled={!editingRow[item.email]}
                            onChange={(e) => setEditingRow({...editingRow, [item.email]: {...editingRow[item.email], sk: e.target.value}})}
                        />
                        <div className="action-buttons">
                            {editingRow[item.email] ? (
                                <button onClick={() => handleSave(item.email)}>保存</button>
                            ) : (
                                <button onClick={() => handleEdit(item)}>编辑</button>
                            )}
                        </div>
                    </div>
                ))}
                <div className="account-table-row add-new-row">
                    <input type="checkbox" disabled style={{visibility: 'hidden'}} />
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