
import React, { useState, useContext, useEffect } from 'react';
import { WorkerUrlContext } from '../contexts/WorkerUrlContext';
import { ToastContext } from '../contexts/ToastContext';

interface ConfigPanelProps {
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onClose }) => {
  const workerUrlCtx = useContext(WorkerUrlContext);
  const toastCtx = useContext(ToastContext);

  if (!workerUrlCtx || !toastCtx) {
    throw new Error('ConfigPanel must be used within WorkerUrlProvider and ToastProvider');
  }

  const { workerUrl, setWorkerUrl, exampleWorkerUrl } = workerUrlCtx;
  const { showToast } = toastCtx;
  const [tempUrl, setTempUrl] = useState(workerUrl);

  useEffect(() => {
    setTempUrl(workerUrl); 
  }, [workerUrl]);

  const handleSave = () => {
    if (tempUrl.trim() === '') {
      showToast('Worker URL 不能为空', 'error');
      return;
    }
    if (!tempUrl.startsWith('http://') && !tempUrl.startsWith('https://')) {
      showToast('Worker URL 必须以 http:// 或 https:// 开头', 'error');
      return;
    }
    setWorkerUrl(tempUrl); 
    showToast('Worker URL 已保存!', 'success');
    onClose();
  };

  return (
    <div className="config-panel" role="dialog" aria-labelledby="config-panel-title" aria-modal="true">
      <h3 id="config-panel-title">服务配置</h3>
      <div className="form-group">
        <label htmlFor="workerUrlInput">Worker 服务地址 (WORKER_URL):</label>
        <input
          type="text"
          id="workerUrlInput"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          placeholder={exampleWorkerUrl}
          aria-describedby="workerUrlHint1 workerUrlHint2"
        />
      </div>
      <p id="workerUrlHint1" className="hint">
        您可以在 Cloudflare 中为此 Worker 配置自定义域名，并在此处填入。例如: `https://claude-pool.yourdomain.com`
      </p>
      <p id="workerUrlHint2" className="hint">
        对于Vite部署 (如Vercel), 推荐设置环境变量 `VITE_WORKER_URL` 来预设此值。
      </p>
      <div className="config-panel-actions">
        <button onClick={handleSave}>
          保存URL
        </button>
        <button onClick={onClose} className="secondary">关闭</button>
      </div>
    </div>
  );
};

export default ConfigPanel;