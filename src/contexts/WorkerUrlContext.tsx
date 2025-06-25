
import React, { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import useConfiguredWorkerUrl from '../hooks/useConfiguredWorkerUrl';

interface WorkerUrlContextType {
  workerUrl: string;
  setWorkerUrl: Dispatch<SetStateAction<string>>; // Technically, this will be our custom setter
  exampleWorkerUrl: string;
}

export const WorkerUrlContext = createContext<WorkerUrlContextType | undefined>(undefined);

export const WorkerUrlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { initialWorkerUrl, exampleWorkerUrl } = useConfiguredWorkerUrl();
  const [currentWorkerUrl, setCurrentWorkerUrl] = useState<string>(initialWorkerUrl);

  // Update context state if the initialWorkerUrl (determined by the hook) changes after mount
  // This can happen if localStorage had a different value initially than what hook determined later
  useEffect(() => {
    setCurrentWorkerUrl(initialWorkerUrl);
  }, [initialWorkerUrl]);

  const handleSetWorkerUrl = (newUrlOrUpdater: SetStateAction<string>) => {
    setCurrentWorkerUrl(prevUrl => {
      const newUrl = typeof newUrlOrUpdater === 'function' ? newUrlOrUpdater(prevUrl) : newUrlOrUpdater;
      if (newUrl.trim() === '') {
        // Potentially show a toast or handle error, but for now, prevent setting empty URL
        // Or default to exampleWorkerUrl
        localStorage.setItem('workerUrl', exampleWorkerUrl);
        return exampleWorkerUrl;
      }
      localStorage.setItem('workerUrl', newUrl);
      return newUrl;
    });
  };

  return (
    <WorkerUrlContext.Provider value={{ workerUrl: currentWorkerUrl, setWorkerUrl: handleSetWorkerUrl, exampleWorkerUrl }}>
      {children}
    </WorkerUrlContext.Provider>
  );
};