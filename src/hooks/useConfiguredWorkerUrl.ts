
import { useState, useEffect } from 'react';

const EXAMPLE_WORKER_URL = 'https://<your-worker-name>.<your-account-id>.workers.dev';

const useConfiguredWorkerUrl = () => {
  // Start with null, indicating the URL is not yet determined.
  const [determinedInitialUrl, setDeterminedInitialUrl] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check localStorage (user override)
    const storedUrl = localStorage.getItem('workerUrl');
    if (storedUrl && storedUrl !== EXAMPLE_WORKER_URL) {
      setDeterminedInitialUrl(storedUrl);
      return;
    }

    // 2. Check Vite environment variable (VITE_WORKER_URL)
    const viteEnvUrl = import.meta.env.VITE_WORKER_URL;
    if (viteEnvUrl && (viteEnvUrl.startsWith('http://') || viteEnvUrl.startsWith('https://'))) {
      setDeterminedInitialUrl(viteEnvUrl);
      localStorage.setItem('workerUrl', viteEnvUrl); // Persist if found
      return;
    }

    // 3. Check window preconfigured URL (from index.html script)
    const preconfiguredUrlFromWindow = (window as any).__PRECONFIGURED_WORKER_URL__;
    if (
      preconfiguredUrlFromWindow &&
      preconfiguredUrlFromWindow !== '%%PLACEHOLDER_WORKER_URL%%' &&
      (preconfiguredUrlFromWindow.startsWith('http://') || preconfiguredUrlFromWindow.startsWith('https://'))
    ) {
      setDeterminedInitialUrl(preconfiguredUrlFromWindow);
      localStorage.setItem('workerUrl', preconfiguredUrlFromWindow); // Persist if found
      return;
    }
    
    // 4. If nothing is found, set it to the example URL so the user can configure it.
    setDeterminedInitialUrl(EXAMPLE_WORKER_URL);
    // Also save the example to local storage so it doesn't run this logic again.
    localStorage.setItem('workerUrl', EXAMPLE_WORKER_URL);

  }, []); // Runs once on mount

  return { initialWorkerUrl: determinedInitialUrl, exampleWorkerUrl: EXAMPLE_WORKER_URL };
};

export default useConfiguredWorkerUrl;