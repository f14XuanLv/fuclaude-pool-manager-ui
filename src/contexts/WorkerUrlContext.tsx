
import React, { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import useConfiguredWorkerUrl from '../hooks/useConfiguredWorkerUrl';

interface WorkerUrlContextType {
  workerUrl: string | null; // Allow null
  setWorkerUrl: (url: string) => void;
  exampleWorkerUrl: string;
}

export const WorkerUrlContext = createContext<WorkerUrlContextType | undefined>(undefined);

export const WorkerUrlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { initialWorkerUrl, exampleWorkerUrl } = useConfiguredWorkerUrl();
  const [currentWorkerUrl, setCurrentWorkerUrl] = useState<string | null>(initialWorkerUrl);

  useEffect(() => {
    if (initialWorkerUrl) {
      setCurrentWorkerUrl(initialWorkerUrl);
    }
  }, [initialWorkerUrl]);

  const handleSetWorkerUrl = (newUrl: string) => {
    const urlToSet = newUrl.trim() === '' ? exampleWorkerUrl : newUrl;
    localStorage.setItem('workerUrl', urlToSet);
    setCurrentWorkerUrl(urlToSet);
  };

  return (
    <WorkerUrlContext.Provider value={{ workerUrl: currentWorkerUrl, setWorkerUrl: handleSetWorkerUrl, exampleWorkerUrl }}>
      {children}
    </WorkerUrlContext.Provider>
  );
};