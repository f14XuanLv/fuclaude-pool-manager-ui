
import { useState, useCallback, useContext } from 'react';
import { WorkerUrlContext } from '../contexts/WorkerUrlContext';
import { ToastContext } from '../contexts/ToastContext';

interface ApiState<R> {
  data: R | null;
  isLoading: boolean;
  error: string | null;
}

// Ensure T includes potential admin_password if it's an admin payload
function useApi<T = any, R = any>() {
  const workerUrlCtx = useContext(WorkerUrlContext);
  const toastCtx = useContext(ToastContext);

  if (!workerUrlCtx || !toastCtx) {
    throw new Error('useApi must be used within WorkerUrlProvider and ToastProvider');
  }
  const { workerUrl } = workerUrlCtx;
  const { showToast } = toastCtx;

  const [apiState, setApiState] = useState<ApiState<R>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const callApi = useCallback(
    async (endpoint: string, method: string = 'GET', body?: T, adminPassword?: string, isAdminGetList: boolean = false): Promise<R> => {
      setApiState({ data: null, isLoading: true, error: null });
      let url = `${workerUrl.replace(/\/$/, '')}${endpoint}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      // For GET /api/admin/list, adminPassword is a query parameter
      if (isAdminGetList && endpoint.startsWith('/api/admin/list') && method === 'GET') {
        if (!adminPassword) {
            const err = new Error("管理员密码未设置 (for list)");
            setApiState({ data: null, isLoading: false, error: err.message });
            showToast(err.message, "error");
            throw err;
        }
        url += `?admin_password=${encodeURIComponent(adminPassword)}`;
      } 
      // For other admin non-GET requests, check if adminPassword is provided (it should be part of the body by calling components now)
      else if (endpoint.startsWith('/api/admin/') && method !== 'GET') {
        if (!adminPassword) { // This is an upfront check. The password should be in `body`.
            const err = new Error("管理员密码未设置为参数 (for action)");
            setApiState({ data: null, isLoading: false, error: err.message });
            showToast(err.message, "error");
            throw err;
        }
        // The admin_password is now expected to be part of the `body` by the calling component,
        // as per the stricter types (e.g., AdminAddPayload now requires admin_password).
        // So, no need to inject it here:
        // if (body && typeof body === 'object' && !(body as any).admin_password) {
        //   (body as any).admin_password = adminPassword; // No longer needed
        // } else if (!body && adminPassword) {
        //   body = { admin_password: adminPassword } as T; // No longer needed
        // }
      }

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || `请求失败，状态码: ${response.status}`);
        }
        setApiState({ data: responseData, isLoading: false, error: null });
        return responseData;
      } catch (err: any) {
        setApiState({ data: null, isLoading: false, error: err.message });
        showToast(err.message, "error");
        throw err;
      }
    },
    [workerUrl, showToast]
  );

  return { ...apiState, callApi, clearError: () => setApiState(prev => ({...prev, error: null})) };
}

export default useApi;