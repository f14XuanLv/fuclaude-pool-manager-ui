import { useState, useEffect, useCallback, useContext } from 'react';
import { WorkerUrlContext } from '../contexts/WorkerUrlContext';
import { ToastContext } from '../contexts/ToastContext';


export const useAdminAuth = () => {
    const workerUrlCtx = useContext(WorkerUrlContext);
    const toastCtx = useContext(ToastContext);

    if (!workerUrlCtx || !toastCtx) {
        throw new Error('useAdminAuth must be used within WorkerUrlProvider and ToastProvider');
    }
    const { workerUrl } = workerUrlCtx;
    const { showToast } = toastCtx;

    const [adminPassword, setAdminPasswordState] = useState<string>(() => sessionStorage.getItem('adminPassword') || '');
    const [tempAdminPassword, setTempAdminPassword] = useState<string>('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(!!sessionStorage.getItem('adminPassword'));
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        if (isAdminAuthenticated) {
            sessionStorage.setItem('adminPassword', adminPassword);
        } else {
            sessionStorage.removeItem('adminPassword');
        }
    }, [isAdminAuthenticated, adminPassword]);

    const login = useCallback(async (passwordToTry: string) => {
        setAuthLoading(true);
        setAuthError(null);
        if (!passwordToTry) {
            showToast("请输入管理员密码。", "error");
            setAuthLoading(false);
            setAuthError("请输入管理员密码。");
            return false;
        }
        try {
            const response = await fetch(`${workerUrl.replace(/\/$/, '')}/api/admin/list?admin_password=${encodeURIComponent(passwordToTry)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `认证失败: ${response.status}`);
            }
            setAdminPasswordState(passwordToTry);
            setIsAdminAuthenticated(true);
            showToast("管理员登录成功!", "success");
            setAuthLoading(false);
            return true;
        } catch (err: any) {
            setIsAdminAuthenticated(false);
            showToast(err.message || "管理员密码错误或请求失败。", "error");
            setAuthLoading(false);
            setAuthError(err.message || "管理员密码错误或请求失败。");
            return false;
        }
    }, [workerUrl, showToast]);

    const logout = useCallback(() => {
        setAdminPasswordState('');
        setTempAdminPassword('');
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('adminPassword');
        showToast("已退出管理员登录。", "success");
    }, [showToast]);

    return {
        adminPassword,
        isAdminAuthenticated,
        tempAdminPassword,
        setTempAdminPassword,
        login,
        logout,
        authLoading,
        authError,
        clearAuthError: () => setAuthError(null),
    };
};
