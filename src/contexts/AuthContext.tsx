import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { WorkerUrlContext } from './WorkerUrlContext';
import { ToastContext } from './ToastContext';

interface AuthContextType {
    adminPassword: string;
    isAdminAuthenticated: boolean;
    tempAdminPassword: string;
    setTempAdminPassword: (password: string) => void;
    login: (passwordToTry: string) => Promise<boolean>;
    logout: () => void;
    authLoading: boolean;
    authError: string | null;
    clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const workerUrlCtx = useContext(WorkerUrlContext);
    const toastCtx = useContext(ToastContext);

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

    const login = useCallback(async (passwordToTry: string): Promise<boolean> => {
        const showToast = toastCtx?.showToast;
        if (!showToast) return false;

        if (!workerUrlCtx?.workerUrl) {
            showToast("Worker URL not configured.", "error");
            return false;
        }
        setAuthLoading(true);
        setAuthError(null);
        if (!passwordToTry) {
            showToast("请输入管理员密码。", "error");
            setAuthLoading(false);
            setAuthError("请输入管理员密码。");
            return false;
        }
        try {
            const response = await fetch(`${workerUrlCtx.workerUrl.replace(/\/$/, '')}/api/admin/list?admin_password=${encodeURIComponent(passwordToTry)}`, {
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
    }, [workerUrlCtx?.workerUrl, toastCtx]);

    const logout = useCallback(() => {
        setAdminPasswordState('');
        setTempAdminPassword('');
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('adminPassword');
        toastCtx?.showToast("已退出管理员登录。", "success");
    }, [toastCtx?.showToast]);

    const clearAuthError = () => setAuthError(null);

    const contextValue = {
        adminPassword,
        isAdminAuthenticated,
        tempAdminPassword,
        setTempAdminPassword,
        login,
        logout,
        authLoading,
        authError,
        clearAuthError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};