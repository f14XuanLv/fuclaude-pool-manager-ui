import React, { useState, useEffect, useMemo, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { EmailSkMapEntry, AdminAddPayload, AdminUpdatePayload, AdminDeletePayload, AdminBatchPayload, AdminBatchApiResponse, AdminBatchAction, AdminApiResponse } from '../../types';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ToastContext } from '../../contexts/ToastContext';
import { API_PATHS } from '../../utils/apiConstants';
import LoadingIndicator from '../LoadingIndicator';

const AccountManagementTab: React.FC = () => {
    const { callApi: fetchList, data: accountList, isLoading: listLoading, error: listError } = useApi<{ admin_password: string }, EmailSkMapEntry[]>();
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
            fetchList(API_PATHS.ADMIN_LIST, 'POST', { admin_password: adminPassword });
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [adminPassword]);

    const filteredList = useMemo(() => {
        if (!accountList) return [];
        return accountList.filter((item: EmailSkMapEntry) => item.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [accountList, searchTerm]);

    const handleEdit = (item: EmailSkMapEntry) => {
        const currentlyEditingEmail = Object.keys(editingRow)[0];
        if (currentlyEditingEmail && currentlyEditingEmail !== item.email) {
            const shouldSave = window.confirm(`'${currentlyEditingEmail}' 正在被编辑。您想保存更改吗？\n\n点击 "确定" 保存并切换。\n点击 "取消" 放弃更改并切换。`);
            if (shouldSave) {
                handleSave(currentlyEditingEmail);
            }
        }
        setEditingRow({ [item.email]: { email: item.email, sk: item.sk_preview } });
    };

    const handleCancel = () => {
        setEditingRow({});
    };

    const handleSave = async (originalEmail: string) => {
        if (!adminPassword || !toastCtx) return;
        const editedAccount = editingRow[originalEmail];
        if (!editedAccount) return;

        const originalItem = accountList?.find(acc => acc.email === originalEmail);
        const isEmailChanged = editedAccount.email !== originalEmail;
        const isSkChanged = originalItem ? editedAccount.sk !== originalItem.sk_preview : true;

        if (!isEmailChanged && !isSkChanged) {
            toastCtx.showToast('没有检测到任何更改。', 'info');
            setEditingRow({});
            return;
        }

        const payload: AdminUpdatePayload = {
            email: originalEmail,
            admin_password: adminPassword,
            ...(isEmailChanged && { new_email: editedAccount.email }),
            ...(isSkChanged && { new_sk: editedAccount.sk }),
        };
        
        if (!payload.new_email && !payload.new_sk) {
            toastCtx.showToast('没有更改，已取消操作。', 'info');
            setEditingRow({});
            return;
        }

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

        const actions: AdminBatchAction[] = Array.from(selectedEmails).map(email => ({ action: 'delete', email: email as string }));
        const payload: AdminBatchPayload = { actions, admin_password: adminPassword };

        try {
            await batchDeleteApi(API_PATHS.ADMIN_BATCH, 'POST', payload);
            toastCtx.showToast(`${selectedEmails.size} 个账户删除成功!`, 'success');
            setSelectedEmails(new Set());
            fetchAccounts();
        } catch (e) { /* error handled by useApi */ }
    };
    
    const handleSelectionChange = (email: string, isSelected: boolean) => {
        setSelectedEmails((prev: Set<string>) => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(email);
            else newSet.delete(email);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedEmails.size === filteredList.length) setSelectedEmails(new Set());
        else setSelectedEmails(new Set(filteredList.map((item: EmailSkMapEntry) => item.email)));
    };

    const handleSelectInvert = () => {
        const currentSelection = new Set(selectedEmails);
        const allVisibleEmails = new Set(filteredList.map((item: EmailSkMapEntry) => item.email));
        allVisibleEmails.forEach(email => {
            const emailStr = email as string;
            if (currentSelection.has(emailStr)) {
                currentSelection.delete(emailStr);
            } else {
                currentSelection.add(emailStr);
            }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                {filteredList.map((item: EmailSkMapEntry) => (
                    <div key={item.email} className="account-table-row">
                        <input type="checkbox" checked={selectedEmails.has(item.email)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectionChange(item.email, e.target.checked)} />
                        <input
                            type="text"
                            value={editingRow[item.email]?.email ?? item.email}
                            disabled={!editingRow[item.email]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRow({...editingRow, [item.email]: {...editingRow[item.email], email: e.target.value}})}
                        />
                        <input
                            type="text"
                            value={editingRow[item.email]?.sk ?? item.sk_preview}
                            disabled={!editingRow[item.email]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRow({...editingRow, [item.email]: {...editingRow[item.email], sk: e.target.value}})}
                        />
                        <div className="action-buttons">
                            {editingRow[item.email] ? (
                                <>
                                    <button onClick={() => handleSave(item.email)}>保存</button>
                                    <button onClick={handleCancel} className="cancel">取消</button>
                                </>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccount({...newAccount, email: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="sk-ant-session-..."
                        value={newAccount.sk}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccount({...newAccount, sk: e.target.value})}
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