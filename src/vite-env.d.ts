
interface ImportMetaEnv {
  readonly VITE_WORKER_URL?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}