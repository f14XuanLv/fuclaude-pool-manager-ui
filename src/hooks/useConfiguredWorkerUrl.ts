
import { useState, useEffect } from 'react';

const EXAMPLE_WORKER_URL = 'https://<your-worker-name>.<your-account-id>.workers.dev';

const useConfiguredWorkerUrl = () => {
  const [determinedInitialUrl, setDeterminedInitialUrl] = useState<string>(EXAMPLE_WORKER_URL);

  useEffect(() => {
    let urlToUse = EXAMPLE_WORKER_URL;

    // 1. Check localStorage (user override)
    const storedUrl = localStorage.getItem('workerUrl');
    // Only use storedUrl if it's not null and not the placeholder example URL
    if (storedUrl && storedUrl !== EXAMPLE_WORKER_URL) {
      urlToUse = storedUrl;
      setDeterminedInitialUrl(urlToUse);
      return;
    }

    // 2. Check Vite environment variable (VITE_WORKER_URL)
    // Safely access import.meta.env
    let viteEnvUrl: string | undefined = undefined;
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      viteEnvUrl = import.meta.env.VITE_WORKER_URL;
    }

    if (viteEnvUrl && (viteEnvUrl.startsWith('http://') || viteEnvUrl.startsWith('https://'))) {
      urlToUse = viteEnvUrl;
      setDeterminedInitialUrl(urlToUse);
      localStorage.setItem('workerUrl', urlToUse); // Persist if found via env var and not in local storage
      return;
    }

    // 3. Check window preconfigured URL (from index.html script)
    const preconfiguredUrlFromWindow = (window as any).__PRECONFIGURED_WORKER_URL__;
    if (
      preconfiguredUrlFromWindow &&
      preconfiguredUrlFromWindow !== '%%PLACEHOLDER_WORKER_URL%%' &&
      (preconfiguredUrlFromWindow.startsWith('http://') || preconfiguredUrlFromWindow.startsWith('https://'))
    ) {
      urlToUse = preconfiguredUrlFromWindow;
      setDeterminedInitialUrl(urlToUse);
      localStorage.setItem('workerUrl', urlToUse); // Persist if found via window and not in local storage
      return;
    }
    
    // If fallback to EXAMPLE_WORKER_URL is used and nothing is in localStorage, set it.
    if (urlToUse === EXAMPLE_WORKER_URL && !localStorage.getItem('workerUrl')) {
        localStorage.setItem('workerUrl', urlToUse);
    }
    setDeterminedInitialUrl(urlToUse);

  }, []); // Runs once on mount

  return { initialWorkerUrl: determinedInitialUrl, exampleWorkerUrl: EXAMPLE_WORKER_URL };
};

export default useConfiguredWorkerUrl;