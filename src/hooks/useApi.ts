
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
    async (endpoint: string, method: string = 'GET', body?: T): Promise<R> => {
      if (!workerUrl) {
        const err = new Error("Worker URL is not configured yet.");
        setApiState({ data: null, isLoading: false, error: err.message });
        // Do not show toast here, as this is an expected initial state
        return Promise.reject(err);
      }

      setApiState({ data: null, isLoading: true, error: null });
      const url = `${workerUrl.replace(/\/$/, '')}${endpoint}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

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

  return { ...apiState, callApi, clearError: () => setApiState((prev: ApiState<R>) => ({...prev, error: null})) };
}

export default useApi;